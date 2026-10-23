import { t as tr } from "./i18n.js";
import {
  auth, db, firebaseConfig, ADMIN_EMAIL, teamEmail, fmt, elapsedOf, finishChallenge, cleanSlots,
  blobToB64, b64ToBlob, writeChunks, readChunks, deleteChunks, esc, toast, beep, pointsFor,
  DEFAULT_SETTINGS, DEFAULT_CHALLENGES, TEAM_COLORS, compressImage, loadHostPhoto, DEFAULT_MOUTH, makeRoutes,
  authErrorText,
} from "./common.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where,
  writeBatch, serverTimestamp, runTransaction,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { createAvatar } from "./avatar.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sRef = doc(db, "settings", "game");
const STATUS = { lobby: "لوبي", running: "شغّالة", paused: "واقفة", ended: "خلصت" };
const PHASE = { intro: "بيسمع الرسالة", playing: "بيلعب", pending: "مستني الحكم", retry: "فرصة أخيرة (لسه مبدأش)" };

let settings = null, teams = {}, presence = {}, challenges = [], creds = {}, subs = [], occ = {};
let unsubs = [], timerInt = null, firstSubs = true, settingsDirty = false;
const seenSubs = new Set(), mediaUrls = new Map(), loadingMedia = new Set(), busy = new Set();
const avatar = createAvatar();

const chal = (id) => challenges.find((c) => c.id === id);
const activeChallenges = () => challenges.filter((c) => c.active !== false);
const teamList = () => Object.values(teams).sort((a, b) => String(a.username).localeCompare(String(b.username)));
const isOnline = (id) => presence[id] && Date.now() - presence[id] < 100000;

/* ================= AUTH ================= */
$("#admForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("#admErr").textContent = "";
  try { await signInWithEmailAndPassword(auth, $("#admEmail").value.trim(), $("#admPass").value); }
  catch (err) { console.error(err); $("#admErr").textContent = authErrorText(err, tr("الإيميل أو الباسورد غلط")); }
});
$("#btnOut").onclick = () => signOut(auth);

let wasIn = false;
onAuthStateChanged(auth, async (u) => {
  unsubs.forEach((f) => f()); unsubs = []; clearInterval(timerInt);
  if (!u) {
    if (wasIn) $("#admErr").textContent = "You were logged out. Another El Le3ba tab on this browser (probably the team page) logged you out — close it and log in again.";
    wasIn = false;
    $("#login").hidden = false; $("#app").hidden = true; return;
  }
  wasIn = true;
  if ((u.email || "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    await signOut(auth);
    $("#admErr").textContent = "الحساب ده مش أدمن";
    return;
  }
  $("#login").hidden = true; $("#app").hidden = false;
  try { await ensureDefaults(); } catch (e) {
    console.error(e);
    if (!auth.currentUser) return; // logged out meanwhile — message shown above
    $("#dbErr").hidden = false;
    $("#dbErr").textContent = `Database refused the first setup (${e.code || e.name}): ${e.message}. Signed in as ${u.email}. Check Firestore → Rules was published with ${ADMIN_EMAIL}.`;
  }
  subscribe();
});

async function ensureDefaults() {
  const s = await getDoc(sRef);
  if (!s.exists()) await setDoc(sRef, DEFAULT_SETTINGS);
  const c = await getDocs(collection(db, "challenges"));
  if (c.empty) {
    const b = writeBatch(db);
    DEFAULT_CHALLENGES.forEach(({ id, ...rest }) => b.set(doc(db, "challenges", id), rest));
    await b.commit();
  }
  const o = await getDoc(doc(db, "state", "occupancy"));
  if (!o.exists()) await setDoc(doc(db, "state", "occupancy"), { slots: {} });
}

function subscribe() {
  unsubs.push(onSnapshot(sRef, (s) => {
    settings = { ...DEFAULT_SETTINGS, ...(s.data() || {}) };
    renderControl(); fillSettings(); syncHost(); fillWelcome();
  }));
  unsubs.push(onSnapshot(collection(db, "teams"), (s) => {
    teams = {}; s.docs.forEach((d) => { teams[d.id] = { id: d.id, ...d.data() }; });
    renderControl(); renderTeamsTab();
  }));
  unsubs.push(onSnapshot(collection(db, "presence"), (s) => {
    presence = {}; s.docs.forEach((d) => { presence[d.id] = d.data().lastSeen?.toMillis?.() || 0; });
    renderControl(); renderTeamsTab();
  }));
  unsubs.push(onSnapshot(collection(db, "challenges"), (s) => {
    challenges = s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order || 0) - (b.order || 0));
    renderChallenges(); renderControl();
  }));
  unsubs.push(onSnapshot(collection(db, "credentials"), (s) => {
    creds = {}; s.docs.forEach((d) => { creds[d.id] = d.data(); });
    renderTeamsTab();
  }));
  unsubs.push(onSnapshot(doc(db, "state", "occupancy"), (s) => { occ = s.data()?.slots || {}; renderControl(); }));
  unsubs.push(onSnapshot(query(collection(db, "submissions"), where("status", "==", "pending")), onSubs));
  timerInt = setInterval(() => { updateTimers(); }, 1000);
}

/* ================= TABS ================= */
$$(".tabs button").forEach((b) => {
  b.onclick = () => {
    $$(".tabs button").forEach((x) => x.classList.toggle("on", x === b));
    $$(".tab").forEach((t) => { t.hidden = t.id !== `tab-${b.dataset.tab}`; });
  };
});
const openTab = (name) => $(`.tabs button[data-tab="${name}"]`).click();

/* ================= CONTROL ================= */
function renderControl() {
  if (!settings) return;
  const st = settings.status;
  $("#statusPill").textContent = STATUS[st] || st;
  $("#statusPill").dataset.st = st;
  $("#btnStartS").disabled = st === "running";
  $("#btnPauseS").disabled = st !== "running";
  $("#btnEndS").disabled = st === "ended";
  $("#lbToggle").checked = !!settings.leaderboardVisible;
  const list = teamList();
  $("#onlineCount").textContent = `${list.filter((t) => isOnline(t.id)).length}/${list.length}`;
  $("#pendingCount").textContent = subs.length;

  const cap = Math.max(1, Number(settings.sets) || 1);
  $("#stationMap").innerHTML = activeChallenges().map((c) => {
    const ids = occ[c.id] || [];
    return `<div class="station ${ids.length >= cap ? "full" : ids.length ? "busy" : ""}">
      <div class="st-top"><b>${esc(c.name)}</b><span>${ids.length}/${cap}</span></div>
      <small>${ids.map((id) => esc(teams[id]?.name || "؟")).join("، ") || "فاضي"}</small></div>`;
  }).join("");

  try { renderTracking(); } catch (e) { console.error("tracking", e); }
  $("#teamGrid").innerHTML = list.length ? list.map(cardHtml).join("") :
    `<div class="empty">مفيش فرق لسه — روح تبويب "الفرق" وجهّزهم</div>`;
  updateTimers();
}

