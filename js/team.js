import { t as tr } from "./i18n.js";
import {
  auth, db, ADMIN_EMAIL, teamEmail, fmt, elapsedOf, allocate, finishChallenge,
  blobToB64, b64ToBlob, writeChunks, readChunks, esc, toast, beep, compressImage, rankSort, rankingHtml, loadHostPhoto, getMediaBlobUrl,
  authErrorText, claimSlot,
} from "./common.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, getDoc, getDocs, onSnapshot, updateDoc, setDoc, collection, query, orderBy, serverTimestamp,
  runTransaction, getDocFromServer, deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { createAvatar, unlockAudio } from "./avatar.js";

const $ = (s) => document.querySelector(s);
const avatar = createAvatar({ pending: true });
const RING_C = 2 * Math.PI * 90;
const MAX_VIDEO_BYTES = 8 * 1024 * 1024;
const MAX_REC_SEC = 30;

let uid = null, team = null, prevTeam = null, settings = null, challenges = [];
let unsubs = [], occUnsub = null, hbTimer = null, tickTimer = null;
let curKey = null, busyWrite = false, allocating = false, timedOut = false, heard = false, lastBeep = null;
let evidence = null, keepEvidence = null, previewUrl = null;
const audioCache = new Map();

const tRef = () => doc(db, "teams", uid);
const chal = (id) => challenges.find((c) => c.id === id);
const activeChallenges = () => challenges.filter((c) => c.active !== false);

$("#ringFg").style.strokeDasharray = RING_C;

/* ================= AUTH ================= */
// Remote sign-out: the admin can sign every phone out (or one team) — and phones sign out by themselves
// 30 minutes after the game ends, so forgotten phones don't stay online.
const loginAt = () => { try { return Number(localStorage.getItem("le3ba-loginAt")) || 0; } catch { return 0; } };
let kicking = false;
async function kickOut(msg) {
  if (kicking || !uid) return;
  kicking = true;
  const id = uid;
  try { await deleteDoc(doc(db, "presence", id)); } catch { /* ignore */ }
  try { localStorage.removeItem("le3ba-loginAt"); } catch { /* ignore */ }
  try { sessionStorage.clear(); } catch { /* ignore */ }
  await signOut(auth).catch(() => {});
  kicking = false;
  $("#loginErr").textContent = msg;
}
function checkKick() {
  if (!uid) return;
  const at = loginAt();
  if ((settings?.kickAll || 0) > at || (team?.kickAt || 0) > at) { kickOut(tr("المنظّم قفل الجلسة. شكراً إنكم لعبتوا معانا 👋")); return; }
  if (settings?.status === "ended" && settings?.endedAt && Date.now() - settings.endedAt > 30 * 60000) kickOut(tr("اللعبة خلصت — اتعمل خروج تلقائي."));
}
setInterval(checkKick, 60000);
try { const pre = new URLSearchParams(location.search).get("u"); if (pre) { $("#lgUser").value = pre; setTimeout(() => $("#lgPass").focus(), 300); } } catch { /* ignore */ }
function showAdminHint() {
  $("#loginErr").innerHTML = `${esc(tr("ده حساب الأدمن — افتح صفحة admin.html"))}<br><a class="btn btn-ghost btn-sm" style="margin-top:8px" href="admin.html">${esc(tr("افتح صفحة الأدمن"))} →</a>`;
}
$("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("#loginErr").textContent = "";
  const btn = e.submitter; if (btn) btn.disabled = true;
  const who = $("#lgUser").value.trim();
  if (who.toLowerCase() === ADMIN_EMAIL.toLowerCase()) { showAdminHint(); if (btn) btn.disabled = false; return; }
  try { localStorage.setItem("le3ba-loginAt", String(Date.now())); } catch { /* ignore */ }
  try {
    await signInWithEmailAndPassword(auth, teamEmail(who), $("#lgPass").value.trim());
  } catch (err) {
    console.error(err);
    $("#loginErr").textContent = authErrorText(err, tr("اسم المستخدم أو الباسورد غلط"));
  } finally { if (btn) btn.disabled = false; }
});
$("#btnLogout").onclick = async () => { if (confirm(tr("متأكدين إنكم عايزين تخرجوا؟"))) await signOut(auth); };

onAuthStateChanged(auth, async (u) => {
  teardown();
  if (!u) { $("#topbar").hidden = true; show("login"); return; }
  if (u.email === ADMIN_EMAIL) {
    // Admin is signed in on this browser: never sign them out from the team page.
    $("#topbar").hidden = true; show("login"); showAdminHint();
    return;
  }
  const snap = await getDoc(doc(db, "teams", u.uid)).catch(() => null);
  if (!snap || !snap.exists()) {
    await signOut(auth);
    $("#loginErr").textContent = "الحساب ده مش متسجل كفريق";
    return;
  }
  uid = u.uid;
  $("#topbar").hidden = false;
  unsubs.push(onSnapshot(doc(db, "settings", "game"), { includeMetadataChanges: true }, (s) => {
    live = !s.metadata.fromCache;
    const ng = s.exists() ? s.data() : null;
    if (JSON.stringify(ng) === JSON.stringify(settings)) return;
    settings = ng; applyHost(); render(); checkKick();
  }));
  unsubs.push(onSnapshot(tRef(), { includeMetadataChanges: true }, (s) => {
    live = !s.metadata.fromCache;
    const nt = s.data() || null;
    if (JSON.stringify(nt) === JSON.stringify(team)) return;
    prevTeam = team; team = nt; announce(); render(); checkKick();
  }));
  unsubs.push(onSnapshot(query(collection(db, "challenges"), orderBy("order")), (s) => {
    challenges = s.docs.map((d) => ({ id: d.id, ...d.data() })); render();
    if (introPending && curKey && curKey.startsWith("intro")) setupIntro();
    setTimeout(preloadMedia, 1200);
  }));
  heartbeat();
  hbTimer = setInterval(heartbeat, 120000);
});

