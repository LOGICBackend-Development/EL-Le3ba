import { t as tr } from "./i18n.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  initializeFirestore, doc, getDoc, setDoc, deleteDoc, runTransaction,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, ADMIN_EMAIL, TEAM_EMAIL_DOMAIN } from "./firebase-config.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
export { firebaseConfig, ADMIN_EMAIL, TEAM_EMAIL_DOMAIN };

/* ---------- defaults ---------- */
export const DEFAULT_SETTINGS = {
  status: "lobby",            // lobby | running | paused | ended
  sets: 1,                    // how many copies of each challenge exist (= max teams per challenge at once)
  challengeMinutes: 12,
  retryMinutes: 2,
  retryPoints: 20,
  leaderboardVisible: true,
  eventTitle: "اللعبة",
  brackets: [
    { upToMin: 4, points: 100 },
    { upToMin: 6, points: 85 },
    { upToMin: 8, points: 70 },
    { upToMin: 10, points: 55 },
    { upToMin: 12, points: 40 },
  ],
};

export const DEFAULT_CHALLENGES = [
  "Gear Up", "Bomb Squad", "Tamasel", "Alex Safe Crackers", "Autobess Complete", "Challenge 6",
].map((name, i) => ({ id: `c${i + 1}`, name, desc: "", order: i + 1, active: true }));

export const TEAM_COLORS = [
  "#ff1e3c", "#f4c430", "#22d37a", "#3aa0ff", "#b157ff", "#ff7a1a", "#00d1c1", "#ff4fa3",
  "#9be15d", "#ffd166", "#5e7cff", "#ef476f",
];

export const teamEmail = (u) => `${String(u).trim().toLowerCase()}@${TEAM_EMAIL_DOMAIN}`;

/* ---------- time & score ---------- */
export function fmt(ms) {
  ms = Math.max(0, ms || 0);
  const s = Math.ceil(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
export function elapsedOf(cur) {
  if (!cur) return 0;
  return (cur.elapsedMs || 0) + (cur.startedAt ? Math.max(0, Date.now() - cur.startedAt) : 0);
}
export function pointsFor(s, attemptMs, attempt) {
  if (attempt > 1) return Number(s.retryPoints) || 0;
  const list = [...(s.brackets || [])].sort((a, b) => a.upToMin - b.upToMin);
  for (const b of list) if (attemptMs <= b.upToMin * 60000) return Number(b.points) || 0;
  return list.length ? Number(list[list.length - 1].points) || 0 : 0;
}
export const rankSort = (a, b) =>
  (b.score || 0) - (a.score || 0) || (a.totalTimeMs || 0) - (b.totalTimeMs || 0) ||
  String(a.username || "").localeCompare(String(b.username || ""));

/* ---------- chunked binary storage in Firestore (free plan has no file storage) ---------- */
const CHUNK = 700000; // base64 chars per doc, safely under 1MB doc limit
export function blobToB64(blob) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1] || "");
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
}
export function b64ToBlob(b64, mime) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}
export async function writeChunks(path, b64, onProgress) {
  const n = Math.max(1, Math.ceil(b64.length / CHUNK));
  let done = 0;
  await Promise.all(Array.from({ length: n }, (_, i) =>
    setDoc(doc(db, `${path}/chunks/${i}`), { d: b64.slice(i * CHUNK, (i + 1) * CHUNK) })
      .then(() => { done++; onProgress && onProgress(done / n); })));
  return n;
}
export async function readChunks(path, n) {
  const parts = await Promise.all(Array.from({ length: n }, (_, i) => getDoc(doc(db, `${path}/chunks/${i}`))));
  return parts.map((p) => (p.exists() ? p.data().d : "")).join("");
}
export async function deleteChunks(path, n, from = 0) {
  await Promise.all(Array.from({ length: Math.max(0, n - from) }, (_, i) =>
    deleteDoc(doc(db, `${path}/chunks/${i + from}`)).catch(() => {})));
}

/* ---------- game logic shared by team + admin ---------- */
export function cleanSlots(slots, uid) {
  const out = {};
  for (const [k, v] of Object.entries(slots || {})) {
    const f = (v || []).filter((x) => x !== uid);
    if (f.length) out[k] = f;
  }
  return out;
}

