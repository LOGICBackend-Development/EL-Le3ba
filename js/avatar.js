// Original host: grandpa sitting in his armchair inside a room. Lip-sync driven live by the voice note's volume.
// setMode("card") = head & shoulders crop, setMode("full") = whole scene (full-screen theater).
const VIEW = { card: "75 165 250 250", full: "0 0 400 700" };

const SVG = `
<svg viewBox="${VIEW.card}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs>
  <linearGradient id="gWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#24206e"/><stop offset="1" stop-color="#0d0c38"/></linearGradient>
  <linearGradient id="gFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241a5c"/><stop offset="1" stop-color="#080722"/></linearGradient>
  <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c0930"/><stop offset="1" stop-color="#2d2190"/></linearGradient>
  <radialGradient id="gLamp" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(62 300) scale(230)">
    <stop offset="0" stop-color="#ffd27a" stop-opacity=".55"/><stop offset=".5" stop-color="#ffb84d" stop-opacity=".16"/><stop offset="1" stop-color="#ffb84d" stop-opacity="0"/></radialGradient>
  <radialGradient id="gVig" cx="50%" cy="45%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
  <linearGradient id="gChair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6a6a76"/><stop offset=".55" stop-color="#3e3e48"/><stop offset="1" stop-color="#25252c"/></linearGradient>
  <linearGradient id="gChairSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2c2c33"/><stop offset=".6" stop-color="#4b4b56"/><stop offset="1" stop-color="#34343c"/></linearGradient>
  <linearGradient id="gWood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a3018"/><stop offset=".45" stop-color="#9a5a32"/><stop offset="1" stop-color="#4a2612"/></linearGradient>
  <linearGradient id="gKnit" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2d0b0"/><stop offset=".6" stop-color="#bfa682"/><stop offset="1" stop-color="#8f7655"/></linearGradient>
  <linearGradient id="gPants" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3cfa8"/><stop offset="1" stop-color="#a88c63"/></linearGradient>
  <radialGradient id="gSkin" cx="42%" cy="35%" r="72%"><stop offset="0" stop-color="#ffe0c8"/><stop offset=".7" stop-color="#f1b996"/><stop offset="1" stop-color="#d9977a"/></radialGradient>
  <radialGradient id="gHand" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ffd9bf"/><stop offset="1" stop-color="#d8977a"/></radialGradient>
  <linearGradient id="gHair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#d4d5dc"/><stop offset="1" stop-color="#9a9ba6"/></linearGradient>
  <radialGradient id="gShoe" cx="40%" cy="30%" r="70%"><stop offset="0" stop-color="#4a4a52"/><stop offset="1" stop-color="#0c0c10"/></radialGradient>
  <filter id="fSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="fGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>

<!-- ===== ROOM ===== -->
<rect width="400" height="560" fill="url(#gWall)"/>
<g opacity=".08" stroke="#fff" stroke-width="2"><path d="M0 120 H400 M0 240 H400 M0 360 H400"/></g>
<rect y="430" width="400" height="130" fill="#16144d"/>
<rect y="426" width="400" height="8" fill="#7d4bd0"/>
<g stroke="#0b0a2e" stroke-width="3" fill="none"><rect x="14" y="448" width="80" height="94" rx="4"/><rect x="306" y="448" width="80" height="94" rx="4"/></g>

<!-- window -->
<rect x="22" y="62" width="122" height="168" rx="6" fill="#3b2f9e"/>
<rect x="30" y="70" width="106" height="152" rx="3" fill="url(#gSky)"/>
<circle cx="104" cy="104" r="15" fill="#fff4cf" filter="url(#fGlow)"/>
<circle cx="110" cy="99" r="12" fill="#2a1f86" opacity=".55"/>
<g fill="#fff"><circle cx="48" cy="92" r="1.6"/><circle cx="66" cy="132" r="1.2"/><circle cx="122" cy="150" r="1.4"/><circle cx="52" cy="180" r="1.2"/><circle cx="94" cy="196" r="1.5"/></g>
<path d="M83 70 V222 M30 146 H136" stroke="#3b2f9e" stroke-width="5"/>
<path d="M12 56 C30 120 22 190 34 244 L10 244 Z" fill="#b0307e"/><path d="M154 56 C136 120 144 190 132 244 L156 244 Z" fill="#b0307e"/>
<rect x="6" y="52" width="156" height="8" rx="4" fill="#f7b27a"/>

<!-- bookshelf -->
<rect x="268" y="74" width="118" height="300" rx="6" fill="#4a2a16"/>
<rect x="276" y="82" width="102" height="284" fill="#2a170b"/>
<g fill="#5e3720"><rect x="276" y="148" width="102" height="6"/><rect x="276" y="220" width="102" height="6"/><rect x="276" y="292" width="102" height="6"/></g>
<g>
  <rect x="282" y="100" width="10" height="48" fill="#f7b27a"/><rect x="294" y="94" width="12" height="54" fill="#f0609a"/><rect x="308" y="104" width="9" height="44" fill="#2fc4a2"/>
  <rect x="319" y="98" width="13" height="50" fill="#8f6be0"/><path d="M336 148 L346 106 L355 108 L345 148 Z" fill="#f08a5d"/>
  <rect x="284" y="170" width="12" height="50" fill="#2fc4a2"/><rect x="298" y="176" width="10" height="44" fill="#fff"/><rect x="310" y="168" width="14" height="52" fill="#f0609a"/>
  <rect x="326" y="178" width="9" height="42" fill="#f7b27a"/><circle cx="356" cy="205" r="14" fill="#2fc4a2"/><rect x="351" y="214" width="10" height="6" fill="#5e3720"/>
  <rect x="282" y="244" width="40" height="48" rx="3" fill="#f7b27a" opacity=".9"/><rect x="288" y="250" width="28" height="36" fill="#3d2ea8"/>
  <rect x="330" y="240" width="11" height="52" fill="#8f6be0"/><rect x="343" y="246" width="12" height="46" fill="#f08a5d"/><rect x="357" y="238" width="10" height="54" fill="#f0609a"/>
  <rect x="284" y="318" width="60" height="12" rx="2" fill="#f0609a"/><rect x="288" y="306" width="54" height="12" rx="2" fill="#2fc4a2"/><rect x="290" y="330" width="56" height="14" rx="2" fill="#f7b27a"/>
</g>

<!-- floor & rug -->
<rect y="560" width="400" height="140" fill="url(#gFloor)"/>
<g stroke="#120b30" stroke-width="2" opacity=".6"><path d="M0 590 H400 M0 625 H400 M0 665 H400"/><path d="M80 560 V590 M210 590 V625 M120 625 V665 M300 560 V590 M330 625 V665"/></g>
<ellipse cx="200" cy="648" rx="196" ry="44" fill="#5a2fa8"/>
<ellipse cx="200" cy="648" rx="178" ry="34" fill="none" stroke="#f7b27a" stroke-width="3" stroke-dasharray="10 8"/>
<ellipse cx="200" cy="648" rx="150" ry="24" fill="#6e3cc0"/>

<!-- side table -->
<ellipse cx="352" cy="542" rx="40" ry="10" fill="#8a4f2a"/>
<rect x="346" y="542" width="12" height="78" fill="#5a3018"/><ellipse cx="352" cy="622" rx="26" ry="6" fill="#4a2612"/>
<path d="M340 520 L364 520 L361 538 L343 538 Z" fill="#fff"/><path d="M364 524 C374 524 374 534 362 534" stroke="#fff" stroke-width="3" fill="none"/>
<path d="M346 514 C342 506 350 502 346 494 M356 514 C352 506 360 502 356 494" stroke="#fff" stroke-width="2" fill="none" opacity=".5"/>

<!-- floor lamp -->
<ellipse cx="62" cy="636" rx="28" ry="7" fill="#1a1240"/>
<rect x="59" y="300" width="6" height="336" fill="#d9b25a"/>
<path d="M28 300 L96 300 L84 252 L40 252 Z" fill="#ffe2a0"/><path d="M28 300 L96 300 L94 294 L30 294 Z" fill="#e8b44a"/>
<rect width="400" height="700" fill="url(#gLamp)"/>

<!-- ===== CHAIR ===== -->
<ellipse cx="200" cy="634" rx="150" ry="18" fill="#000" opacity=".4" filter="url(#fSoft)"/>
<rect x="92" y="520" width="16" height="104" rx="4" fill="url(#gWood)"/><rect x="292" y="520" width="16" height="104" rx="4" fill="url(#gWood)"/>
<path d="M108 474 L108 250 C108 196 142 176 200 176 C258 176 292 196 292 250 L292 474 Z" fill="url(#gChair)"/>
<path d="M130 210 C160 196 240 196 270 210" stroke="#8a8a96" stroke-width="3" fill="none" opacity=".5"/>
<path d="M88 470 L88 292 C84 254 108 238 132 248 L140 470 Z" fill="url(#gChairSide)"/>
<path d="M312 470 L312 292 C316 254 292 238 268 248 L260 470 Z" fill="url(#gChairSide)"/>
<rect x="104" y="488" width="192" height="40" rx="10" fill="#2e2e36"/>
<rect x="112" y="430" width="176" height="64" rx="20" fill="#4a4a55"/>
<path d="M74 420 C74 394 132 390 142 410 L142 524 L82 524 C78 484 74 452 74 420 Z" fill="url(#gChairSide)"/>
<path d="M326 420 C326 394 268 390 258 410 L258 524 L318 524 C322 484 326 452 326 420 Z" fill="url(#gChairSide)"/>
<ellipse cx="106" cy="412" rx="34" ry="16" fill="#62626e"/><ellipse cx="294" cy="412" rx="34" ry="16" fill="#62626e"/>
<path d="M80 418 L94 418 L104 606 L90 606 Z" fill="url(#gWood)"/><path d="M320 418 L306 418 L296 606 L310 606 Z" fill="url(#gWood)"/>

<!-- ===== GRANDPA ===== -->
<!-- legs -->
<path d="M150 442 C140 472 140 502 146 524 L194 524 C198 496 198 466 198 442 Z" fill="url(#gPants)"/>
<path d="M250 442 C260 472 260 502 254 524 L206 524 C202 496 202 466 202 442 Z" fill="url(#gPants)"/>
<path d="M148 516 L194 516 L188 600 L156 600 Z" fill="url(#gPants)"/>
<path d="M252 516 L206 516 L212 600 L244 600 Z" fill="url(#gPants)"/>
<path d="M172 520 L172 598 M228 520 L228 598" stroke="#9c8159" stroke-width="2" opacity=".6"/>
<rect x="157" y="596" width="30" height="14" rx="3" fill="#cfcfd6"/><rect x="213" y="596" width="30" height="14" rx="3" fill="#cfcfd6"/>
<ellipse cx="170" cy="616" rx="28" ry="12" fill="url(#gShoe)"/><ellipse cx="230" cy="616" rx="28" ry="12" fill="url(#gShoe)"/>
<path d="M156 610 Q170 606 184 610" stroke="#8a8a96" stroke-width="2" fill="none"/><path d="M216 610 Q230 606 244 610" stroke="#8a8a96" stroke-width="2" fill="none"/>
<path d="M144 622 Q170 630 198 622 M202 622 Q230 630 256 622" stroke="#b07a4a" stroke-width="3" fill="none"/>

<!-- torso -->
<path d="M140 450 C132 392 138 334 160 314 C176 302 224 302 240 314 C262 334 268 392 260 450 Z" fill="url(#gKnit)"/>
<g stroke="#9c8262" stroke-width="1.6" opacity=".55">
  <path d="M152 340 L150 448 M160 330 L158 448 M168 322 L166 448"/><path d="M248 340 L250 448 M240 330 L242 448 M232 322 L234 448"/>
</g>
<path d="M182 308 L200 364 L218 308 Z" fill="#a7c6a0"/>
<path d="M182 308 L193 330 L200 312 Z" fill="#c6dcbf"/><path d="M218 308 L207 330 L200 312 Z" fill="#c6dcbf"/>
<path d="M178 308 L200 374 L222 308" stroke="#a88e6c" stroke-width="7" fill="none" stroke-linejoin="round"/>
<path d="M200 374 L200 450" stroke="#a88e6c" stroke-width="7"/>
<g fill="#7a4a24"><circle cx="200" cy="388" r="4.5"/><circle cx="200" cy="410" r="4.5"/><circle cx="200" cy="432" r="4.5"/></g>
<path d="M150 418 L174 418 M226 418 L250 418" stroke="#a88e6c" stroke-width="3" opacity=".7"/>

<!-- arms + hands on knees -->
<path d="M156 318 C134 330 118 372 112 404 C112 418 130 446 160 462 L176 446 C154 432 140 414 140 402 C146 380 158 352 170 334 Z" fill="url(#gKnit)"/>
<path d="M244 318 C266 330 282 372 288 404 C288 418 270 446 240 462 L224 446 C246 432 260 414 260 402 C254 380 242 352 230 334 Z" fill="url(#gKnit)"/>
<path d="M150 440 L166 456 M250 440 L234 456" stroke="#8f7655" stroke-width="5"/>
<ellipse cx="170" cy="462" rx="15" ry="12" fill="url(#gHand)"/><ellipse cx="230" cy="462" rx="15" ry="12" fill="url(#gHand)"/>
<path d="M162 470 L162 476 M168 472 L168 478 M174 472 L174 477" stroke="#d08c6e" stroke-width="3" stroke-linecap="round"/>
<path d="M238 470 L238 476 M232 472 L232 478 M226 472 L226 477" stroke="#d08c6e" stroke-width="3" stroke-linecap="round"/>
<path d="M236 450 L250 444 L254 452 L240 458 Z" fill="#c9962f"/>

<!-- neck -->
<path d="M184 284 L184 314 Q200 322 216 314 L216 284 Z" fill="#dc9c7c"/>
<ellipse cx="200" cy="306" rx="20" ry="6" fill="#a8664a" opacity=".35"/>

<!-- head -->
<g class="av-head">
  <ellipse cx="154" cy="252" rx="10" ry="15" fill="#eab394"/><ellipse cx="246" cy="252" rx="10" ry="15" fill="#eab394"/>
  <path d="M156 252 Q152 246 157 241 M244 252 Q248 246 243 241" stroke="#c98c6c" stroke-width="2" fill="none"/>
  <ellipse cx="200" cy="250" rx="46" ry="56" fill="url(#gSkin)"/>
  <path d="M157 238 C150 204 170 186 198 184 C228 182 247 198 246 228 C240 214 230 208 218 208 C214 198 202 194 192 198 C176 196 164 208 160 222 Z" fill="url(#gHair)"/>
  <path d="M170 198 C180 172 224 166 238 186 C228 182 212 182 204 190 C198 184 182 186 170 198 Z" fill="#fff"/>
  <path d="M182 192 C192 182 208 180 222 184" stroke="#a8a9b2" stroke-width="2" fill="none"/>
  <path d="M156 240 C152 250 154 258 157 262 C159 254 160 248 162 243 Z" fill="#dcdde3"/>
  <path d="M244 240 C248 250 246 258 243 262 C241 254 240 248 238 243 Z" fill="#dcdde3"/>
  <path d="M182 212 Q200 207 218 212 M186 219 Q200 215 214 219" stroke="#d49a7a" stroke-width="1.5" fill="none" opacity=".7"/>
  <g class="av-brows">
    <path d="M166 230 C173 222 188 221 195 228 C186 227 176 229 166 234 Z" fill="#f0f0f4" stroke="#b5b6be" stroke-width="1.2"/>
    <path d="M234 230 C227 222 212 221 205 228 C214 227 224 229 234 234 Z" fill="#f0f0f4" stroke="#b5b6be" stroke-width="1.2"/>
  </g>
  <g class="av-eyes">
    <ellipse cx="181" cy="246" rx="7.5" ry="6" fill="#fff"/><ellipse cx="219" cy="246" rx="7.5" ry="6" fill="#fff"/>
    <circle cx="182" cy="247" r="4" fill="#4a2e1c"/><circle cx="218" cy="247" r="4" fill="#4a2e1c"/>
    <circle cx="183.5" cy="245.5" r="1.3" fill="#fff"/><circle cx="219.5" cy="245.5" r="1.3" fill="#fff"/>
  </g>
  <g fill="rgba(255,255,255,.1)" stroke="#121212" stroke-width="4.5" stroke-linejoin="round">
    <rect x="164" y="234" width="33" height="25" rx="7"/><rect x="203" y="234" width="33" height="25" rx="7"/>
  </g>
  <path d="M197 243 Q200 239 203 243" stroke="#121212" stroke-width="3.5" fill="none"/>
  <path d="M164 240 L152 238 M236 240 L248 238" stroke="#121212" stroke-width="3.5"/>
  <path d="M169 239 L175 237.5 M208 239 L214 237.5" stroke="#fff" stroke-width="2" opacity=".55"/>
  <path d="M200 250 C195 262 189 268 194 273 C198 276 202 276 206 273 C211 268 205 262 200 250 Z" fill="#e5a283"/>
  <circle cx="172" cy="272" r="8" fill="#f19a86" opacity=".35"/><circle cx="228" cy="272" r="8" fill="#f19a86" opacity=".35"/>
  <path d="M176 270 Q173 279 179 287 M224 270 Q227 279 221 287" stroke="#d49a7a" stroke-width="1.6" fill="none"/>
  <ellipse class="av-mouth" cx="200" cy="284" rx="13" ry="1.5" fill="#5a1616"/>
  <rect class="av-teeth" x="191" y="282.5" width="18" height="0" rx="1.5" fill="#fffaf0"/>
  <path d="M185 282 Q200 288 215 282" stroke="#b5665a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <g class="av-jaw">
    <path d="M178 284 Q200 297 222 284 C222 299 213 309 200 311 C187 309 178 299 178 284 Z" fill="#f0bd9c"/>
    <path d="M191 290 Q200 295 209 290" stroke="#c97a6a" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M194 304 Q200 306 206 304" stroke="#d49a7a" stroke-width="1.4" fill="none"/>
  </g>
</g>

<rect width="400" height="700" fill="url(#gVig)" pointer-events="none"/>
</svg>`;