function teardown() {
  unsubs.forEach((f) => f()); unsubs = [];
  leave();
  clearInterval(hbTimer); hbTimer = null;
  uid = null; team = null; prevTeam = null; settings = null; challenges = []; curKey = null;
  $("#pausedOverlay").hidden = true;
}

let hostKey = null;
async function applyHost() {
  const h = settings?.host, L = settings?.loops || {};
  const hasLoops = !!(L.idleChunks && L.talkChunks);
  const key = hasLoops ? `L|${L.idleVer}|${L.talkVer}|${L.fx}|${L.fy}` : h?.chunks ? `${h.ver}|${h.mx}|${h.my}|${h.mw}` : "none";
  if (key === hostKey) return;
  if (!$("#theater").hidden) return; // don't swap while talking
  hostKey = key;
  try {
    if (hasLoops) {
      const [idle, talk] = await Promise.all(["idle", "talk"].map((k) =>
        getMediaBlobUrl(`media/loop_${k}`, L[`${k}Chunks`], L[`${k}Mime`] || "video/mp4", L[`${k}Ver`])));
      avatar.setLoops({ idle, talk, fx: L.fx, fy: L.fy });
    } else {
      const ph = h?.chunks ? await loadHostPhoto(h) : null;   // stays on the loading frame until ready
      avatar.setLoops(null);
      avatar.setPhoto(ph);
    }
  } catch (e) { console.error(e); hostKey = null; avatar.setPhoto(null); }   // fall back to the drawn host
}

function heartbeat() {
  if (!uid) return;
  setDoc(doc(db, "presence", uid), { lastSeen: serverTimestamp(), name: team?.name || "" }, { merge: true }).catch(() => {});
}
document.addEventListener("visibilitychange", () => { if (!document.hidden) heartbeat(); });

/* ================= NOTIFICATIONS FOR THE TEAM ================= */
function announce() {
  if (!prevTeam || !team) return;
  const pr = prevTeam.results || {}, nr = team.results || {};
  for (const [cid, r] of Object.entries(nr)) {
    if (pr[cid]) continue;
    const name = chal(cid)?.name || "";
    showResult(r.status === "passed", r.points || 0, name);
  }
  const pc = prevTeam.current, nc = team.current;
  if (pc && nc && pc.cid === nc.cid && pc.queued && !nc.queued) {
    toast(tr("✅ المحطة فضيت! تقدروا تبدأوا"), "good");
    [660, 880, 1100].forEach((f, i) => setTimeout(() => beep(f, 0.12, 0.18), i * 140));
    navigator.vibrate?.([150, 80, 150]);
  }
  if (pc && nc && pc.phase === "pending" && nc.phase === "retry" && pc.cid === nc.cid) {
    toast("الدليل اترفض ❌ معاكم فرصة أخيرة", "warn"); beep(330, 0.3);
  }
}

/* ================= STATE MACHINE ================= */
function show(name) {
  document.querySelectorAll(".screen").forEach((s) => { s.hidden = s.id !== `scr-${name}`; });
  window.scrollTo(0, 0);
}

function render() {
  if (!team) return;
  $("#tName").textContent = team.name || "";
  $("#tScore").textContent = team.score || 0;
  $("#tDone").textContent = `${(team.done || []).length}/${activeChallenges().length || 6}`;
  if (!settings) { go("lobby"); return; }
  $("#btnBoard").hidden = !settings.leaderboardVisible;
  if (!settings.leaderboardVisible) $("#lbModal").hidden = true;
  const st = settings.status;
  if (st === "ended") { $("#pausedOverlay").hidden = true; go("ended"); return; }
  if (st === "lobby") { $("#pausedOverlay").hidden = true; go("lobby"); return; }
  $("#pausedOverlay").hidden = st !== "paused";
  syncPause(st);
  if (team.finished) { go("done"); return; }
  let cur = team.current;
  if (cur && (!cur.phase || !cur.cid)) {           // broken half-state → repair
    updateDoc(tRef(), { current: null }).catch(console.error);
    cur = null;
  }
  if (!cur) { go("wait"); return; }
  go(cur.phase, `${cur.phase}|${cur.cid}|${cur.attempt}`);
}

function go(name, key = name) {
  if (key !== curKey) {
    leave();
    curKey = key;
    show(name);
    enter(name);
  }
  refresh(name);
}

let waitTimer = null;
function leave() {
  clearInterval(tickTimer); tickTimer = null;
  clearInterval(waitTimer); waitTimer = null;
  stopAuto();
  if (occUnsub) { occUnsub(); occUnsub = null; }
  closeTheater();
  avatar.stop();
}

function mountAvatar(sel) { avatar.setMode("card"); $(sel).appendChild(avatar.el); }

