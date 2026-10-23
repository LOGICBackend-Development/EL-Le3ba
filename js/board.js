import { auth, db, ADMIN_EMAIL, esc, rankSort, rankingHtml, authErrorText } from "./common.js";
import { t as tr } from "./i18n.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, onSnapshot, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = (s) => document.querySelector(s);
const STATUS = { lobby: "لسه مبدأتش", running: "شغّالة", paused: "واقفة", ended: "خلصت" };
let settings = null, teams = [], challenges = [], unsubs = [];

$("#bForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try { await signInWithEmailAndPassword(auth, $("#bEmail").value.trim(), $("#bPass").value); }
  catch (err) { console.error(err); $("#bErr").textContent = authErrorText(err, tr("الإيميل أو الباسورد غلط")); }
});
$("#btnFs").onclick = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.());

onAuthStateChanged(auth, async (u) => {
  unsubs.forEach((f) => f()); unsubs = [];
  if (!u) { $("#login").hidden = false; $("#board").hidden = true; $("#hiddenScreen").hidden = true; return; }
  if (u.email !== ADMIN_EMAIL) { await signOut(auth); $("#bErr").textContent = "لازم حساب الأدمن"; return; }
  $("#login").hidden = true; $("#board").hidden = false;
  unsubs.push(onSnapshot(doc(db, "settings", "game"), (s) => { settings = s.data() || {}; render(); }));
  unsubs.push(onSnapshot(collection(db, "teams"), (s) => { teams = s.docs.map((d) => ({ id: d.id, ...d.data() })); render(); }));
  unsubs.push(onSnapshot(collection(db, "challenges"), (s) => {
    challenges = s.docs.map((d) => ({ id: d.id, ...d.data() })).filter((c) => c.active !== false); render();
  }));
});

function render() {
  if (!settings) return;
  $("#hiddenScreen").hidden = !!settings.leaderboardVisible;
  $("#bTitle").textContent = settings.eventTitle || "الترتيب";
  $("#bStatus").textContent = STATUS[settings.status] || ""; $("#bStatus").dataset.st = settings.status;

  const box = $("#bList");
  const before = new Map([...box.querySelectorAll("[data-id]")].map((el) => [el.dataset.id, el.getBoundingClientRect()]));
  const sorted = [...teams].sort(rankSort);
  const dots = (t) => `<span class="dots">${challenges.map((c) => {
    const r = (t.results || {})[c.id];
    return `<i class="${!r ? "" : r.status === "passed" ? "ok" : "no"}"></i>`;
  }).join("")}</span>`;
  box.innerHTML = rankingHtml(sorted, null, { extra: dots });
  // smooth rank changes (FLIP)
  box.querySelectorAll("[data-id]").forEach((el) => {
    const old = before.get(el.dataset.id);
    if (!old) return;
    const now = el.getBoundingClientRect();
    const dx = old.left - now.left, dy = old.top - now.top;
    if (!dx && !dy) return;
    el.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: "none" }], { duration: 700, easing: "cubic-bezier(.2,.8,.2,1)" });
  });
}