// Photo host: any uploaded character image. The area under the mouth is cut out and moved down
// with the voice (jaw drop), revealing a dark mouth behind it.
function photoSvg(p) {
  const { url, W, H, mx, my, mw } = p;
  const f = (n) => n.toFixed(1);
  const chin = `M${f(mx - 0.75 * mw)} ${f(my - 0.04 * mw)} Q${f(mx)} ${f(my + 0.1 * mw)} ${f(mx + 0.75 * mw)} ${f(my - 0.04 * mw)}
    L${f(mx + 0.7 * mw)} ${f(my + 0.75 * mw)} Q${f(mx)} ${f(my + 1.25 * mw)} ${f(mx - 0.7 * mw)} ${f(my + 0.75 * mw)} Z`;
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <filter id="phFeather" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${f(mw * 0.07)}"/></filter>
    <mask id="phChin" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
      <rect width="${W}" height="${H}" fill="#000"/><path d="${chin}" fill="#fff" filter="url(#phFeather)"/>
    </mask>
    <radialGradient id="phMouthG" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#6e1d18"/><stop offset=".7" stop-color="#3a0c09"/><stop offset="1" stop-color="#1a0403"/></radialGradient>
    <filter id="phSoft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${f(mw * 0.015)}"/></filter>
    <radialGradient id="phWarm" cx="78%" cy="70%" r="60%"><stop offset="0" stop-color="#ff9a3c" stop-opacity=".35"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>
    <radialGradient id="phVig" cx="50%" cy="45%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>
  </defs>
  <g class="ph-all">
    <image href="${url}" width="${W}" height="${H}"/>
    <ellipse class="ph-mouth" cx="${f(mx)}" cy="${f(my)}" rx="${f(mw * 0.4)}" ry="0" fill="url(#phMouthG)" filter="url(#phSoft)"/>
    <ellipse class="ph-teeth" cx="${f(mx)}" cy="${f(my)}" rx="${f(mw * 0.26)}" ry="0" fill="#f4ede4" opacity=".92" filter="url(#phSoft)"/>
    <g class="ph-jaw"><image href="${url}" width="${W}" height="${H}" mask="url(#phChin)"/></g>
  </g>
  <rect class="ph-glow" width="${W}" height="${H}" fill="url(#phWarm)"/>
  <rect width="${W}" height="${H}" fill="url(#phVig)" pointer-events="none"/>
</svg>`;
}
function photoView(p, mode) {
  if (mode === "full") return `0 0 ${p.W} ${p.H}`;
  const s = p.mw * 5.4;
  const x = Math.max(0, Math.min(p.W - s, p.mx - s / 2));
  const y = Math.max(0, Math.min(p.H - s, p.my - s * 0.62));
  return `${x.toFixed(1)} ${y.toFixed(1)} ${s.toFixed(1)} ${s.toFixed(1)}`;
}

export function createAvatar() {
  const el = document.createElement("div");
  el.className = "avatar";
  let mode = "card", photo = null, r = {};
  let ctx = null, audio = null, raf = 0, amp = 0, t0 = 0;

  function build() {
    el.innerHTML = photo ? photoSvg(photo) : SVG;
    el.classList.toggle("is-photo", !!photo);
    r = photo
      ? { jaw: el.querySelector(".ph-jaw"), mouth: el.querySelector(".ph-mouth"), teeth: el.querySelector(".ph-teeth"), all: el.querySelector(".ph-all") }
      : {
        jaw: el.querySelector(".av-jaw"), mouth: el.querySelector(".av-mouth"), teeth: el.querySelector(".av-teeth"),
        brows: el.querySelector(".av-brows"), head: el.querySelector(".av-head"),
      };
    applyMode(); setAmp(0);
  }
  function applyMode() {
    el.querySelector("svg").setAttribute("viewBox", photo ? photoView(photo, mode) : VIEW[mode] || VIEW.card);
    el.dataset.mode = mode;
  }

  function setAmp(a, t = 0) {
    if (photo) {
      const mw = photo.mw, drop = a * mw * 0.2;
      r.jaw.setAttribute("transform", `translate(0 ${drop.toFixed(2)})`);
      r.mouth.setAttribute("ry", (a > 0.03 ? drop * 0.75 + mw * 0.02 : 0).toFixed(2));
      r.mouth.setAttribute("cy", (photo.my + drop * 0.45).toFixed(2));
      const th = a > 0.15 ? Math.min(mw * 0.045, drop * 0.16) : 0;
      r.teeth.setAttribute("ry", th.toFixed(2));
      r.teeth.setAttribute("cy", (photo.my + th * 0.4).toFixed(2));
      const k = 1 + (t ? Math.sin(t / 2600) * 0.006 : 0);
      r.all.setAttribute("transform", t ? `translate(${photo.mx} ${photo.my}) scale(${k.toFixed(4)}) translate(${-photo.mx} ${-photo.my})` : "");
      return;
    }
    r.jaw.setAttribute("transform", `translate(0 ${(a * 10).toFixed(2)})`);
    r.mouth.setAttribute("ry", (1.5 + a * 9).toFixed(2));
    r.mouth.setAttribute("cy", (284 + a * 4.5).toFixed(2));
    r.teeth.setAttribute("height", (a > 0.12 ? Math.min(4, a * 5) : 0).toFixed(2));
    r.brows.setAttribute("transform", `translate(0 ${(-a * 2.5).toFixed(2)})`);
    const nod = t ? Math.sin(t / 380) * 1.6 * (0.4 + a) : 0;
    const tilt = t ? Math.sin(t / 900) * 1.4 : 0;
    r.head.setAttribute("transform", `rotate(${tilt.toFixed(2)} 200 300) translate(0 ${nod.toFixed(2)})`);
  }

  function setMode(m) { mode = m; applyMode(); }
  // p = { url, W, H, mx, my, mw } in image pixels, or null for the drawn host
  function setPhoto(p) { stop(); photo = p; build(); }

  function stop() {
    cancelAnimationFrame(raf);
    if (audio) { audio.onended = null; audio.pause(); audio.removeAttribute("src"); audio = null; }
    el.classList.remove("talking");
    amp = 0; setAmp(0);
  }

  function speak(url, done) {
    stop();
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      ctx.resume();
    } catch (e) { ctx = null; }
    audio = new Audio();
    audio.src = url;
    audio.playsInline = true;
    let an = null, buf = null;
    if (ctx) {
      const src = ctx.createMediaElementSource(audio);
      an = ctx.createAnalyser(); an.fftSize = 1024;
      src.connect(an); an.connect(ctx.destination);
      buf = new Uint8Array(an.fftSize);
    }
    el.classList.add("talking");
    t0 = performance.now();
    const loop = (now) => {
      let target = 0;
      if (an) {
        an.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
        target = Math.min(1, Math.sqrt(sum / buf.length) * 5);
      } else target = Math.random() * 0.6;
      amp = target > amp ? amp * 0.4 + target * 0.6 : amp * 0.75 + target * 0.25;
      setAmp(amp, (now || performance.now()) - t0 + 1);
      raf = requestAnimationFrame(loop);
    };
    const a = audio;
    a.onended = () => { stop(); done && done(); };
    a.play().then(() => loop(performance.now())).catch((err) => { console.warn(err); stop(); done && done(); });
  }

  build();
  return { el, speak, stop, setMode, setPhoto, _setAmp: setAmp };
}