function enter(name) {
  switch (name) {
    case "lobby": mountAvatar("#avLobby"); setTimeout(autoWelcome, 600); break;
    case "wait":
      $("#waitMsg").textContent = "بنجهزلكم التحدي الجاي";
      occUnsub = onSnapshot(doc(db, "state", "occupancy"), () => setTimeout(tryAllocate, Math.random() * 400));
      waitTimer = setInterval(tryAllocate, 6000);   // don't rely only on live updates (mobile data)
      break;
    case "intro":
      setupIntro();
      occUnsub = onSnapshot(doc(db, "state", "occupancy"), (snap) => { occNow = snap.data() || {}; showInside(); setTimeout(tryClaim, Math.random() * 300); });
      waitTimer = setInterval(claimCheck, 5000);
      break;
    case "playing": setupPlaying(); break;
    case "retry":
      $("#retryName").textContent = chal(team.current.cid)?.name || "";
      $("#retryMin").textContent = settings.retryMinutes || 2;
      mountAvatar("#avRetry");
      break;
    default: break;
  }
}

function refresh(name) {
  switch (name) {
    case "lobby": $("#lobbyTeam").textContent = team.name || ""; refreshWelcome(); break;
    case "wait": tryAllocate(); break;
    case "intro": setTitles(); updateStartBtn(); showInside(); break;
    case "retry": setTitles(); $("#btnRetry").disabled = settings.status !== "running"; break;
    case "playing": setTitles(); tick(); break;
    case "done": $("#doneScore").textContent = team.score || 0; $("#doneList").innerHTML = resultsHtml(); break;
    case "ended": $("#endScore").textContent = team.score || 0; $("#endList").innerHTML = resultsHtml(); break;
    default: break;
  }
}

function setTitles() {
  const ch = chal(team.current?.cid);
  const name = ch?.name || "";
  $("#introName").textContent = name; $("#playName").textContent = name; $("#retryName").textContent = name;
  $("#introDesc").textContent = ch?.desc || "";
  const total = activeChallenges().length || 6;
  const n = Math.min(total, (team.done || []).length + (team.current ? 1 : 0));
  document.querySelectorAll(".js-prog").forEach((e) => { e.textContent = `${n}/${total}`; });
}

function resultsHtml() {
  const res = team.results || {};
  return activeChallenges().map((c) => {
    const r = res[c.id];
    const cls = !r ? "" : r.status === "passed" ? "ok" : "no";
    const val = !r ? "—" : r.status === "passed" ? `+${r.points}` : "0";
    return `<li class="${cls}"><span>${esc(c.name)}</span><b>${val}</b></li>`;
  }).join("");
}

// Freeze / resume the timer when the admin pauses the session
function syncPause(st) {
  const cur = team?.current;
  if (!cur || cur.phase !== "playing" || busyWrite) return;
  if (st !== "running" && cur.startedAt) {
    busyWrite = true;
    updateDoc(tRef(), {
      "current.elapsedMs": elapsedOf(cur), "current.startedAt": null, "current.pausedBySession": true,
    }).catch(console.error).finally(() => { busyWrite = false; });
  } else if (st === "running" && !cur.startedAt && cur.pausedBySession) {
    busyWrite = true;
    updateDoc(tRef(), { "current.startedAt": Date.now(), "current.pausedBySession": false })
      .catch(console.error).finally(() => { busyWrite = false; });
  }
}

/* ================= ALLOCATION ================= */
async function tryAllocate() {
  if (allocating || !uid || !settings || settings.status !== "running" || !challenges.length) return;
  if (!team || team.current || team.finished) return;
  allocating = true;
  try {
    const r = await allocate(uid, settings, challenges);
    if (r === "wait") $("#waitMsg").textContent = "كل التحديات مشغولة دلوقتي… أول ما تحدي يفضى هتدخلوه على طول";
    if (r === "ok" || r === "queued" || r === "finished") resync();   // show the next station right away
  } catch (e) { console.error(e); }
  finally { allocating = false; }
}

/* ================= INTRO ================= */
async function getMediaUrl(cid, kind) {
  const ch = chal(cid);
  const n = kind === "video" ? ch?.videoChunks : ch?.audioChunks;
  if (!ch || !n) return null;
  const ver = kind === "video" ? ch.videoVer : ch.audioVer;
  const path = kind === "video" ? `media/${cid}_v` : `media/${cid}`;
  const mime = kind === "video" ? ch.videoMime || "video/mp4" : ch.audioMime || "audio/mpeg";
  return getMediaBlobUrl(path, n, mime, ver);
}

// Download every voice note / video in the background so each challenge opens instantly.
let preloadKey = "", preloading = false; // eslint-disable-line
async function preloadMedia() {
  const list = activeChallenges().filter((c) => c.audioChunks || c.videoChunks);
  const key = list.map((c) => `${c.id}:${c.audioVer}:${c.videoVer}`).join("|");
  if (!list.length || key === preloadKey || preloading) return;
  preloading = true; preloadKey = key;
  // current / next challenge first
  const cur = team?.current?.cid;
  list.sort((a, b) => (b.id === cur) - (a.id === cur));
  for (const c of list) {
    if (!uid) break;
    try { await getMediaUrl(c.id, c.videoChunks ? "video" : "audio"); } catch (e) { console.warn("preload", c.id, e); }
  }
  preloading = false;
}

