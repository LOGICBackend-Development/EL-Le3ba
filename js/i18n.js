// Arabic / English. Arabic text is the key; English is looked up here.
// Static text is swapped automatically (incl. text added later by JS); templated text uses t("... {x}", { x }).
const EN = {
  // ---- shared ----
  "اللعبة": "El Le3ba", "اللعبة — LOGIC": "El Le3ba — LOGIC", "اللعبة — The Game": "El Le3ba — The Game",
  "اللعبة — الأدمن": "El Le3ba — Admin", "اللعبة — الترتيب": "El Le3ba — Leaderboard",
  "الترتيب": "Leaderboard", "🏆 الترتيب": "🏆 Leaderboard", "خروج": "Log out", "قفل": "Close", "إلغاء": "Cancel",
  "نقطة": "pts", "{n} نقطة": "{n} pts", "تحديات": "challenges", "الإيميل": "Email", "الباسورد": "Password",
  "اسم المستخدم": "Username", "بنحمّل…": "Loading…", "مش متاح دلوقتي": "Not available right now", "مسح": "Remove",
  "لوبي": "Lobby", "شغّالة": "Live", "واقفة": "Paused", "خلصت": "Ended", "لسه مبدأتش": "Not started yet",
  "فريق {n}": "Team {n}", "،": ",", "؟": "?",

  // ---- team app ----
  "أهلاً يا": "Hi,", "ادخل اللعبة": "Enter the game", "جاهزين يا": "Ready,",
  "إنتوا جوه اللعبة. استنوا إشارة البداية…": "You're in! Wait for the start signal…",
  "استعدوا…": "Get ready…", "بنجهزلكم التحدي الجاي": "Preparing your next challenge",
  "كل التحديات مشغولة دلوقتي… أول ما تحدي يفضى هتدخلوه على طول": "All challenges are busy… you'll jump in as soon as one is free",
  "التحدي الجاي": "Next challenge", "▶ اسمعوا الرسالة": "▶ Play the message", "↻ اسمعوها تاني": "↻ Play again",
  "⏳ بنحمّل الرسالة…": "⏳ Loading message…", "يلا نبدأ ⏱": "Let's go ⏱",
  "لازم تسمعوا الرسالة الأول": "Listen to the message first", "اللعبة واقفة": "Game paused",
  "الوقت هيبدأ أول ما تدوسوا": "The timer starts when you press",
  "الدليل": "Evidence", "صوّروا أول ما تخلّصوا": "Capture it once you're done", "صورة": "Photo", "من الكاميرا": "Camera",
  "فيديو": "Video", "30 ثانية": "30 seconds", "من الجهاز": "Upload", "صورة أو فيديو": "Photo or video",
  "ابعتوا الدليل 🚀": "Send evidence 🚀", "الدليل وصل 📨": "Evidence received 📨",
  "الوقت واقف… مستنيين حكم الأدمن": "Timer paused… waiting for the judge",
  "❤️ فرصة أخيرة": "❤️ Last chance", "❤️ الفرصة الأخيرة": "❤️ Last chance", "❤️❤️ المحاولة الأولى": "❤️❤️ First attempt",
  "معاكم": "You have", "دقيقة بس. لو معدّتوش هتتنقلوا للتحدي الجاي.": "minutes only. Fail again and you move to the next challenge.",
  "ابدأوا الفرصة الأخيرة ⏱": "Start last chance ⏱", "خلّصتوا كل التحديات!": "You finished all challenges!",
  "اللعبة خلصت": "Game over", "الوقت متجمد… استنوا الإشارة": "Timer frozen… wait for the signal",
  "⏺ ابدأ التصوير": "⏺ Start recording", "⏹ وقّف": "⏹ Stop",
  "اسم المستخدم أو الباسورد غلط": "Wrong username or password", "متأكدين إنكم عايزين تخرجوا؟": "Are you sure you want to log out?",
  "ده حساب الأدمن — افتح صفحة admin.html": "This is the admin account — open admin.html",
  "الحساب ده مش متسجل كفريق": "This account isn't registered as a team",
  "افتح صفحة الأدمن": "Open the admin page",
  "امسح الكود عشان تدخل اللعبة": "Scan to enter the game",
  "رسالة الترحيب (قبل البداية)": "Welcome message (before the start)",
  "الفرق بتشوفها وتسمعها في اللوبي قبل ما تبدأ اللعبة. سجّل VN أو ارفع ملف، واكتب رسالة قصيرة لو حابب.": "Teams see and hear it in the lobby before the game starts. Record or upload a voice note, and add a short text if you like.",
  "نص الرسالة (اختياري)": "Message text (optional)", "حفظ الرسالة": "Save message", "📣 نادي الفرق يسمعوا": "📣 Call teams to listen",
  "📣 الفرق اللي في اللوبي هتسمع تنبيه": "📣 Teams in the lobby will get an alert",
  "▶ اسمعوا رسالة الترحيب": "▶ Play the welcome message", "المضيف عنده رسالة ليكم": "The host has a message for you",
  "▶ دوسوا عشان تسمعوا": "▶ Tap to listen",
  "التتبع": "Tracking",
  "الميسّر (Co-trainer)": "Facilitator (co-trainer)", "موبايل الميسّر": "Facilitator mobile", "اسم الميسّر": "Facilitator name",
  "مفيش ميسّر": "No facilitator",
  "النقط دلوقتي:": "Current points:", "النقط الجديدة": "New points", "السبب (اختياري)": "Reason (optional)",
  "مثلاً: مشكلة في التحدي": "e.g. problem at the challenge", "حفظ النقط": "Save points",
  "النقط اتعدلت ✓ والترتيب اتحدّث": "Points updated ✓ leaderboard refreshed", "اتصل": "Call", "الميسّر:": "Facilitator:",
  "اسحب الدايرة على بقّه بالماوس أو بصباعك — أو استخدم الأسهم. بيتحفظ لوحده.": "Drag the circle onto his mouth with the mouse or your finger — or use the arrows. It saves automatically.",
  "− أصغر": "− Smaller", "+ أكبر": "+ Bigger", "↺ المكان الافتراضي": "↺ Default position", "مسار كل فريق": "Each team's route", "🔀 اعمل المسارات": "🔀 Generate routes",
  "✓ عدّى": "✓ Passed", "✗ معدّاش": "✗ Failed", "▶ بيلعب دلوقتي": "▶ Playing now", "الجاي": "Next",
  "كل راوند مين فين": "Who is where each round", "الفريق": "Team", "التحدي": "Challenge", "راوند {n}": "Round {n}",
  "المسارات اتعملت ✓": "Routes generated ✓",
  "اللعبة بدأت. المسارات الجديدة هتطبق على التحديات اللي لسه. تكمّل؟": "The game has started. New routes apply to the remaining challenges only. Continue?",
  "المسارات لسه متعملتش — هتتعمل لوحدها لما تدوس ابدأ، أو دوس الزرار.": "Routes not generated yet — they're created automatically when you press Start, or press the button.",
  "عدد الفرق أكبر من التحديات × الـ Sets — لو التحدي الجاي مشغول الفريق بياخد أقرب تحدي فاضي.": "More teams than challenges × sets — if the next challenge is busy, the team takes the nearest free one.",
  "كل فريق بيمشي على مساره بالترتيب. لو التحدي الجاي لسه مشغول، الفريق بيستنى لحد ما يفضى.": "Each team follows its route in order. If its next challenge is still busy, it waits until it's free.",
  "✅ {name}: +{pts} نقطة": "✅ {name}: +{pts} pts", "❌ {name}: معدّاش… على التحدي الجاي": "❌ {name}: failed… on to the next one",
  "الدليل اترفض ❌ معاكم فرصة أخيرة": "Evidence declined ❌ you have one last chance",
  "⏰ الوقت خلص! معاكم فرصة أخيرة": "⏰ Time's up! One last chance",
  "مش قادرين نقرا الصورة دي… صوّروها تاني": "Couldn't read that photo… take it again",
  'الفيديو كبير — استخدموا زرار "🎥 فيديو" (أقصى 30 ثانية)': 'Video too large — use the "🎥 Video" button (max 30 s)',
  "نوع الملف ده مش مدعوم": "File type not supported",
  "مش قادرين نفتح الكاميرا — اسمحوا للمتصفح باستخدامها": "Can't open the camera — allow camera access",
  "التصوير مش مدعوم على الجهاز ده — استخدموا 📁 من الجهاز": "Recording isn't supported here — use 📁 Upload",
  "اللعبة واقفة دلوقتي": "The game is paused", "حصلت مشكلة في الشبكة… جربوا تاني": "Network problem… try again",
  "📨 الدليل اتبعت": "📨 Evidence sent", "الرفع فشل… جربوا تاني": "Upload failed… try again",
  "حصلت مشكلة… جربوا تاني": "Something went wrong… try again",
  "خلّصتوا": "Done", "3": "3", "يلا!": "GO!", "برافو!": "Well done!", "معدّاش المرة دي": "Not this time",
  "على التحدي الجاي…": "On to the next challenge…", "إزاي تلعبوا": "How to play",
  "اسمعوا رسالة المضيف": "Listen to the host's message", "خلّصوا التحدي قبل الوقت": "Beat the challenge before time runs out",
  "صوّروا الدليل وابعتوه": "Capture the evidence and send it", "كل ما تخلّصوا أسرع، نقطكم أكتر": "Finish faster, score higher",
  "دوسوا عشان تكمّلوا": "Tap to continue",

  // ---- admin ----
  "دخول": "Log in", "التحكم": "Control", "الأدلة": "Evidence", "التحديات": "Challenges", "الفرق": "Teams", "الإعدادات": "Settings",
  "تفعيل التنبيهات": "Enable alerts", "شاشة الترتيب": "Leaderboard screen",
  "▶ ابدأ / كمّل": "▶ Start / Resume", "⏸ وقّف": "⏸ Pause", "🏁 إنهاء اللعبة": "🏁 End game", "↺ ريست كامل": "↺ Full reset",
  "متصلين": "Online", "أدلة مستنية": "Pending evidence", "إظهار الترتيب": "Show leaderboard",
  "التحديات دلوقتي": "Challenges now", "مفيش أدلة مستنية ✨": "No pending evidence ✨",
  "الـ VN بيتشغل للفريق full screen مع الشخصية. يفضّل MP3 أو M4A (أقصى 4MB). ولو عندك فيديو أفاتار جاهز (HeyGen / D-ID) ارفعه MP4 (أقصى 15MB) وهيتشغل بداله.":
    "The voice note plays full screen with the host. Prefer MP3 or M4A (max 4MB). If you have a ready talking-avatar video (HeyGen / D-ID), upload it as MP4 (max 15MB) and it will play instead.",
  "+ تحدي جديد": "+ New challenge", "تجهيز الفرق": "Set up teams", "عدد الفرق": "Number of teams", "جهّز الفرق": "Create teams",
  "🖨 اطبع كروت الدخول": "🖨 Print login cards",
  "بيعمل حسابات جديدة لحد ما يوصل للعدد ده. الحسابات الموجودة بتفضل زي ما هي.": "Creates new accounts up to this number. Existing accounts stay as they are.",
  "اسم الفريق": "Team name", "اليوزر": "Username", "النقط": "Points", "شخصية المضيف": "Host character",
  "ارفع صورة الشخصية (نسختك المرخّصة) ودوس مرة واحدة على بقّه في الصورة. البق والدقن هيتحركوا مع الـ VN. من غير صورة هتشتغل الشخصية المرسومة.":
    "Upload the host image (your licensed copy) and tap once on his mouth. Mouth and chin move with the voice note. Without an image, the drawn host is used.",
  "🖼 ارفع صورة": "🖼 Upload image", "▶ جرّب مع VN": "▶ Test with a voice note", "رجّع الشخصية المرسومة": "Use the default host",
  "عرض البق": "Mouth width", "حفظ مكان البق": "Save mouth position",
  "اسم الإيفنت (بيظهر على شاشة الترتيب)": "Event name (shown on the leaderboard)", "عدد الـ Sets": "Number of sets",
  "وقت التحدي (دقيقة)": "Challenge time (min)", "وقت الفرصة الأخيرة (دقيقة)": "Last-chance time (min)", "نقط الفرصة الأخيرة": "Last-chance points",
  "عدد الـ Sets = أقصى عدد فرق في نفس التحدي في نفس الوقت.": "Sets = max number of teams inside the same challenge at once.",
  "النقط حسب الوقت (المحاولة الأولى)": "Points by finish time (first attempt)", "+ شريحة": "+ Bracket", "حفظ الإعدادات": "Save settings",
  "لحد دقيقة": "Up to minute", "بيسمع الرسالة": "Listening", "بيلعب": "Playing", "مستني الحكم": "Waiting for judge",
  "فرصة أخيرة (لسه مبدأش)": "Last chance (not started)", "فرصة أخيرة": "Last chance", "الإيميل أو الباسورد غلط": "Wrong email or password",
  "الحساب ده مش أدمن": "This account isn't the admin", "راجع الـ Firestore rules والإيميل في firebase-config.js": "Check the Firestore rules and the email in firebase-config.js",
  'مفيش فرق لسه — روح تبويب "الفرق" وجهّزهم': 'No teams yet — go to "Teams" and create them',
  "خلّص كل التحديات 🏁": "Finished all challenges 🏁", "في اللوبي": "In lobby", "مستني تحدي يفضى": "Waiting for a free challenge",
  "تخطي التحدي": "Skip challenge", "ريست الفريق": "Reset team", "فاضي": "Free", "{a}/{b} تحدي": "{a}/{b} done",
  "جهّز الفرق الأول": "Create teams first", "{on} من {all} فرق بس متصلين. تبدأ برضه؟": "Only {on} of {all} teams are online. Start anyway?",
  "إنهاء اللعبة لكل الفرق؟": "End the game for all teams?",
  "ريست كامل: كل النقط والتقدم هيتمسحوا وترجع للوبي. متأكد؟": "Full reset: all points and progress will be cleared and the game returns to the lobby. Sure?",
  "آخر تأكيد — مفيش رجوع.": "Final confirmation — this can't be undone.", "تم الريست": "Reset done",
  "تخطي التحدي الحالي لـ {name}؟ (هياخد صفر فيه)": "Skip {name}'s current challenge? (scores 0)",
  "ريست {name}؟ نقطه وتقدمه هيتمسحوا.": "Reset {name}? Points and progress will be cleared.",
  "📩 دليل جديد: {names}": "📩 New evidence: {names}", "اللعبة — دليل جديد": "El Le3ba — new evidence",
  "المتصفح ده مش بيدعم التنبيهات — الصوت شغّال": "This browser has no notifications — sound is on",
  "التنبيهات اتفعّلت 🔔": "Alerts enabled 🔔", "التنبيهات مش متفعّلة — الصوت بس": "Notifications off — sound only",
  "بنحمّل الدليل…": "Loading evidence…", "الوقت:": "Time:", "· لو اتقبل:": "· If approved:", "✓ قبول": "✓ Approve", "✗ رفض": "✗ Decline",
  "مش قادرين نحمّل الدليل — اسأل الفريق يبعته تاني": "Couldn't load the evidence — ask the team to resend",
  "حصلت مشكلة… جرب تاني": "Something went wrong… try again",
  "✓ {name} +{pts}": "✓ {name} +{pts}", "الفريق مش في التحدي ده دلوقتي — الدليل اتمسح": "Team isn't in this challenge anymore — evidence removed",
  "✗ {name}: رايح للفرصة الأخيرة": "✗ {name}: going to last chance", "✗ {name}: اتنقل للتحدي الجاي": "✗ {name}: moved to the next challenge",
  "ترتيب": "Order", "اسم التحدي": "Challenge name", "مفعّل": "Active", "وصف قصير بيظهر للفريق (اختياري)": "Short description shown to teams (optional)",
  "🎙 فيه VN": "🎙 Voice note ready", "مفيش VN": "No voice note", "▶ جرّب مع الأفاتار": "▶ Preview with host",
  "⏹ وقّف وسجّل": "⏹ Stop & save", "🎙 سجّل VN": "🎙 Record voice note", "📁 ارفع ملف": "📁 Upload file",
  "🎬 فيه فيديو أفاتار": "🎬 Avatar video ready", "مفيش فيديو (اختياري)": "No video (optional)", "▶ شوف الفيديو": "▶ Watch video",
  "🎬 ارفع فيديو MP4": "🎬 Upload MP4 video", "حفظ": "Save", "مسح التحدي": "Delete challenge", "تحدي": "Challenge",
  "تحدي {n}": "Challenge {n}", "اتحفظ ✓": "Saved ✓",
  "فيه {n} فريق جوه التحدي ده دلوقتي. تمسحه برضه؟": "{n} team(s) are inside this challenge now. Delete anyway?",
  'مسح "{name}"؟': 'Delete "{name}"?', "مش قادرين نشغّل الملف": "Couldn't play the file", "مسح الـ VN؟": "Delete the voice note?",
  "مش قادرين نشغّل الفيديو": "Couldn't play the video",
  "مسح فيديو الأفاتار؟ (هيرجع يشتغل الـ VN مع الشخصية)": "Delete the avatar video? (the voice note + host will play instead)",
  "🎙 بيسجّل… دوس وقّف لما تخلص": "🎙 Recording… press stop when done", "مش قادرين نفتح المايك": "Can't open the microphone",
  "الملف أكبر من 4MB — صغّره أو قصّره": "File is over 4MB — compress or shorten it", "بنرفع الـ VN…": "Uploading voice note…",
  "الـ VN اتحفظ ✓": "Voice note saved ✓", "الرفع فشل": "Upload failed",
  "الفيديو أكبر من 15MB — صغّره (720p كفاية)": "Video is over 15MB — compress it (720p is enough)",
  "بنرفع الفيديو… استنى شوية": "Uploading video… please wait", "الفيديو اتحفظ ✓": "Video saved ✓",
  "مفيش فرق لسه": "No teams yet", "مسح {name} نهائياً؟": "Permanently delete {name}?", "عندك {n} فرق بالفعل": "You already have {n} teams",
  "بيجهّز… {a}/{b}": "Creating… {a}/{b}", "اتعمل {n} فريق ✓": "{n} teams created ✓",
  "فعّل Email/Password في Firebase Authentication": "Enable Email/Password in Firebase Authentication",
  "حصلت مشكلة: {e}": "Error: {e}", "اسمح بالـ popups عشان تطبع": "Allow pop-ups to print", "كروت الدخول": "Login cards",
  "اليوزر:": "Username:", "الباسورد:": "Password:", "لازم شريحة نقط واحدة على الأقل": "Add at least one points bracket",
  "الإعدادات اتحفظت ✓": "Settings saved ✓", "مش قادرين نحمّل صورة الشخصية": "Couldn't load the host image",
  "مكان البق اتحفظ ✓": "Mouth position saved ✓", "بنرفع الصورة…": "Uploading image…",
  "الصورة اترفعت ✓ دوس على البق في الصورة وبعدين حفظ": "Image uploaded ✓ tap the mouth, then save",
  "ترجع للشخصية المرسومة؟": "Switch back to the default host?", "سجّل VN لأي تحدي الأول": "Record a voice note for any challenge first",
  "مش قادرين نشغّل الـ VN": "Couldn't play the voice note", "جهّز الفرق": "Create teams",

  // ---- board ----
  "ادخل بحساب الأدمن على الجهاز اللي متوصل بالشاشة": "Log in with the admin account on the device connected to the screen",
  "افتح الشاشة": "Open screen", "ملء الشاشة": "Full screen", "الترتيب مخفي": "Leaderboard hidden",
  "النتيجة هتتكشف قريب…": "Results will be revealed soon…", "لازم حساب الأدمن": "Admin account required",
};