// Put a team into a free challenge it hasn't played. Never more than `sets` teams per challenge.
export async function allocate(uid, settings, challenges) {
  const active = challenges.filter((c) => c.active !== false);
  return runTransaction(db, async (tx) => {
    const tRef = doc(db, "teams", uid), oRef = doc(db, "state", "occupancy");
    const tS = await tx.get(tRef);
    const oS = await tx.get(oRef);
    const t = tS.data();
    if (!t || t.current || t.finished) return "busy";
    const done = t.done || [];
    const remaining = active.filter((c) => !done.includes(c.id));
    if (!remaining.length) { tx.update(tRef, { finished: true }); return "finished"; }
    const slots = cleanSlots(oS.exists() ? oS.data().slots : {}, uid);
    const cap = Math.max(1, Number(settings.sets) || 1);
    const free = remaining.filter((c) => (slots[c.id] || []).length < cap);
    let pick = null;
    const route = (t.route || []).filter((id) => remaining.some((c) => c.id === id));
    if (route.length) {
      // follow the team's planned route; next planned challenge first
      const planned = remaining.find((c) => c.id === route[0]);
      if (planned && (slots[planned.id] || []).length < cap) pick = planned;
      else if (settings.routeStrict === false && free.length) {
        const pos = (id) => { const i = route.indexOf(id); return i < 0 ? 999 : i; };
        pick = free.slice().sort((a, b) => pos(a.id) - pos(b.id))[0];  // flexible: next free one in route order
      } else return "wait";
    } else {
      if (!free.length) return "wait";
      const minLoad = Math.min(...free.map((c) => (slots[c.id] || []).length));
      const pool = free.filter((c) => (slots[c.id] || []).length === minLoad);
      pick = pool[Math.floor(Math.random() * pool.length)];
    }
    if (!pick) return "wait";
    slots[pick.id] = [...(slots[pick.id] || []), uid];
    tx.set(oRef, { slots });
    tx.update(tRef, {
      current: {
        cid: pick.id, phase: "intro", attempt: 1, elapsedMs: 0, prevElapsedMs: 0, startedAt: null,
        limitMs: (Number(settings.challengeMinutes) || 12) * 60000, pausedBySession: false, submissionId: null,
      },
    });
    return "ok";
  });
}

// Close the team's current challenge (pass or fail) and free its slot.
export async function finishChallenge(uid, { passed, points = 0, totalMs = 0, expectCid = null }) {
  return runTransaction(db, async (tx) => {
    const tRef = doc(db, "teams", uid), oRef = doc(db, "state", "occupancy");
    const tS = await tx.get(tRef);
    const oS = await tx.get(oRef);
    if (!tS.exists()) return false;
    const t = tS.data(), cur = t.current;
    if (!cur || (expectCid && cur.cid !== expectCid)) return false;
    const slots = cleanSlots(oS.exists() ? oS.data().slots : {}, uid);
    const done = Array.from(new Set([...(t.done || []), cur.cid]));
    const upd = {
      current: null, done,
      [`results.${cur.cid}`]: {
        status: passed ? "passed" : "failed", points: passed ? points : 0, timeMs: totalMs, attempt: cur.attempt || 1,
        round: done.length,
      },
    };
    if (passed) {
      upd.score = (t.score || 0) + points;
      upd.totalTimeMs = (t.totalTimeMs || 0) + totalMs;
    }
    tx.update(tRef, upd);
    tx.set(oRef, { slots });
    return true;
  });
}

/* ---------- ui helpers ---------- */
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function toast(msg, type = "") {
  let box = document.getElementById("toasts");
  if (!box) { box = document.createElement("div"); box.id = "toasts"; document.body.appendChild(box); }
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => el.classList.add("out"), 3600);
  setTimeout(() => el.remove(), 4100);
}

let actx;
export function beep(freq = 660, dur = 0.12, vol = 0.12) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    actx.resume();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = "square"; o.frequency.value = freq; g.gain.value = vol;
    o.connect(g); g.connect(actx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
    o.stop(actx.currentTime + dur + 0.02);
  } catch (e) { /* no audio */ }
}

export function compressImage(file, max = 1280, q = 0.72) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? res(b) : rej(new Error("compress failed"))), "image/jpeg", q);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("bad image")); };
    img.src = url;
  });
}