let introMedia = null;
let introPending = false;
async function setupIntro() {
  const key = curKey, cur = team.current, ch = chal(cur.cid);
  setTitles();
  if (!ch) { introPending = true; return; }            // challenge list not loaded yet — try again when it arrives
  introPending = false;
  mountAvatar("#avIntro");
  heard = false; introMedia = null; stopAuto();
  const btnPlay = $("#btnPlayVN");
  btnPlay.hidden = false; btnPlay.disabled = true; btnPlay.textContent = tr("⏳ بنحمّل الرسالة…");
  updateStartBtn();
  let media = null;
  try {
    const v = await getMediaUrl(cur.cid, "video");
    media = v ? { kind: "video", url: v } : null;
    if (!media) { const a = await getMediaUrl(cur.cid, "audio"); media = a ? { kind: "audio", url: a } : null; }
  } catch (e) { console.error(e); }
  if (key !== curKey) return;
  if (!media) { btnPlay.hidden = true; heard = true; updateStartBtn(); return; }
  introMedia = media;
  btnPlay.disabled = false; btnPlay.textContent = tr("▶ اسمعوا الرسالة");
  btnPlay.onclick = () => playChallengeMessage();
  playChallengeMessage();                               // plays by itself
}
function playChallengeMessage() {
  if (!introMedia) return;
  stopAuto();
  const ch = chal(team?.current?.cid);
  const first = !heard;
  openTheater(introMedia, ch?.name || "", () => {
    heard = true;
    theaterMust = false; $("#thClose").hidden = false; $("#theater").classList.remove("must-watch");
    $("#btnPlayVN").textContent = tr("↻ اسمعوها تاني");
    showEndCard("challenge");
    updateStartBtn();
  }, first);
}

/* ---- full-screen theater ---- */
let theaterDone = null, theaterMedia = null, endKind = null, theaterMust = false;
function openTheater(media, title, onDone, mustWatch = false) {
  const th = $("#theater"), vid = $("#thVideo");
  theaterDone = onDone; theaterMedia = media; theaterMust = mustWatch;
  $("#thClose").hidden = mustWatch;                 // first viewing: no way to skip
  th.classList.toggle("must-watch", mustWatch);
  $("#thName").textContent = title;
  $("#thEnd").hidden = true; $("#thTap").hidden = true;
  th.hidden = false;
  th.classList.toggle("is-video", media.kind === "video");
  const finished = (err) => {
    if (err === "error") { toast(tr("الرسالة مش راضية تشتغل على الموبايل ده — اطلبوا من المنظّم"), "bad"); }
    const cb = theaterDone; cb && cb();
  };
  const blocked = () => { $("#thTap").hidden = false; };
  if (media.kind === "video") {
    vid.hidden = false; vid.muted = false; vid.src = media.url; vid.currentTime = 0;
    vid.controls = false; vid.disablePictureInPicture = true;
    vid.onended = () => finished();
    // no seeking ahead on the first viewing
    let maxT = 0;
    vid.ontimeupdate = () => { if (!theaterMust) return; if (vid.currentTime > maxT + 1.5) vid.currentTime = maxT; else maxT = Math.max(maxT, vid.currentTime); };
    vid.onerror = () => finished("error");
    vid.play().catch((e) => { console.warn(e); if (e.name === "NotAllowedError") blocked(); else finished("error"); });
  } else {
    vid.hidden = true;
    avatar.setMode("full");
    $("#thStage").appendChild(avatar.el);
    avatar.speak(media.url, finished, blocked);
  }
}
$("#thTapBtn").onclick = () => {
  unlockAudio();
  $("#thTap").hidden = true;
  if (theaterMedia) openTheater(theaterMedia, $("#thName").textContent, theaterDone, theaterMust);
};
function closeTheater() {
  const th = $("#theater"), vid = $("#thVideo");
  if (th.hidden) return;
  theaterDone = null; theaterMedia = null; endKind = null;
  vid.onended = null; vid.onerror = null; vid.ontimeupdate = null; vid.pause(); vid.removeAttribute("src"); vid.load(); vid.controls = false;
  theaterMust = false; $("#thClose").hidden = false; th.classList.remove("must-watch");
  avatar.stop();
  th.hidden = true; $("#thEnd").hidden = true; $("#thTap").hidden = true;
  if (curKey && curKey.startsWith("intro")) mountAvatar("#avIntro");
  else if (curKey === "lobby") mountAvatar("#avLobby");
}

// What to show when the message ends
function showEndCard(kind) {
  endKind = kind;
  $("#thEnd").hidden = false;
  if (kind === "welcome") {
    $("#thEndRing").hidden = true;
    $("#thEndTitle").textContent = tr("جاهزين؟");
    $("#thEndMsg").textContent = tr("اللعبة هتبدأ أول ما المنظّم يدي الإشارة.");
    $("#thGo").textContent = tr("⏸ استنوا في اللوبي");
  } else {
    $("#thGo").textContent = tr("يلا نبدأ دلوقتي ⏱");
    renderAuto();
  }
}
$("#thGo").onclick = () => {
  if (endKind === "welcome") { closeTheater(); return; }
  if ($("#thGo").disabled) return;
  stopAuto(); closeTheater(); startTimer("intro", true);
};
$("#thAgain").onclick = () => {
  stopAuto();
  if (endKind === "welcome") playWelcome();
  else playChallengeMessage();
};