function cardHtml(t) {
  const cur = t.current, ch = cur ? chal(cur.cid) : null;
  let state;
  if (t.finished) state = "خلّص كل التحديات 🏁";
  else if (!cur) state = settings.status === "lobby" ? "في اللوبي" : "مستني تحدي يفضى";
  else state = `<b>${esc(ch?.name || "؟")}</b> · ${tr(PHASE[cur.phase] || cur.phase)}${cur.attempt > 1 && cur.phase !== "retry" ? ` · ${tr("فرصة أخيرة")}` : ""}`;
  return `<div class="tcard ${cur?.phase === "pending" ? "pending" : ""}" style="--c:${t.color || "#888"}">
    <div class="tc-top"><i class="odot ${isOnline(t.id) ? "on" : ""}"></i><b class="tc-name">${esc(t.name)}</b><span class="tc-score">${t.score || 0}</span></div>
    <div class="tc-state">${state}</div>
    <div class="tc-row"><span class="tc-timer" data-timer="${t.id}"></span><span class="mut small">${tr("{a}/{b} تحدي", { a: (t.done || []).length, b: activeChallenges().length })}</span></div>
    <div class="tc-actions">
      ${cur ? `<button class="btn btn-sm btn-ghost" data-act="skip" data-id="${t.id}">تخطي التحدي</button>` : ""}
      <button class="btn btn-sm btn-ghost" data-act="resetTeam" data-id="${t.id}">ريست الفريق</button>
    </div></div>`;
}

function updateTimers() {
  $$("[data-timer]").forEach((el) => {
    const cur = teams[el.dataset.timer]?.current;
    if (cur && cur.phase === "playing") {
      const rem = cur.limitMs - elapsedOf(cur);
      el.textContent = `⏱ ${fmt(rem)}${cur.startedAt ? "" : " ⏸"}`;
      el.classList.toggle("danger", rem < 60000);
    } else if (cur && cur.phase === "pending") { el.textContent = `⏸ ${fmt(cur.elapsedMs)}`; el.classList.remove("danger"); }
    else { el.textContent = ""; }
  });
}

$("#btnStartS").onclick = async () => {
  const list = teamList(), on = list.filter((t) => isOnline(t.id)).length;
  if (!list.length) { toast("جهّز الفرق الأول", "warn"); return; }
  if (on < list.length && !confirm(tr("{on} من {all} فرق بس متصلين. تبدأ برضه؟", { on, all: list.length }))) return;
  const ids = activeChallenges().map((c) => c.id);
  if (list.some((t) => !t.route || ids.some((id) => !t.route.includes(id)))) await generateRoutes(true);
  await updateDoc(sRef, { status: "running" });
};
$("#btnPauseS").onclick = () => updateDoc(sRef, { status: "paused" });
$("#btnEndS").onclick = async () => { if (confirm(tr("إنهاء اللعبة لكل الفرق؟"))) await updateDoc(sRef, { status: "ended" }); };
$("#btnResetS").onclick = async () => {
  if (!confirm(tr("ريست كامل: كل النقط والتقدم هيتمسحوا وترجع للوبي. متأكد؟"))) return;
  if (!confirm(tr("آخر تأكيد — مفيش رجوع."))) return;
  const b = writeBatch(db);
  teamList().forEach((t) => b.update(doc(db, "teams", t.id), {
    score: 0, totalTimeMs: 0, done: [], results: {}, current: null, finished: false,
  }));
  b.set(doc(db, "state", "occupancy"), { slots: {} });
  b.update(sRef, { status: "lobby" });
  await b.commit();
  await Promise.all(subs.map(removeSubmission));
  toast("تم الريست", "good");
};
$("#lbToggle").onchange = (e) => updateDoc(sRef, { leaderboardVisible: e.target.checked });

$("#teamGrid").addEventListener("click", async (e) => {
  const b = e.target.closest("button[data-act]"); if (!b) return;
  const t = teams[b.dataset.id]; if (!t) return;
  if (b.dataset.act === "skip") {
    if (!confirm(tr("تخطي التحدي الحالي لـ {name}؟ (هياخد صفر فيه)", { name: t.name }))) return;
    await Promise.all(subs.filter((s) => s.teamId === t.id).map(removeSubmission));
    await finishChallenge(t.id, { passed: false });
  } else if (b.dataset.act === "resetTeam") {
    if (!confirm(tr("ريست {name}؟ نقطه وتقدمه هيتمسحوا.", { name: t.name }))) return;
    await Promise.all(subs.filter((s) => s.teamId === t.id).map(removeSubmission));
    await resetTeam(t.id);
  }
});

async function resetTeam(id) {
  await runTransaction(db, async (tx) => {
    const oRef = doc(db, "state", "occupancy");
    const o = await tx.get(oRef);
    tx.set(oRef, { slots: cleanSlots(o.exists() ? o.data().slots : {}, id) });
    tx.update(doc(db, "teams", id), { score: 0, totalTimeMs: 0, done: [], results: {}, current: null, finished: false });
  });
}

/* ================= SUBMISSIONS ================= */
function onSubs(snap) {
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));
  const fresh = list.filter((s) => !seenSubs.has(s.id));
  list.forEach((s) => seenSubs.add(s.id));
  if (!firstSubs && fresh.length) alertNew(fresh);
  firstSubs = false;
  subs = list;
  renderSubs();
  renderControl();
}

function alertNew(fresh) {
  const names = fresh.map((s) => s.teamName).join("، ");
  toast(tr("📩 دليل جديد: {names}", { names }), "warn");
  [0, 180, 360].forEach((d, i) => setTimeout(() => beep(700 + i * 200, 0.12, 0.2), d));
  navigator.vibrate?.([200, 100, 200]);
  if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
    try { new Notification(tr("اللعبة — دليل جديد"), { body: names, tag: "le3ba-sub" }); } catch { /* ignore */ }
  }
}