/* ---------- podium + ranking list (team modal + big screen) ---------- */
const initials = (n) => {
  let w = String(n || "؟").trim().split(/\s+/).slice(-1)[0];
  if (w.startsWith("ال") && w.length > 3) w = w.slice(2);
  return [...w][0] || "؟";
};
export function rankingHtml(arr, meId = null, opts = {}) {
  const top = arr.slice(0, 3), rest = arr.slice(3);
  const pod = (t, i) => !t ? `<div class="pod p${i + 1} empty"></div>` : `
    <div class="pod p${i + 1} ${t.id === meId ? "me" : ""}" data-id="${t.id}" style="--c:${t.color || "#8f6be0"}">
      ${i === 0 ? `<span class="crown">👑</span>` : ""}
      <span class="pod-av">${esc(initials(t.name))}</span>
      <b class="pod-name">${esc(t.name)}</b><small class="pod-pts">${tr("{n} نقطة", { n: t.score || 0 })}</small>
      <div class="pod-col"><span>${i + 1}</span></div>
    </div>`;
  const list = rest.map((t, i) => `
    <li data-id="${t.id}" class="${t.id === meId ? "me" : ""}" style="--c:${t.color || "#8f6be0"}">
      <span class="rk">${i + 4}</span><span class="r-av">${esc(initials(t.name))}</span>
      <span class="r-name">${esc(t.name)}${opts.extra ? opts.extra(t) : ""}</span><b class="r-pts">${t.score || 0}</b>
    </li>`).join("");
  return `<div class="podium">${pod(top[1], 1)}${pod(top[0], 0)}${pod(top[2], 2)}</div>
    ${rest.length ? `<ol class="rank-list">${list}</ol>` : ""}`;
}

/* ---------- host photo (uploaded in admin → settings.host) ---------- */
export const DEFAULT_MOUTH = { mx: 0.492, my: 0.432, mw: 0.07 }; // fractions of image size
let hostCache = { ver: null, p: null };
export async function loadHostPhoto(host) {
  if (!host || !host.chunks) return null;
  if (hostCache.ver !== host.ver) {
    const url = await getMediaBlobUrl("media/host", host.chunks, host.mime || "image/jpeg", host.ver);
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    hostCache = { ver: host.ver, p: { url, W: img.naturalWidth, H: img.naturalHeight } };
  }
  const { url, W, H } = hostCache.p;
  const m = { ...DEFAULT_MOUTH, ...host };
  return { url, W, H, mx: m.mx * W, my: m.my * H, mw: m.mw * W };
}

/* ---------- readable login errors ---------- */
export function authErrorText(err, fallback) {
  const c = err?.code || "";
  const map = {
    "auth/invalid-credential": fallback, "auth/wrong-password": fallback, "auth/user-not-found": fallback,
    "auth/invalid-login-credentials": fallback,
    "auth/invalid-email": "Email format is not valid",
    "auth/operation-not-allowed": "Email/Password sign-in is OFF → Firebase → Authentication → Sign-in method → enable Email/Password",
    "auth/unauthorized-domain": `This website (${location.hostname}) isn't allowed → Firebase → Authentication → Settings → Authorized domains → add it`,
    "auth/api-key-not-valid.-please-pass-a-valid-api-key.": "Firebase config is wrong → check js/firebase-config.js",
    "auth/invalid-api-key": "Firebase config is wrong → check js/firebase-config.js",
    "auth/network-request-failed": "No internet connection — try again",
    "auth/too-many-requests": "Too many attempts — wait a minute and try again",
    "auth/user-disabled": "This account is disabled in Firebase",
  };
  return (map[c] ?? fallback) + (c ? `  (${c})` : "");
}

/* ---------- media cache: memory → phone storage (Cache API) → database ---------- */
const memMedia = new Map(), inflight = new Map();
const CACHE_NAME = "le3ba-media-v1";
export async function getMediaBlobUrl(path, n, mime, ver) {
  if (!n) return null;
  const key = `${path}?v=${ver || 0}`;
  if (memMedia.has(key)) return memMedia.get(key);
  if (inflight.has(key)) return inflight.get(key);
  const job = (async () => {
    const req = `https://le3ba.cache/${key}`;
    let blob = null, cache = null;
    try { cache = await caches.open(CACHE_NAME); const hit = await cache.match(req); if (hit) blob = await hit.blob(); } catch { /* no Cache API */ }
    if (!blob) {
      blob = b64ToBlob(await readChunks(path, n), mime);
      try { await cache?.put(req, new Response(blob, { headers: { "Content-Type": mime } })); } catch { /* storage full */ }
    }
    const url = URL.createObjectURL(blob);
    memMedia.set(key, url);
    return url;
  })().finally(() => inflight.delete(key));
  inflight.set(key, job);
  return job;
}

/* ---------- planned routes (Latin-square rotation) ---------- */
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
// Every round each challenge gets at most `sets` teams (when teams ≤ challenges × sets).
export function makeRoutes(teamIds, challengeIds, sets) {
  const C = shuffle(challengeIds), T = shuffle(teamIds), n = C.length, out = {};
  T.forEach((id, k) => { out[id] = Array.from({ length: n }, (_, r) => C[(k + r) % n]); });
  return { routes: out, strict: T.length <= n * Math.max(1, sets) };
}