/* ---- 10-second auto start after the message ---- */
let autoT = null, autoLeft = 10;
const AUTO_SECS = 10;
function canAutoStart() {
  const cur = team?.current;
  return cur && cur.phase === "intro" && heard && !cur.queued && settings?.status === "running";
}
function startAuto() {
  if (autoT || !canAutoStart()) { renderAuto(); return; }
  autoLeft = AUTO_SECS; renderAuto();
  autoT = setInterval(() => {
    if (!canAutoStart()) { renderAuto(); return; }      // paused / queued: hold
    autoLeft--;
    if (autoLeft <= 3 && autoLeft > 0) beep(660, 0.1, 0.15);
    renderAuto();
    if (autoLeft <= 0) { stopAuto(); closeTheater(); beep(990, 0.25, 0.18); startTimer("intro", true); }
  }, 1000);
}
function stopAuto() { clearInterval(autoT); autoT = null; renderAuto(); }
function renderAuto() {
  const cur = team?.current, running = !!autoT;
  const queued = !!cur?.queued, paused = settings?.status !== "running";
  // challenge end-card
  if (endKind === "challenge") {
    $("#thEndRing").hidden = !running;
    $("#thEndCount").textContent = autoLeft;
    $("#thEndArc").style.strokeDashoffset = String(327 * (1 - autoLeft / AUTO_SECS));
    $("#thEndTitle").textContent = queued ? tr("🚶 روحوا على المحطة") : running ? tr("التحدي هيبدأ لوحده") : tr("جاهزين؟");
    $("#thEndMsg").textContent = queued ? tr("الوقت هيتفتح أول ما المحطة تفضى") : paused ? tr("اللعبة واقفة") : running ? tr("بعد {n} ثانية… أو ابدأوا دلوقتي", { n: autoLeft }) : "";
    $("#thGo").disabled = queued || paused;
  }
  // banner on the intro screen
  const show = cur?.phase === "intro" && heard && (running || queued);
  $("#introAuto").hidden = !show;
  if (show) $("#introAutoText").textContent = queued ? tr("الوقت هيتفتح أول ما المحطة تفضى") : tr("التحدي هيبدأ بعد {n} ثانية", { n: autoLeft });
}

$("#thClose").onclick = () => closeTheater();

function updateStartBtn() {
  const queued = !!team?.current?.queued;
  const ok = heard && settings?.status === "running" && !queued;
  $("#btnStart").disabled = !ok;
  $("#introTag").textContent = queued ? tr("🚶 روحوا على المحطة") : tr("التحدي الجاي");
  $("#introTag").classList.toggle("warn", queued);
  $("#stationBusy").hidden = !queued;
  if (heard && !queued && settings?.status === "running" && team?.current?.phase === "intro") startAuto(); else renderAuto();
  $("#introHint").textContent = queued ? tr("الوقت هيتفتح أول ما المحطة تفضى")
    : !heard ? tr("لازم تسمعوا الرسالة الأول") : settings?.status !== "running" ? tr("اللعبة واقفة") : tr("الوقت هيبدأ أول ما تدوسوا");
}

/* ---- waiting at a busy station ---- */
const nameCache = {};
let claiming = false, occNow = null;
let claimTick = 0;
async function claimCheck() {          // every 5 s while queued: no reads unless needed
  const cur = team?.current;
  if (!cur?.queued) return;
  claimTick++;
  if (!live || claimTick % 4 === 0) {   // every 20 s (or when offline-ish) refresh the station state: 1 read
    try { occNow = (await getDocFromServer(doc(db, "state", "occupancy"))).data() || {}; showInside(); } catch { /* ignore */ }
  }
  tryClaim();
}
function setLooksFree() {
  const cur = team?.current; if (!cur || !occNow) return true;
  const cap = Math.max(1, Number(settings?.sets) || 1);
  const playing = ((occNow.slots || {})[cur.cid] || []).filter((x) => x !== uid).length;
  const pos = ((occNow.queue || {})[cur.cid] || []).indexOf(uid);
  return playing < cap && (pos < 0 || pos < cap - playing);
}
async function tryClaim() {
  const cur = team?.current;
  if (!cur?.queued || claiming || settings?.status !== "running") return;
  if (!setLooksFree()) return;                     // station still busy → don't spend reads
  claiming = true;
  try { const r = await claimSlot(uid, settings); if (r === "ok") resync(); } catch (e) { console.warn(e); }
  finally { claiming = false; }
}
async function showInside() {
  const cur = team?.current; if (!cur?.queued || !occNow) return;
  const ids = (occNow.slots || {})[cur.cid] || [];
  const names = await Promise.all(ids.map(async (id) => {
    if (!nameCache[id]) { try { nameCache[id] = (await getDoc(doc(db, "teams", id))).data()?.name || "?"; } catch { nameCache[id] = "?"; } }
    return nameCache[id];
  }));
  const q = ((occNow.queue || {})[cur.cid] || []).indexOf(uid);
  $("#stationBusyText").textContent = ids.length
    ? tr("{names} لسه جوه التحدي. استنوا عند المحطة واسمعوا الرسالة.", { names: names.join(" · ") })
    : tr("المحطة بتفضى دلوقتي…");
  $("#stationQueue").textContent = q > 0 ? tr("قدامكم {n} فريق في الدور", { n: q }) : "";
}

$("#btnStart").onclick = () => startTimer("intro");
$("#btnRetry").onclick = () => startTimer("retry");

async function startTimer(fromPhase, skipCountdown = false) {
  const cur = team?.current;
  if (!cur || cur.phase !== fromPhase || settings.status !== "running" || cur.queued) return;
  $("#btnStart").disabled = true; $("#btnRetry").disabled = true;
  stopAuto();
  avatar.stop();
  if (!skipCountdown) await countdown();
  if (team?.current?.phase !== fromPhase || settings.status !== "running") { refresh(fromPhase); return; }
  try {
    await updateDoc(tRef(), {
      "current.phase": "playing", "current.startedAt": Date.now(), "current.elapsedMs": 0, "current.pausedBySession": false,
    });
  } catch (e) { console.error(e); toast("حصلت مشكلة… جربوا تاني", "bad"); refresh(fromPhase); }
}