$("#btnNotif").onclick = async () => {
  beep(660, 0.1);
  if (!("Notification" in window)) { toast("المتصفح ده مش بيدعم التنبيهات — الصوت شغّال", "warn"); return; }
  const p = await Notification.requestPermission();
  toast(p === "granted" ? "التنبيهات اتفعّلت 🔔" : "التنبيهات مش متفعّلة — الصوت بس", p === "granted" ? "good" : "warn");
};

function renderSubs() {
  const n = subs.length;
  $("#subBadge").textContent = n; $("#subBadge").hidden = !n;
  $("#subEmpty").hidden = !!n;
  document.title = n ? `(${n}) ${tr("اللعبة — الأدمن")}` : tr("اللعبة — الأدمن");
  const box = $("#subList"), ids = new Set(subs.map((s) => s.id));
  $$(".subcard", box).forEach((c) => {
    if (!ids.has(c.dataset.sid)) {
      c.remove();
      const u = mediaUrls.get(c.dataset.sid); if (u) { URL.revokeObjectURL(u); mediaUrls.delete(c.dataset.sid); }
    }
  });
  subs.forEach((s) => {
    if (!$(`[data-sid="${s.id}"]`, box)) { box.insertAdjacentHTML("beforeend", subHtml(s)); loadMedia(s); }
  });
}

function subHtml(s) {
  const pts = pointsFor(settings || DEFAULT_SETTINGS, s.attemptMs, s.attempt);
  const t = teams[s.teamId];
  return `<div class="subcard" data-sid="${s.id}" style="--c:${t?.color || "#888"}">
    <div class="sc-head"><b>${esc(s.teamName)}</b><span class="chip">${esc(s.challengeName)}</span>
      ${s.attempt > 1 ? `<span class="chip warn">فرصة أخيرة</span>` : ""}</div>
    <div class="sc-media" id="m-${s.id}"><div class="mut">بنحمّل الدليل…</div></div>
    <div class="sc-meta">الوقت: <b>${fmt(s.attemptMs)}</b> · لو اتقبل: <b class="gold">+${pts}</b></div>
    <div class="sc-actions">
      <button class="btn btn-green" data-act="approve">✓ قبول</button>
      <button class="btn btn-danger" data-act="decline">✗ رفض</button>
    </div></div>`;
}

async function loadMedia(s) {
  if (loadingMedia.has(s.id)) return;
  loadingMedia.add(s.id);
  try {
    const b64 = await readChunks(`submissions/${s.id}`, s.chunks || 1);
    const url = URL.createObjectURL(b64ToBlob(b64, s.mime || (s.kind === "video" ? "video/mp4" : "image/jpeg")));
    mediaUrls.set(s.id, url);
    const el = $(`#m-${s.id}`); if (!el) return;
    el.innerHTML = s.kind === "video"
      ? `<video src="${url}" controls playsinline preload="metadata"></video>`
      : `<img src="${url}" alt="" data-zoom="1">`;
  } catch (e) {
    console.error(e);
    const el = $(`#m-${s.id}`); if (el) el.innerHTML = `<div class="err">مش قادرين نحمّل الدليل — اسأل الفريق يبعته تاني</div>`;
  } finally { loadingMedia.delete(s.id); }
}

$("#subList").addEventListener("click", async (e) => {
  const img = e.target.closest("img[data-zoom]");
  if (img) { $("#mediaBox").innerHTML = `<img src="${img.src}" alt="">`; $("#mediaModal").hidden = false; return; }
  const b = e.target.closest("button[data-act]"); if (!b) return;
  const card = b.closest(".subcard"), s = subs.find((x) => x.id === card.dataset.sid);
  if (!s || busy.has(s.id)) return;
  busy.add(s.id); $$("button", card).forEach((x) => { x.disabled = true; });
  try {
    if (b.dataset.act === "approve") await approve(s); else await decline(s);
  } catch (err) {
    console.error(err); toast("حصلت مشكلة… جرب تاني", "bad");
    $$("button", card).forEach((x) => { x.disabled = false; });
  } finally { busy.delete(s.id); }
});
$("#mediaModal").onclick = (e) => { if (e.target.closest("video")) return; $("#mediaModal").hidden = true; $("#mediaBox").innerHTML = ""; };

async function approve(s) {
  const pts = pointsFor(settings, s.attemptMs, s.attempt);
  const ok = await finishChallenge(s.teamId, { passed: true, points: pts, totalMs: s.totalMs || s.attemptMs, expectCid: s.cid });
  await removeSubmission(s);
  toast(ok ? `✓ ${s.teamName} +${pts}` : tr("الفريق مش في التحدي ده دلوقتي — الدليل اتمسح"), ok ? "good" : "warn");
}

async function decline(s) {
  if ((s.attempt || 1) <= 1) {
    await runTransaction(db, async (tx) => {
      const r = doc(db, "teams", s.teamId);
      const snap = await tx.get(r);
      const cur = snap.data()?.current;
      if (!cur || cur.cid !== s.cid) return;
      tx.update(r, {
        current: {
          ...cur, phase: "retry", attempt: 2, prevElapsedMs: s.attemptMs, elapsedMs: 0, startedAt: null,
          limitMs: (Number(settings.retryMinutes) || 2) * 60000, submissionId: null, pausedBySession: false,
        },
      });
    });
    toast(tr("✗ {name}: رايح للفرصة الأخيرة", { name: s.teamName }), "warn");
  } else {
    await finishChallenge(s.teamId, { passed: false, expectCid: s.cid });
    toast(tr("✗ {name}: اتنقل للتحدي الجاي", { name: s.teamName }), "warn");
  }
  await removeSubmission(s);
}

// Evidence is never kept: chunks + doc are deleted right after the decision.
async function removeSubmission(s) {
  await deleteChunks(`submissions/${s.id}`, s.chunks || 1);
  await deleteDoc(doc(db, "submissions", s.id)).catch(() => {});
}

/* ================= CHALLENGES ================= */
let recState = null; // { cid, recorder, stream }