const KEY = "le3ba-lang";
export let lang = (() => { try { return localStorage.getItem(KEY) || "en"; } catch { return "en"; } })();
const AR = /[؀-ۿ]/;

export function t(s, vars = {}) {
  let out = lang === "en" ? (EN[s] ?? s) : s;
  for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v));
  return out;
}

function trText(node) {
  const raw = node.nodeValue;
  if (!raw || !AR.test(raw)) return;
  const key = raw.trim(), en = EN[key];
  if (en !== undefined) node.nodeValue = raw.replace(key, en);
}
function trAttrs(el) {
  for (const a of ["placeholder", "title", "alt", "aria-label"]) {
    const v = el.getAttribute?.(a);
    if (v && AR.test(v) && EN[v.trim()] !== undefined) el.setAttribute(a, EN[v.trim()]);
  }
}
function walk(root) {
  if (root.nodeType === 3) { trText(root); return; }
  if (root.nodeType !== 1 || root.tagName === "SCRIPT" || root.tagName === "STYLE") return;
  trAttrs(root);
  const it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n;
  while ((n = it.nextNode())) { if (n.nodeType === 3) trText(n); else trAttrs(n); }
}

export function setLang(l) { try { localStorage.setItem(KEY, l); } catch { /* ignore */ } location.reload(); }

(function init() {
  const html = document.documentElement;
  html.lang = lang; html.dir = lang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-lang-toggle]").forEach((b) => {
    b.textContent = lang === "ar" ? "EN" : "ع";
    b.title = lang === "ar" ? "English" : "عربي";
    b.onclick = () => setLang(lang === "ar" ? "en" : "ar");
  });
  html.classList.add("i18n-ready");
  if (lang !== "en") return;
  document.title = t(document.title);
  walk(document.body);
  new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.type === "characterData") trText(m.target);
      else if (m.type === "attributes") trAttrs(m.target);
      else m.addedNodes.forEach(walk);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "title", "alt"] });
})();