/* ================= PLAYING ================= */
function setupPlaying() {
  const cur = team.current, ch = chal(cur.cid);
  $("#playName").textContent = ch?.name || "";
  const last = cur.attempt > 1;
  $("#playAttempt").textContent = last ? "❤️ الفرصة الأخيرة" : "❤️❤️ المحاولة الأولى";
  $("#playAttempt").classList.toggle("last", last);
  timedOut = false; lastBeep = null;
  if (keepEvidence) { setEvidence(keepEvidence); keepEvidence = null; } else setEvidence(null);
  tickTimer = setInterval(tick, 250);
}

function tick() {
  const cur = team?.current;
  if (!cur || cur.phase !== "playing") return;
  const rem = cur.limitMs - elapsedOf(cur);
  $("#timer").textContent = fmt(rem);
  $("#ringFg").style.strokeDashoffset = RING_C * (1 - Math.max(0, Math.min(1, rem / cur.limitMs)));
  $("#timerWrap").classList.toggle("danger", rem < 60000);
  $("#timerWrap").classList.toggle("frozen", !cur.startedAt);
  if (cur.startedAt && rem > 0 && rem <= 10000) {
    const s = Math.ceil(rem / 1000);
    if (s !== lastBeep) { lastBeep = s; beep(880, 0.07); }
  }
  if (rem <= 0 && cur.startedAt && !timedOut) { timedOut = true; onTimeout(); }
}

async function onTimeout() {
  const cur = team.current;
  try {
    if ((cur.attempt || 1) <= 1) {
      await updateDoc(tRef(), {
        "current.phase": "retry", "current.attempt": 2, "current.prevElapsedMs": cur.limitMs,
        "current.elapsedMs": 0, "current.startedAt": null, "current.pausedBySession": false,
        "current.limitMs": (Number(settings.retryMinutes) || 2) * 60000,
      });
      toast("⏰ الوقت خلص! معاكم فرصة أخيرة", "warn");
    } else {
      await finishChallenge(uid, { passed: false, expectCid: cur.cid });
    }
    beep(180, 0.5);
  } catch (e) { console.error(e); timedOut = false; }
}

/* ---- evidence ---- */
function setEvidence(ev) {
  evidence = ev;
  if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }
  const box = $("#evPreview");
  if (!ev) { box.innerHTML = ""; $("#btnSubmit").disabled = true; return; }
  previewUrl = URL.createObjectURL(ev.blob);
  box.innerHTML = ev.kind === "video"
    ? `<video src="${previewUrl}" controls playsinline></video>`
    : `<img src="${previewUrl}" alt="">`;
  box.insertAdjacentHTML("beforeend", `<button type="button" class="ev-clear" title="مسح">✕</button>`);
  box.querySelector(".ev-clear").onclick = () => setEvidence(null);
  $("#btnSubmit").disabled = false;
}

async function takeFile(f) {
  if (!f) return;
  if (f.type.startsWith("image/") || /\.(heic|heif|jpe?g|png|webp)$/i.test(f.name)) {
    try { setEvidence({ blob: await compressImage(f), kind: "photo", mime: "image/jpeg" }); }
    catch { toast("مش قادرين نقرا الصورة دي… صوّروها تاني", "bad"); }
  } else if (f.type.startsWith("video/")) {
    if (f.size > MAX_VIDEO_BYTES) { toast('الفيديو كبير — استخدموا زرار "🎥 فيديو" (أقصى 30 ثانية)', "warn"); return; }
    setEvidence({ blob: f, kind: "video", mime: f.type });
  } else toast("نوع الملف ده مش مدعوم", "bad");
}
$("#inPhoto").onchange = (e) => { const f = e.target.files[0]; e.target.value = ""; takeFile(f); };
$("#inGallery").onchange = (e) => { const f = e.target.files[0]; e.target.value = ""; takeFile(f); };

/* ---- in-app video recorder (small files for the free plan) ---- */
let recStream = null, recorder = null, recChunks = [], recTimer = null, recLeft = MAX_REC_SEC;
$("#btnRecord").onclick = openRecorder;
$("#recClose").onclick = closeRecorder;
$("#recBtn").onclick = () => (recorder && recorder.state === "recording" ? recorder.stop() : startRec());

async function openRecorder() {
  $("#recModal").hidden = false;
  $("#recBtn").textContent = "⏺ ابدأ التصوير"; $("#recBtn").disabled = true;
  $("#recTime").textContent = fmt(MAX_REC_SEC * 1000);
  try {
    recStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }, width: { ideal: 640 }, height: { ideal: 480 } }, audio: true,
    });
    const v = $("#recVideo"); v.srcObject = recStream; v.muted = true; await v.play().catch(() => {});
    $("#recBtn").disabled = false;
  } catch (e) {
    console.error(e); toast("مش قادرين نفتح الكاميرا — اسمحوا للمتصفح باستخدامها", "bad"); closeRecorder();
  }
}