function renderChallenges() {
  const tab = $("#tab-challenges");
  const ae = document.activeElement;
  if (tab.contains(ae) && ae.matches("input,textarea") && ae.type !== "file") return; // don't wipe while typing
  $("#chList").innerHTML = challenges.map((c) => `
    <div class="card chrow" data-cid="${c.id}">
      <div class="row">
        <label class="sm">ترتيب<input type="number" class="f-order" value="${c.order || 1}" min="1"></label>
        <label class="grow">اسم التحدي<input class="f-name" value="${esc(c.name)}"></label>
        <label class="switch"><input type="checkbox" class="f-active" ${c.active !== false ? "checked" : ""}><span>مفعّل</span></label>
      </div>
      <label>وصف قصير بيظهر للفريق (اختياري)<textarea class="f-desc" rows="2">${esc(c.desc || "")}</textarea></label>
      <div class="audio-row">
        <span class="chip ${c.audioChunks ? "ok" : ""}">${c.audioChunks ? "🎙 فيه VN" : "مفيش VN"}</span>
        ${c.audioChunks ? `<button class="btn btn-sm btn-ghost" data-act="play">▶ جرّب مع الأفاتار</button>` : ""}
        <button class="btn btn-sm btn-ghost" data-act="rec">${recState?.cid === c.id ? "⏹ وقّف وسجّل" : "🎙 سجّل VN"}</button>
        <label class="btn btn-sm btn-ghost">📁 ارفع ملف<input type="file" accept="audio/*" class="f-audio" hidden></label>
        ${c.audioChunks ? `<button class="btn btn-sm btn-ghost danger" data-act="rmAudio">🗑</button>` : ""}
      </div>
      <div class="audio-row">
        <span class="chip ${c.videoChunks ? "ok" : ""}">${c.videoChunks ? "🎬 فيه فيديو أفاتار" : "مفيش فيديو (اختياري)"}</span>
        ${c.videoChunks ? `<button class="btn btn-sm btn-ghost" data-act="playVid">▶ شوف الفيديو</button>` : ""}
        <label class="btn btn-sm btn-ghost">🎬 ارفع فيديو MP4<input type="file" accept="video/mp4,video/*" class="f-video" hidden></label>
        ${c.videoChunks ? `<button class="btn btn-sm btn-ghost danger" data-act="rmVideo">🗑</button>` : ""}
      </div>
      <div class="row-actions">
        <button class="btn btn-sm btn-red" data-act="saveCh">حفظ</button>
        <button class="btn btn-sm btn-ghost danger" data-act="delCh">مسح التحدي</button>
      </div>
    </div>`).join("");
}

$("#chList").addEventListener("click", async (e) => {
  const b = e.target.closest("button[data-act]"); if (!b) return;
  const row = b.closest(".chrow"), cid = row.dataset.cid, c = chal(cid);
  const act = b.dataset.act;
  if (act === "saveCh") {
    await updateDoc(doc(db, "challenges", cid), {
      name: $(".f-name", row).value.trim() || "تحدي", desc: $(".f-desc", row).value.trim(),
      order: Number($(".f-order", row).value) || 1, active: $(".f-active", row).checked,
    });
    document.activeElement.blur?.();
    toast("اتحفظ ✓", "good");
  } else if (act === "delCh") {
    const inUse = (occ[cid] || []).length;
    if (!confirm(inUse ? tr("فيه {n} فريق جوه التحدي ده دلوقتي. تمسحه برضه؟", { n: inUse }) : tr('مسح "{name}"؟', { name: c.name }))) return;
    await deleteChunks(`media/${cid}`, c.audioChunks || 0);
    await deleteChunks(`media/${cid}_v`, c.videoChunks || 0);
    await deleteDoc(doc(db, "challenges", cid));
  } else if (act === "play") {
    b.disabled = true;
    try {
      const url = URL.createObjectURL(b64ToBlob(await readChunks(`media/${cid}`, c.audioChunks), c.audioMime || "audio/mpeg"));
      avatar.setMode("full"); $("#avPreview").appendChild(avatar.el); $("#avModal").hidden = false;
      avatar.speak(url, () => URL.revokeObjectURL(url));
    } catch (err) { console.error(err); toast("مش قادرين نشغّل الملف", "bad"); }
    b.disabled = false;
  } else if (act === "rmAudio") {
    if (!confirm(tr("مسح الـ VN؟"))) return;
    await deleteChunks(`media/${cid}`, c.audioChunks || 0);
    await updateDoc(doc(db, "challenges", cid), { audioChunks: 0, audioMime: null, audioVer: Date.now() });
  } else if (act === "playVid") {
    b.disabled = true;
    try {
      const url = URL.createObjectURL(b64ToBlob(await readChunks(`media/${cid}_v`, c.videoChunks), c.videoMime || "video/mp4"));
      $("#mediaBox").innerHTML = `<video src="${url}" controls autoplay playsinline></video>`; $("#mediaModal").hidden = false;
    } catch (err) { console.error(err); toast("مش قادرين نشغّل الفيديو", "bad"); }
    b.disabled = false;
  } else if (act === "rmVideo") {
    if (!confirm(tr("مسح فيديو الأفاتار؟ (هيرجع يشتغل الـ VN مع الشخصية)"))) return;
    await deleteChunks(`media/${cid}_v`, c.videoChunks || 0);
    await updateDoc(doc(db, "challenges", cid), { videoChunks: 0, videoMime: null, videoVer: Date.now() });
  } else if (act === "rec") {
    toggleRecord(cid);
  }
});

$("#chList").addEventListener("change", async (e) => {
  if (!e.target.matches(".f-audio,.f-video")) return;
  const f = e.target.files[0]; const isVid = e.target.matches(".f-video"); e.target.value = "";
  const cid = e.target.closest(".chrow").dataset.cid;
  if (!f) return;
  if (isVid) await uploadVideo(cid, f, f.type || "video/mp4");
  else await uploadAudio(cid, f, f.type || "audio/mpeg");
});

$("#avClose").onclick = () => { avatar.stop(); $("#avModal").hidden = true; };

async function toggleRecord(cid) {
  if (recState) {
    const same = recState.cid === cid;
    recState.recorder.stop();
    if (same) return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const types = ["audio/mp4", "audio/mpeg", "audio/webm;codecs=opus", "audio/webm"];
    const mimeType = types.find((t) => MediaRecorder.isTypeSupported(t)) || "";
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    const chunks = [];
    recorder.ondataavailable = (ev) => ev.data.size && chunks.push(ev.data);
    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const type = (recorder.mimeType || mimeType || "audio/webm").split(";")[0];
      recState = null; renderChallenges();
      await uploadAudio(cid, new Blob(chunks, { type }), type);
    };
    recorder.start(500);
    recState = { cid, recorder, stream };
    renderChallenges();
    toast("🎙 بيسجّل… دوس وقّف لما تخلص", "warn");
  } catch (e) { console.error(e); toast("مش قادرين نفتح المايك", "bad"); }
}

async function uploadAudio(cid, blob, mime) {
  if (blob.size > 4 * 1024 * 1024) { toast("الملف أكبر من 4MB — صغّره أو قصّره", "bad"); return; }
  const c = chal(cid), old = c?.audioChunks || 0;
  toast("بنرفع الـ VN…");
  try {
    const n = await writeChunks(`media/${cid}`, await blobToB64(blob));
    await updateDoc(doc(db, "challenges", cid), { audioChunks: n, audioMime: mime, audioVer: Date.now() });
    if (old > n) await deleteChunks(`media/${cid}`, old, n);
    toast("الـ VN اتحفظ ✓", "good");
  } catch (e) { console.error(e); toast("الرفع فشل", "bad"); }
}

async function uploadVideo(cid, blob, mime) {
  if (blob.size > 15 * 1024 * 1024) { toast("الفيديو أكبر من 15MB — صغّره (720p كفاية)", "bad"); return; }
  const c = chal(cid), old = c?.videoChunks || 0;
  toast("بنرفع الفيديو… استنى شوية");
  try {
    const n = await writeChunks(`media/${cid}_v`, await blobToB64(blob));
    await updateDoc(doc(db, "challenges", cid), { videoChunks: n, videoMime: mime, videoVer: Date.now() });
    if (old > n) await deleteChunks(`media/${cid}_v`, old, n);
    toast("الفيديو اتحفظ ✓", "good");
  } catch (e) { console.error(e); toast("الرفع فشل", "bad"); }
}

$("#btnAddCh").onclick = async () => {
  const order = Math.max(0, ...challenges.map((c) => c.order || 0)) + 1;
  await setDoc(doc(collection(db, "challenges")), { name: tr("تحدي {n}", { n: order }), desc: "", order, active: true });
};

/* ================= TEAMS ================= */
let secAuth = null;
const getSecAuth = () => secAuth || (secAuth = getAuth(initializeApp(firebaseConfig, "secondary")));
const genPwd = () => Array.from({ length: 6 }, () => "abcdefghjkmnpqrstuvwxyz23456789"[Math.floor(Math.random() * 31)]).join("");

function renderTeamsTab() {
  const ae = document.activeElement;
  if ($("#teamRows").contains(ae) && ae.matches("input")) return;
  const list = teamList();
  $("#teamRows").innerHTML = list.map((t) => {
    const c = creds[t.id] || {};
    return `<tr data-id="${t.id}">
      <td><i class="odot ${isOnline(t.id) ? "on" : ""}"></i></td>
      <td><input class="f-tname" value="${esc(t.name)}" style="border-color:${t.color || "var(--line)"}"></td>
      <td dir="ltr" class="mono">${esc(c.username || t.username || "")}</td>
      <td dir="ltr" class="mono">${esc(c.password || "—")}</td>
      <td>${t.score || 0}</td>
      <td><button class="btn btn-sm btn-ghost danger" data-act="delTeam">مسح</button></td></tr>`;
  }).join("") || `<tr><td colspan="6" class="mut center">مفيش فرق لسه</td></tr>`;
}

$("#teamRows").addEventListener("change", async (e) => {
  if (!e.target.matches(".f-tname")) return;
  const id = e.target.closest("tr").dataset.id, name = e.target.value.trim();
  if (name) { await updateDoc(doc(db, "teams", id), { name }); e.target.blur(); toast("اتحفظ ✓", "good"); }
});

$("#teamRows").addEventListener("click", async (e) => {
  const b = e.target.closest("button[data-act=delTeam]"); if (!b) return;
  const id = b.closest("tr").dataset.id, t = teams[id];
  if (!confirm(tr("مسح {name} نهائياً؟", { name: t.name }))) return;
  await runTransaction(db, async (tx) => {
    const oRef = doc(db, "state", "occupancy");
    const o = await tx.get(oRef);
    tx.set(oRef, { slots: cleanSlots(o.exists() ? o.data().slots : {}, id) });
    tx.delete(doc(db, "teams", id));
    tx.delete(doc(db, "credentials", id));
    tx.delete(doc(db, "presence", id));
  });
});

$("#btnGenTeams").onclick = async () => {
  const target = Math.min(40, Math.max(1, Number($("#teamCount").value) || 0));
  const have = Object.keys(teams).length;
  if (have >= target) { toast(tr("عندك {n} فرق بالفعل", { n: have }), "warn"); return; }
  const btn = $("#btnGenTeams"); btn.disabled = true;
  const used = new Set([...Object.values(creds).map((c) => c.username), ...Object.values(teams).map((t) => t.username)]);
  const sa = getSecAuth();
  let created = 0, idx = 0;
  try {
    while (have + created < target && idx < 200) {
      idx++;
      const username = `team${String(idx).padStart(2, "0")}`;
      if (used.has(username)) continue;
      const password = genPwd();
      let tuid;
      try {
        tuid = (await createUserWithEmailAndPassword(sa, teamEmail(username), password)).user.uid;
      } catch (err) {
        if (err.code === "auth/email-already-in-use") continue;
        throw err;
      }
      await signOut(sa);
      await setDoc(doc(db, "teams", tuid), {
        name: tr("فريق {n}", { n: idx }), username, color: TEAM_COLORS[(idx - 1) % TEAM_COLORS.length],
        score: 0, totalTimeMs: 0, done: [], results: {}, current: null, finished: false, createdAt: serverTimestamp(),
      });
      await setDoc(doc(db, "credentials", tuid), { username, password });
      created++;
      btn.textContent = tr("بيجهّز… {a}/{b}", { a: have + created, b: target });
    }
    toast(tr("اتعمل {n} فريق ✓", { n: created }), "good");
  } catch (err) {
    console.error(err);
    toast(err.code === "auth/operation-not-allowed" ? "فعّل Email/Password في Firebase Authentication" : tr("حصلت مشكلة: {e}", { e: err.code || err.message }), "bad");
  } finally { btn.disabled = false; btn.textContent = "جهّز الفرق"; }
};