function startRec() {
  const types = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp8,opus", "video/webm"];
  const mimeType = types.find((t) => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || "";
  try {
    recorder = new MediaRecorder(recStream, { ...(mimeType ? { mimeType } : {}), videoBitsPerSecond: 600000, audioBitsPerSecond: 64000 });
  } catch (e) { toast("التصوير مش مدعوم على الجهاز ده — استخدموا 📁 من الجهاز", "bad"); return; }
  recChunks = [];
  recorder.ondataavailable = (e) => e.data && e.data.size && recChunks.push(e.data);
  recorder.onstop = () => {
    clearInterval(recTimer);
    const type = (recorder.mimeType || mimeType || "video/webm").split(";")[0];
    const blob = new Blob(recChunks, { type });
    closeRecorder();
    if (blob.size) setEvidence({ blob, kind: "video", mime: type });
  };
  recorder.start(1000);
  recLeft = MAX_REC_SEC;
  $("#recBtn").textContent = "⏹ وقّف";
  $("#recTime").classList.add("on");
  recTimer = setInterval(() => {
    recLeft--; $("#recTime").textContent = fmt(recLeft * 1000);
    if (recLeft <= 0 && recorder.state === "recording") recorder.stop();
  }, 1000);
}

function closeRecorder() {
  clearInterval(recTimer);
  if (recorder && recorder.state === "recording") { recorder.onstop = null; recorder.stop(); }
  recorder = null;
  if (recStream) { recStream.getTracks().forEach((t) => t.stop()); recStream = null; }
  $("#recVideo").srcObject = null;
  $("#recTime").classList.remove("on");
  $("#recModal").hidden = true;
}

/* ---- submit ---- */
$("#btnSubmit").onclick = submitEvidence;

async function submitEvidence() {
  const cur = team?.current, ev = evidence;
  if (!ev || !cur || cur.phase !== "playing") return;
  if (settings.status !== "running") { toast("اللعبة واقفة دلوقتي", "warn"); return; }
  const attemptMs = elapsedOf(cur);
  if (attemptMs >= cur.limitMs) return;
  $("#btnSubmit").disabled = true;
  clearInterval(tickTimer); tickTimer = null;
  const subRef = doc(collection(db, "submissions"));
  try {
    // freeze the timer first (and remember the submission id), then upload
    await updateDoc(tRef(), { "current.phase": "pending", "current.elapsedMs": attemptMs, "current.startedAt": null, "current.submissionId": subRef.id });
  } catch (e) { console.error(e); toast("حصلت مشكلة في الشبكة… جربوا تاني", "bad"); $("#btnSubmit").disabled = false; return; }
  setUploading(true, 0);
  try {
    const b64 = await blobToB64(ev.blob);
    const n = await writeChunks(`submissions/${subRef.id}`, b64, (p) => setUploading(true, p));
    await setDoc(subRef, {
      teamId: uid, teamName: team.name || "", cid: cur.cid, challengeName: chal(cur.cid)?.name || "",
      attempt: cur.attempt || 1, attemptMs, totalMs: attemptMs + (cur.prevElapsedMs || 0),
      kind: ev.kind, mime: ev.mime, chunks: n, status: "pending", createdAt: serverTimestamp(),
    });
    toast("📨 الدليل اتبعت", "good");
  } catch (e) {
    console.error(e);
    toast("الرفع فشل… جربوا تاني", "bad");
    keepEvidence = ev;
    // only go back to playing if the judge hasn't already decided
    await runTransaction(db, async (tx) => {
      const s2 = await tx.get(tRef()); const c2 = s2.data()?.current;
      if (c2 && c2.phase === "pending" && c2.submissionId === subRef.id) {
        tx.update(tRef(), { "current.phase": "playing", "current.startedAt": Date.now() });
      }
    }).catch(console.error);
  } finally { setUploading(false); }
}

function setUploading(on, p = 0) {
  $("#upWrap").hidden = !on;
  $("#upBar").style.width = `${Math.round(p * 100)}%`;
}

/* ================= LEADERBOARD (team view) ================= */
$("#btnBoard").onclick = async () => {
  $("#lbModal").hidden = false;
  $("#lbList").innerHTML = `<p class="mut center">بنحمّل…</p>`;
  try {
    const s = await getDocs(collection(db, "teams"));
    const arr = s.docs.map((d) => ({ id: d.id, ...d.data() })).sort(rankSort);
    $("#lbList").innerHTML = rankingHtml(arr, uid);
  } catch (e) { $("#lbList").innerHTML = `<p class="mut center">مش متاح دلوقتي</p>`; }
};
$("#lbClose").onclick = () => { $("#lbModal").hidden = true; };

/* ================= GAME-SHOW EFFECTS ================= */
function countdown() {
  return new Promise((done) => {
    const box = $("#countdown"), num = $("#cdNum");
    const seq = ["3", "2", "1", tr("يلا!")];
    let i = 0;
    box.hidden = false;
    const step = () => {
      if (i >= seq.length) { box.hidden = true; done(); return; }
      num.textContent = seq[i];
      num.classList.remove("pop"); void num.offsetWidth; num.classList.add("pop");
      beep(i < 3 ? 660 : 990, i < 3 ? 0.12 : 0.3, 0.16);
      i++; setTimeout(step, i < seq.length ? 800 : 650);
    };
    step();
  });
}

let fxTimer = null;
function showResult(passed, pts, name) {
  const box = $("#resultFx");
  box.classList.toggle("win", passed); box.classList.toggle("lose", !passed);
  $("#rfxEmoji").textContent = passed ? "🎉" : "😬";
  $("#rfxTitle").textContent = passed ? tr("برافو!") : tr("معدّاش المرة دي");
  $("#rfxPts").textContent = passed ? `+${pts}` : "0";
  $("#rfxSub").textContent = `${name} · ${tr("على التحدي الجاي…")}`;
  box.hidden = false;
  if (passed) { confetti(); [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.14, 0.15), i * 120)); }
  else { beep(220, 0.25, 0.15); setTimeout(() => beep(160, 0.4, 0.15), 260); }
  clearTimeout(fxTimer); fxTimer = setTimeout(hideResult, 4200);
}
function hideResult() { $("#resultFx").hidden = true; }
$("#resultFx").onclick = hideResult;