$("#btnPrint").onclick = () => {
  const base = new URL("index.html", location.href).href;
  const logo = new URL("assets/logo.webp", location.href).href;
  const cards = teamList().map((t) => {
    const c = creds[t.id] || {};
    const user = c.username || t.username;
    return `<div class="c">
      <div class="top"><img src="${logo}" class="lg" alt=""><h2>${esc(t.name)}</h2></div>
      <div class="qr" data-url="${esc(`${base}?u=${encodeURIComponent(user)}`)}"></div>
      <div class="scan">${esc(tr("امسح الكود عشان تدخل اللعبة"))}</div>
      <p>${tr("اليوزر:")} <b>${esc(user)}</b></p>
      <p>${tr("الباسورد:")} <b>${esc(c.password || "—")}</b></p></div>`;
  }).join("");
  const w = window.open("", "_blank");
  if (!w) { toast("اسمح بالـ popups عشان تطبع", "warn"); return; }
  w.document.write(`<!doctype html><html dir="${document.documentElement.dir}"><head><meta charset="utf-8"><title>${tr("كروت الدخول")}</title>
    <style>
      body{font-family:Cairo,Arial,sans-serif;margin:12px;color:#14154f}
      .g{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
      .c{border:2px dashed #8f4fe0;border-radius:16px;padding:12px;break-inside:avoid;text-align:center}
      .top{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:6px}
      .lg{width:38px;height:auto}
      h2{margin:0;font-size:20px;color:#c13a8e}
      .qr{display:flex;justify-content:center;margin:6px 0}.qr img,.qr canvas{width:150px!important;height:150px!important}
      .scan{font-size:12px;color:#666;margin-bottom:6px}
      p{margin:3px 0;font-size:15px}
      b{font-family:monospace;font-size:18px;direction:ltr;unicode-bidi:embed}
      @media print{.c{page-break-inside:avoid}}
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
    </head><body><div class="g">${cards}</div>
    <script>
      window.onload = () => {
        document.querySelectorAll(".qr").forEach((el) => new QRCode(el, { text: el.dataset.url, width: 300, height: 300, correctLevel: QRCode.CorrectLevel.M }));
        setTimeout(() => print(), 700);
      };
    <\/script></body></html>`);
  w.document.close();
};

/* ================= SETTINGS ================= */
function bracketRow(b = { upToMin: 12, points: 40 }) {
  return `<div class="bracket"><label>لحد دقيقة<input type="number" class="b-min" min="0.5" step="0.5" value="${b.upToMin}"></label>
    <label>النقط<input type="number" class="b-pts" min="0" value="${b.points}"></label>
    <button type="button" class="btn btn-sm btn-ghost danger b-del">✕</button></div>`;
}

function fillSettings() {
  if (!settings || settingsDirty) return;
  $("#sTitle").value = settings.eventTitle || "";
  $("#sSets").value = settings.sets;
  $("#sMin").value = settings.challengeMinutes;
  $("#sRetry").value = settings.retryMinutes;
  $("#sRetryPts").value = settings.retryPoints;
  $("#bracketRows").innerHTML = (settings.brackets || []).map(bracketRow).join("");
}

$("#setForm").addEventListener("input", () => { settingsDirty = true; });
$("#btnAddBracket").onclick = () => { settingsDirty = true; $("#bracketRows").insertAdjacentHTML("beforeend", bracketRow()); };
$("#bracketRows").addEventListener("click", (e) => {
  if (e.target.matches(".b-del")) { settingsDirty = true; e.target.closest(".bracket").remove(); }
});
$("#setForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const brackets = $$(".bracket").map((r) => ({ upToMin: Number($(".b-min", r).value), points: Number($(".b-pts", r).value) }))
    .filter((b) => b.upToMin > 0).sort((a, b) => a.upToMin - b.upToMin);
  if (!brackets.length) { toast("لازم شريحة نقط واحدة على الأقل", "bad"); return; }
  await updateDoc(sRef, {
    eventTitle: $("#sTitle").value.trim() || "اللعبة",
    sets: Math.max(1, Number($("#sSets").value) || 1),
    challengeMinutes: Math.max(1, Number($("#sMin").value) || 12),
    retryMinutes: Math.max(1, Number($("#sRetry").value) || 2),
    retryPoints: Math.max(0, Number($("#sRetryPts").value) || 0),
    brackets,
  });
  settingsDirty = false; fillSettings();
  toast("الإعدادات اتحفظت ✓", "good");
});

/* ================= HOST CHARACTER ================= */
let hostLocal = null, hostVer = null;
async function syncHost() {
  const h = settings?.host;
  const ver = h?.chunks ? `${h.ver}` : null;
  $("#hostRemove").hidden = !ver;
  ["#hostPick", "#hostWWrap", "#hostSave", "#hostNudge"].forEach((q) => { $(q).hidden = !ver; });
  if (ver === hostVer && hostLocal) return;
  hostVer = ver;
  if (!ver) { hostLocal = null; avatar.setPhoto(null); return; }
  try {
    const p = await loadHostPhoto(h);
    hostLocal = { mx: h.mx ?? DEFAULT_MOUTH.mx, my: h.my ?? DEFAULT_MOUTH.my, mw: h.mw ?? DEFAULT_MOUTH.mw, url: p.url, W: p.W, H: p.H };
    $("#hostImg").src = p.url;
    $("#hostW").value = hostLocal.mw;
    placeDot();
    avatar.setPhoto(p);
  } catch (e) { console.error(e); toast("مش قادرين نحمّل صورة الشخصية", "bad"); }
}
function placeDot() {
  if (!hostLocal) return;
  const d = $("#hostDot");
  d.style.left = `${hostLocal.mx * 100}%`; d.style.top = `${hostLocal.my * 100}%`;
  d.style.width = `${hostLocal.mw * 100}%`;
}
const hostPhotoFromLocal = () => hostLocal && ({
  url: hostLocal.url, W: hostLocal.W, H: hostLocal.H, mx: hostLocal.mx * hostLocal.W, my: hostLocal.my * hostLocal.H, mw: hostLocal.mw * hostLocal.W,
});
// Drag (mouse or finger) or tap to place the mouth; arrows nudge; saves automatically.
let saveT = null;
function autoSaveMouth() {
  clearTimeout(saveT);
  saveT = setTimeout(async () => {
    if (!hostLocal) return;
    try {
      await updateDoc(sRef, { "host.mx": hostLocal.mx, "host.my": hostLocal.my, "host.mw": hostLocal.mw });
      avatar.setPhoto(hostPhotoFromLocal());
      $("#hostSaved").textContent = tr("مكان البق اتحفظ ✓");
    } catch (e) { console.error(e); toast("الرفع فشل", "bad"); }
  }, 400);
}
function setMouthFromPoint(x, y) {
  const r = $("#hostImg").getBoundingClientRect();
  if (!r.width) return;
  hostLocal.mx = Math.min(1, Math.max(0, (x - r.left) / r.width));
  hostLocal.my = Math.min(1, Math.max(0, (y - r.top) / r.height));
  placeDot(); $("#hostSaved").textContent = "";
}
let dragging = false;
const pick = $("#hostPick");
pick.addEventListener("pointerdown", (e) => {
  if (!hostLocal) return;
  e.preventDefault(); dragging = true;
  try { pick.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  setMouthFromPoint(e.clientX, e.clientY);
});
pick.addEventListener("pointermove", (e) => { if (dragging) { e.preventDefault(); setMouthFromPoint(e.clientX, e.clientY); } });
const endDrag = () => { if (dragging) { dragging = false; autoSaveMouth(); } };
pick.addEventListener("pointerup", endDrag);
pick.addEventListener("pointercancel", endDrag);
$("#hostNudge").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-d]"); if (!b || !hostLocal) return;
  const step = 0.004, [dx, dy] = b.dataset.d.split(",").map(Number);
  if (b.dataset.d === "w+") hostLocal.mw = Math.min(0.2, hostLocal.mw + 0.004);
  else if (b.dataset.d === "w-") hostLocal.mw = Math.max(0.02, hostLocal.mw - 0.004);
  else { hostLocal.mx = Math.min(1, Math.max(0, hostLocal.mx + dx * step)); hostLocal.my = Math.min(1, Math.max(0, hostLocal.my + dy * step)); }
  $("#hostW").value = hostLocal.mw; placeDot(); autoSaveMouth();
});
$("#hostW").addEventListener("input", (e) => { if (hostLocal) { hostLocal.mw = Number(e.target.value); placeDot(); autoSaveMouth(); } });
$("#hostSave").onclick = async () => {
  if (!hostLocal) return;
  await updateDoc(sRef, { "host.mx": hostLocal.mx, "host.my": hostLocal.my, "host.mw": hostLocal.mw });
  avatar.setPhoto(hostPhotoFromLocal());
  toast("مكان البق اتحفظ ✓", "good");
};
$("#hostReset").onclick = () => {
  if (!hostLocal) return;
  Object.assign(hostLocal, DEFAULT_MOUTH); $("#hostW").value = hostLocal.mw; placeDot(); autoSaveMouth();
};
$("#hostFile").onchange = async (e) => {
  const f = e.target.files[0]; e.target.value = "";
  if (!f) return;
  try {
    toast("بنرفع الصورة…");
    const blob = await compressImage(f, 1600, 0.86);
    const old = settings.host?.chunks || 0;
    const n = await writeChunks("media/host", await blobToB64(blob));
    if (old > n) await deleteChunks("media/host", old, n);
    // new picture → start from the default mouth position (tap to adjust if needed)
    await updateDoc(sRef, { host: { ...DEFAULT_MOUTH, chunks: n, mime: "image/jpeg", ver: Date.now() } });
    toast("الصورة اترفعت ✓ دوس على البق في الصورة وبعدين حفظ", "good");
  } catch (err) { console.error(err); toast("الرفع فشل", "bad"); }
};
$("#hostRemove").onclick = async () => {
  if (!confirm(tr("ترجع للشخصية المرسومة؟"))) return;
  await deleteChunks("media/host", settings.host?.chunks || 0);
  await updateDoc(sRef, { host: null });
};
$("#hostTest").onclick = async () => {
  const c = challenges.find((x) => x.audioChunks);
  if (!c) { toast("سجّل VN لأي تحدي الأول", "warn"); return; }
  try {
    const url = URL.createObjectURL(b64ToBlob(await readChunks(`media/${c.id}`, c.audioChunks), c.audioMime || "audio/mpeg"));
    avatar.setPhoto(hostPhotoFromLocal());
    avatar.setMode("full"); $("#avPreview").appendChild(avatar.el); $("#avModal").hidden = false;
    avatar.speak(url, () => URL.revokeObjectURL(url));
  } catch (err) { console.error(err); toast("مش قادرين نشغّل الـ VN", "bad"); }
};