function confetti() {
  const c = $("#confetti"), ctx = c.getContext("2d");
  const W = (c.width = innerWidth * devicePixelRatio), H = (c.height = innerHeight * devicePixelRatio);
  const colors = ["#8f4fe0", "#f0609a", "#f7c48a", "#2fd38a", "#ffffff", "#6f8cff"];
  const parts = Array.from({ length: 160 }, () => ({
    x: W / 2 + (Math.random() - 0.5) * W * 0.2, y: H * 0.45, vx: (Math.random() - 0.5) * 26 * devicePixelRatio,
    vy: (-Math.random() * 24 - 8) * devicePixelRatio, s: (Math.random() * 8 + 5) * devicePixelRatio,
    r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: colors[(Math.random() * colors.length) | 0],
  }));
  const t0 = performance.now();
  const frame = (now) => {
    ctx.clearRect(0, 0, W, H);
    parts.forEach((p) => {
      p.vy += 0.7 * devicePixelRatio; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
    });
    if (now - t0 < 3500 && !$("#resultFx").hidden) requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H);
  };
  requestAnimationFrame(frame);
}

/* ================= SAFETY NET for weak mobile connections =================
   Live updates can stall on some mobile networks. While a team is waiting
   (for the judge or for a free challenge) re-check the server every 5 s,
   and always re-check when the phone comes back to the app. */
let live = true;
async function resync(withSettings = false) {
  if (!uid) return;
  try {
    const reads = [getDocFromServer(tRef())];
    if (withSettings) reads.push(getDocFromServer(doc(db, "settings", "game")));
    const [t, g] = await Promise.all(reads);
    const nt = t.data() || null;
    let changed = false;
    if (JSON.stringify(nt) !== JSON.stringify(team)) { prevTeam = team; team = nt; announce(); changed = true; }
    if (g) { const ng = g.exists() ? g.data() : null; if (JSON.stringify(ng) !== JSON.stringify(settings)) { settings = ng; changed = true; } }
    if (changed) render();
  } catch (e) { /* offline — try again later */ }
}
// Backup check (free-plan friendly): live updates normally do the job. While waiting for the judge or a station,
// read the team's own doc every 20 s — or every 8 s if the live connection dropped.
let syncTick = 0;
setInterval(() => {
  syncTick++;
  if (document.hidden || !team) return;
  const waiting = team.current?.phase === "pending" || team.current?.queued;
  const every = live ? 10 : 4;                      // ticks of 2 s → 20 s / 8 s
  if (waiting && syncTick % every === 0) resync(!live);
  else if (!live && syncTick % 5 === 0) resync(true); // connection trouble: also catch start/pause
}, 2000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) resync(true); });
window.addEventListener("online", () => resync(true));

/* ================= WELCOME MESSAGE in the lobby ================= */
let lastPing = null;
function refreshWelcome() {
  const w = settings?.welcome || {};
  $("#welcomeText").hidden = !w.text; $("#welcomeText").textContent = w.text || "";
  $("#btnWelcome").hidden = !w.audioChunks;
  if (w.audioChunks) getMediaBlobUrl("media/welcome", w.audioChunks, w.audioMime || "audio/mpeg", w.audioVer).catch(() => {});
  if (lastPing === null) lastPing = w.ping || 0;                 // don't ring for an old call
  else if (w.ping && w.ping > lastPing) {
    lastPing = w.ping;
    if (w.audioChunks && settings.status === "lobby") {
      $("#callFx").hidden = false;
      [660, 880, 990].forEach((f, i) => setTimeout(() => beep(f, 0.15, 0.18), i * 180));
      navigator.vibrate?.([200, 100, 200]);
    }
  }
}
async function playWelcome() {
  $("#callFx").hidden = true;
  const w = settings?.welcome || {};
  if (!w.audioChunks) return;
  try {
    const url = await getMediaBlobUrl("media/welcome", w.audioChunks, w.audioMime || "audio/mpeg", w.audioVer);
    if (curKey !== "lobby") return;
    openTheater({ kind: "audio", url }, settings.eventTitle || "El Le3ba", () => showEndCard("welcome"));
    try { sessionStorage.setItem(`le3ba-welcome-${w.audioVer}`, "1"); } catch { /* ignore */ }
  } catch (e) { console.error(e); }
}
// play the welcome by itself the first time a team reaches the lobby
function autoWelcome() {
  const w = settings?.welcome || {};
  if (!w.audioChunks || settings?.status !== "lobby" || !$("#theater").hidden) return;
  let seen = false; try { seen = sessionStorage.getItem(`le3ba-welcome-${w.audioVer}`) === "1"; } catch { /* ignore */ }
  if (!seen) playWelcome();
}
$("#btnWelcome").onclick = playWelcome;
$("#btnCallListen").onclick = playWelcome;