/* ================= WELCOME MESSAGE (lobby) ================= */
let wRecState = null;
function fillWelcome() {
  const w = settings?.welcome || {};
  if (document.activeElement !== $("#wText")) $("#wText").value = w.text || "";
  $("#wChip").textContent = w.audioChunks ? tr("🎙 فيه VN") : tr("مفيش VN");
  $("#wChip").classList.toggle("ok", !!w.audioChunks);
  $("#wPlay").hidden = $("#wDel").hidden = !w.audioChunks;
  $("#wRec").textContent = wRecState ? tr("⏹ وقّف وسجّل") : tr("🎙 سجّل VN");
}
async function saveWelcomeAudio(blob, mime) {
  if (blob.size > 4 * 1024 * 1024) { toast("الملف أكبر من 4MB — صغّره أو قصّره", "bad"); return; }
  toast("بنرفع الـ VN…");
  try {
    const old = settings.welcome?.audioChunks || 0;
    const n = await writeChunks("media/welcome", await blobToB64(blob));
    if (old > n) await deleteChunks("media/welcome", old, n);
    await updateDoc(sRef, { "welcome.audioChunks": n, "welcome.audioMime": mime, "welcome.audioVer": Date.now() });
    toast("الـ VN اتحفظ ✓", "good");
  } catch (e) { console.error(e); toast("الرفع فشل", "bad"); }
}
$("#wFile").onchange = async (e) => { const f = e.target.files[0]; e.target.value = ""; if (f) await saveWelcomeAudio(f, f.type || "audio/mpeg"); };
$("#wRec").onclick = async () => {
  if (wRecState) { wRecState.recorder.stop(); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const types = ["audio/mp4", "audio/mpeg", "audio/webm;codecs=opus", "audio/webm"];
    const mimeType = types.find((t) => MediaRecorder.isTypeSupported(t)) || "";
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    const chunks = [];
    recorder.ondataavailable = (ev) => ev.data.size && chunks.push(ev.data);
    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const type = (recorder.mimeType || mimeType || "audio/webm").split(";")[0];
      wRecState = null; fillWelcome();
      await saveWelcomeAudio(new Blob(chunks, { type }), type);
    };
    recorder.start(500); wRecState = { recorder }; fillWelcome();
    toast("🎙 بيسجّل… دوس وقّف لما تخلص", "warn");
  } catch (e) { console.error(e); toast("مش قادرين نفتح المايك", "bad"); }
};
$("#wPlay").onclick = async () => {
  const w = settings.welcome;
  try {
    const url = URL.createObjectURL(b64ToBlob(await readChunks("media/welcome", w.audioChunks), w.audioMime || "audio/mpeg"));
    avatar.setMode("full"); $("#avPreview").appendChild(avatar.el); $("#avModal").hidden = false;
    avatar.speak(url, () => URL.revokeObjectURL(url));
  } catch (e) { console.error(e); toast("مش قادرين نشغّل الملف", "bad"); }
};
$("#wDel").onclick = async () => {
  if (!confirm(tr("مسح الـ VN؟"))) return;
  await deleteChunks("media/welcome", settings.welcome?.audioChunks || 0);
  await updateDoc(sRef, { "welcome.audioChunks": 0, "welcome.audioVer": Date.now() });
};
$("#wSave").onclick = async () => { await updateDoc(sRef, { "welcome.text": $("#wText").value.trim() }); toast("اتحفظ ✓", "good"); };
$("#wPing").onclick = async () => {
  await updateDoc(sRef, { "welcome.text": $("#wText").value.trim(), "welcome.ping": Date.now() });
  toast("📣 الفرق اللي في اللوبي هتسمع تنبيه", "good");
};

/* ================= ROUTES & TRACKING ================= */
async function generateRoutes(silent = false) {
  const list = teamList(), ch = activeChallenges();
  if (!list.length || !ch.length) { toast("جهّز الفرق الأول", "warn"); return; }
  const started = list.some((t) => (t.done || []).length || t.current);
  if (!silent && started && !confirm(tr("اللعبة بدأت. المسارات الجديدة هتطبق على التحديات اللي لسه. تكمّل؟"))) return;
  const { routes, strict } = makeRoutes(list.map((t) => t.id), ch.map((c) => c.id), settings.sets);
  const b = writeBatch(db);
  list.forEach((t) => b.update(doc(db, "teams", t.id), { route: routes[t.id] }));
  b.update(sRef, { routeStrict: strict, routesAt: Date.now() });
  await b.commit();
  if (!silent) toast("المسارات اتعملت ✓", "good");
}
$("#btnRoutes").onclick = () => generateRoutes(false);

function renderTracking() {
  if (!settings || !$("#trackTable")) return;
  const list = teamList(), ch = activeChallenges(), n = ch.length, cap = Math.max(1, Number(settings.sets) || 1);
  const name = (id) => esc(chal(id)?.name || "؟");
  const hasRoutes = list.length && list.every((t) => t.route && t.route.length);
  $("#trackInfo").textContent = !hasRoutes ? tr("المسارات لسه متعملتش — هتتعمل لوحدها لما تدوس ابدأ، أو دوس الزرار.")
    : settings.routeStrict === false ? tr("عدد الفرق أكبر من التحديات × الـ Sets — لو التحدي الجاي مشغول الفريق بياخد أقرب تحدي فاضي.")
    : tr("كل فريق بيمشي على مساره بالترتيب. لو التحدي الجاي لسه مشغول، الفريق بيستنى لحد ما يفضى.");
  // team × round
  let h = `<thead><tr><th>${tr("الفريق")}</th>${Array.from({ length: n }, (_, i) => `<th>${tr("راوند {n}", { n: i + 1 })}</th>`).join("")}<th>${tr("النقط")}</th></tr></thead><tbody>`;
  list.forEach((t) => {
    const route = t.route || [];
    const res = t.results || {};
    const order = [...route, ...ch.map((c) => c.id).filter((id) => !route.includes(id))].slice(0, n);
    const firstNext = order.find((id) => !res[id] && t.current?.cid !== id);
    h += `<tr><td><i class="odot ${isOnline(t.id) ? "on" : ""}"></i> <b>${esc(t.name)}</b></td>`;
    order.forEach((id, i) => {
      const r = res[id];
      let cls = "", txt = name(id);
      if (r) { cls = r.status === "passed" ? "done" : "fail"; txt = `${r.status === "passed" ? "✓" : "✗"} ${txt}${r.status === "passed" ? ` <small>+${r.points}</small>` : ""}`; }
      else if (t.current?.cid === id) { cls = "now"; txt = `▶ ${txt}`; }
      else if (id === firstNext) cls = "next";
      const moved = r && r.round && r.round !== i + 1 ? ` <small class="mut">(R${r.round})</small>` : "";
      h += `<td class="tk ${cls}">${txt}${moved}</td>`;
    });
    h += `<td><b>${t.score || 0}</b></td></tr>`;
  });
  $("#trackTable").innerHTML = list.length ? h + "</tbody>" : `<tr><td class="mut">${tr("مفيش فرق لسه")}</td></tr>`;
  // round × challenge (planned)
  if (!hasRoutes) { $("#roundTable").innerHTML = ""; return; }
  let r = `<thead><tr><th>${tr("التحدي")}</th>${Array.from({ length: n }, (_, i) => `<th>${tr("راوند {n}", { n: i + 1 })}</th>`).join("")}</tr></thead><tbody>`;
  ch.forEach((c) => {
    r += `<tr><td><b>${esc(c.name)}</b></td>`;
    for (let i = 0; i < n; i++) {
      const teamsHere = list.filter((t) => t.route[i] === c.id);
      r += `<td class="${teamsHere.length > cap ? "tk fail" : ""}">${teamsHere.map((t) => esc(t.name)).join("<br>") || "—"}</td>`;
    }
    r += "</tr>";
  });
  $("#roundTable").innerHTML = r + "</tbody>";
}
