// Original host: grandpa sitting in his armchair inside a room. Lip-sync driven live by the voice note's volume.
// setMode("card") = head & shoulders crop, setMode("full") = whole scene (full-screen theater).
const VIEW = { card: "80 120 240 240", full: "0 0 400 700" };

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
  <filter id="fSoft2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
  <linearGradient id="gLeather" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9a5530"/><stop offset=".5" stop-color="#6b3418"/><stop offset="1" stop-color="#3a1a0b"/></linearGradient>
  <linearGradient id="gLeatherSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a2210"/><stop offset=".55" stop-color="#8a4a28"/><stop offset="1" stop-color="#55280f"/></linearGradient>
  <radialGradient id="gRoll" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="#b36a3e"/><stop offset="1" stop-color="#6b3418"/></radialGradient>
  <linearGradient id="gSweater" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a57250"/><stop offset=".55" stop-color="#7a4c30"/><stop offset="1" stop-color="#4f2f1c"/></linearGradient>
  <linearGradient id="gSleeve" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6e4329"/><stop offset=".5" stop-color="#9a6844"/><stop offset="1" stop-color="#5e381f"/></linearGradient>
  <linearGradient id="gTrousers" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8d8a74"/><stop offset="1" stop-color="#4c4a3c"/></linearGradient>
  <radialGradient id="gFace" cx="45%" cy="38%" r="68%"><stop offset="0" stop-color="#ffe3cf"/><stop offset=".65" stop-color="#f7c3a2"/><stop offset="1" stop-color="#e09a78"/></radialGradient>
  <radialGradient id="gIris" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#b07a48"/><stop offset=".6" stop-color="#6a3f1e"/><stop offset="1" stop-color="#2e1a0b"/></radialGradient>
  <radialGradient id="gNose" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ffbfa0"/><stop offset="1" stop-color="#dc8a68"/></radialGradient>
  <linearGradient id="gBeard" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c9cad3"/></linearGradient>
  <radialGradient id="gShoe2" cx="40%" cy="30%" r="70%"><stop offset="0" stop-color="#8a5a36"/><stop offset="1" stop-color="#2a160a"/></radialGradient>
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

<!-- ===== CHAIR (leather wingback) ===== -->
<ellipse cx="200" cy="640" rx="160" ry="20" fill="#000" opacity=".45" filter="url(#fSoft)"/>
<rect x="94" y="540" width="16" height="92" rx="5" fill="url(#gWood)"/><rect x="290" y="540" width="16" height="92" rx="5" fill="url(#gWood)"/>
<path d="M98 505 L98 250 C98 176 140 146 200 146 C260 146 302 176 302 250 L302 505 Z" fill="url(#gLeather)"/>
<path d="M118 190 C150 168 250 168 282 190" stroke="#c07a4a" stroke-width="3" fill="none" opacity=".45"/>
<g fill="#2e1408" opacity=".7"><circle cx="150" cy="205" r="3"/><circle cx="200" cy="195" r="3"/><circle cx="250" cy="205" r="3"/><circle cx="125" cy="250" r="3"/><circle cx="175" cy="240" r="3"/><circle cx="225" cy="240" r="3"/><circle cx="275" cy="250" r="3"/><circle cx="150" cy="290" r="3"/><circle cx="250" cy="290" r="3"/></g>
<g stroke="#2e1408" stroke-width="1.5" opacity=".35" fill="none"><path d="M150 205 L175 240 L200 195 L225 240 L250 205 M125 250 L150 290 L175 240 M225 240 L250 290 L275 250"/></g>
<path d="M80 505 L80 286 C74 244 102 226 128 236 L138 505 Z" fill="url(#gLeatherSide)"/>
<path d="M320 505 L320 286 C326 244 298 226 272 236 L262 505 Z" fill="url(#gLeatherSide)"/>
<rect x="104" y="500" width="192" height="44" rx="12" fill="#3a1a0b"/>
<rect x="110" y="452" width="180" height="62" rx="24" fill="url(#gRoll)"/>

<!-- ===== GRANDPA ===== -->
<!-- legs -->
<path d="M138 470 C130 500 136 524 148 536 L198 536 C202 512 202 488 200 470 Z" fill="url(#gTrousers)"/>
<path d="M262 470 C270 500 264 524 252 536 L202 536 C198 512 198 488 200 470 Z" fill="url(#gTrousers)"/>
<ellipse cx="172" cy="532" rx="29" ry="17" fill="#8d8a74"/><ellipse cx="228" cy="532" rx="29" ry="17" fill="#8d8a74"/>
<path d="M146 532 L198 532 L190 606 L156 606 Z" fill="url(#gTrousers)"/>
<path d="M254 532 L202 532 L210 606 L244 606 Z" fill="url(#gTrousers)"/>
<path d="M174 540 L172 604 M226 540 L228 604" stroke="#3c3a2e" stroke-width="2" opacity=".5"/>
<rect x="156" y="602" width="34" height="10" rx="3" fill="#3a3a40"/><rect x="210" y="602" width="34" height="10" rx="3" fill="#3a3a40"/>
<ellipse cx="170" cy="620" rx="31" ry="14" fill="url(#gShoe2)"/><ellipse cx="230" cy="620" rx="31" ry="14" fill="url(#gShoe2)"/>
<path d="M152 614 Q170 608 188 614 M212 614 Q230 608 248 614" stroke="#c08a5a" stroke-width="2.5" fill="none" opacity=".8"/>
<path d="M142 626 Q170 636 200 626 M200 626 Q230 636 258 626" stroke="#1a0c04" stroke-width="3" fill="none"/>

<!-- torso (cable-knit sweater) -->
<path d="M130 478 C118 420 126 360 162 336 C180 324 220 324 238 336 C274 360 282 420 270 478 Z" fill="url(#gSweater)"/>
<g stroke="#4a2c18" stroke-width="2.2" fill="none" opacity=".55">
  <path d="M160 360 C154 380 166 392 160 412 C154 432 166 444 160 466"/>
  <path d="M240 360 C246 380 234 392 240 412 C246 432 234 444 240 466"/>
  <path d="M148 372 L146 470 M252 372 L254 470"/>
</g>
<g stroke="#c39672" stroke-width="1.6" fill="none" opacity=".35">
  <path d="M164 360 C158 380 170 392 164 412 C158 432 170 444 164 466"/>
  <path d="M236 360 C242 380 230 392 236 412 C242 432 230 444 236 466"/>
</g>
<path d="M200 340 L200 476" stroke="#4a2c18" stroke-width="3"/>
<g fill="#3a2010"><circle cx="200" cy="372" r="4"/><circle cx="200" cy="402" r="4"/><circle cx="200" cy="432" r="4"/></g>
<ellipse cx="200" cy="478" rx="72" ry="10" fill="#000" opacity=".18" filter="url(#fSoft2)"/>

<!-- arms + chubby hands on knees -->
<g class="av-armL">
  <path d="M152 340 C124 348 106 382 106 420 C106 448 126 480 154 500 L172 484 C150 462 134 442 134 420 C136 392 146 370 162 356 Z" fill="url(#gSleeve)"/>
  <path d="M150 492 C156 484 166 480 174 486" stroke="#4a2c18" stroke-width="7" fill="none" stroke-linecap="round"/>
  <g class="av-handL">
    <ellipse cx="166" cy="500" rx="19" ry="15" fill="url(#gFace)"/>
    <g fill="#f2b896" stroke="#d58e6c" stroke-width="1"><rect x="158" y="505" width="8" height="15" rx="4"/><rect x="167" y="507" width="8" height="15" rx="4"/><rect x="176" y="505" width="8" height="14" rx="4"/></g>
  </g>
</g>
<g class="av-armR">
  <path d="M248 340 C276 348 294 382 294 420 C294 448 274 480 246 500 L228 484 C250 462 266 442 266 420 C264 392 254 370 238 356 Z" fill="url(#gSleeve)"/>
  <path d="M250 492 C244 484 234 480 226 486" stroke="#4a2c18" stroke-width="7" fill="none" stroke-linecap="round"/>
  <g class="av-handR">
    <ellipse cx="234" cy="500" rx="19" ry="15" fill="url(#gFace)"/>
    <g fill="#f2b896" stroke="#d58e6c" stroke-width="1"><rect x="216" y="505" width="8" height="14" rx="4"/><rect x="225" y="507" width="8" height="15" rx="4"/><rect x="234" y="505" width="8" height="15" rx="4"/></g>
    <path class="av-fingers" d="M222 490 L220 470 M230 488 L230 466 M238 490 L240 470" stroke="#f2b896" stroke-width="7" stroke-linecap="round" opacity="0"/>
    <path d="M246 486 L258 480 L262 490 L250 495 Z" fill="#d4a24a"/>
  </g>
</g>

<!-- collar -->
<path d="M168 330 L200 352 L232 330 L224 322 L200 336 L176 322 Z" fill="#e8e2cf"/>

<!-- ===== BIG PIXAR-STYLE HEAD ===== -->
<g class="av-head">
  <ellipse cx="200" cy="330" rx="48" ry="9" fill="#000" opacity=".2" filter="url(#fSoft2)"/>
  <ellipse cx="130" cy="250" rx="14" ry="21" fill="#f2b38f"/><ellipse cx="270" cy="250" rx="14" ry="21" fill="#f2b38f"/>
  <path d="M133 252 Q127 244 134 236 M267 252 Q273 244 266 236" stroke="#d08a68" stroke-width="2.5" fill="none"/>
  <path d="M200 160 C248 160 274 196 274 242 C274 292 246 326 200 328 C154 326 126 292 126 242 C126 196 152 160 200 160 Z" fill="url(#gFace)"/>
  <ellipse cx="186" cy="190" rx="36" ry="16" fill="#fff" opacity=".22"/>
  <ellipse cx="200" cy="312" rx="60" ry="20" fill="#c97a5a" opacity=".22" filter="url(#fSoft2)"/>

  <!-- fluffy silver hair -->
  <path d="M132 226 C116 168 158 134 204 138 C252 140 286 176 270 228 C264 204 254 190 242 184 C238 168 222 160 206 162 C186 158 168 168 160 184 C148 190 140 206 132 226 Z" fill="url(#gBeard)"/>
  <path d="M164 152 C176 120 230 116 250 140 C236 132 216 132 206 142 C196 134 180 136 164 152 Z" fill="#fff"/>
  <path d="M176 160 C190 146 214 144 232 152" stroke="#a9aab5" stroke-width="2.5" fill="none"/>
  <g fill="url(#gBeard)"><circle cx="134" cy="214" r="15"/><circle cx="126" cy="232" r="12"/><circle cx="266" cy="214" r="15"/><circle cx="274" cy="232" r="12"/></g>
  <path d="M176 176 Q200 170 224 176 M182 184 Q200 179 218 184" stroke="#d99a7a" stroke-width="1.6" fill="none" opacity=".6"/>

  <!-- bushy brows -->
  <g class="av-brows">
    <path d="M148 206 C156 188 186 184 198 198 C186 196 166 198 150 212 Z" fill="#f4f4f8" stroke="#b9bac4" stroke-width="1.3"/>
    <path d="M252 206 C244 188 214 184 202 198 C214 196 234 198 250 212 Z" fill="#f4f4f8" stroke="#b9bac4" stroke-width="1.3"/>
  </g>

  <!-- big expressive eyes -->
  <g class="av-eyes">
    <ellipse cx="174" cy="232" rx="17" ry="19" fill="#fff"/><ellipse cx="226" cy="232" rx="17" ry="19" fill="#fff"/>
    <g class="av-pupils">
      <circle cx="176" cy="235" r="10.5" fill="url(#gIris)"/><circle cx="224" cy="235" r="10.5" fill="url(#gIris)"/>
      <circle cx="176" cy="235" r="5.4" fill="#120806"/><circle cx="224" cy="235" r="5.4" fill="#120806"/>
      <circle cx="180" cy="230" r="3.2" fill="#fff"/><circle cx="228" cy="230" r="3.2" fill="#fff"/>
      <circle cx="172" cy="240" r="1.4" fill="#fff" opacity=".8"/><circle cx="220" cy="240" r="1.4" fill="#fff" opacity=".8"/>
    </g>
    <path d="M156 228 C160 210 188 210 192 228 C186 220 162 220 156 228 Z" fill="#f2b896"/>
    <path d="M208 228 C212 210 240 210 244 228 C238 220 214 220 208 228 Z" fill="#f2b896"/>
    <path d="M157 227 C164 219 184 219 191 227 M209 227 C216 219 236 219 243 227" stroke="#8a4a32" stroke-width="2" fill="none"/>
  </g>

  <!-- round glasses -->
  <g fill="rgba(255,255,255,.07)" stroke="#3b2416" stroke-width="5"><circle cx="174" cy="232" r="26"/><circle cx="226" cy="232" r="26"/></g>
  <path d="M199 230 Q200 223 201 230" stroke="#3b2416" stroke-width="4" fill="none"/>
  <path d="M148 228 L132 236 M252 228 L268 236" stroke="#3b2416" stroke-width="4"/>
  <path d="M158 218 Q166 211 176 211 M210 218 Q218 211 228 211" stroke="#fff" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>

  <!-- nose & cheeks -->
  <ellipse cx="158" cy="274" rx="16" ry="10" fill="#ff8f80" opacity=".35"/><ellipse cx="242" cy="274" rx="16" ry="10" fill="#ff8f80" opacity=".35"/>
  <ellipse cx="200" cy="266" rx="17" ry="15" fill="url(#gNose)"/>
  <ellipse cx="194" cy="259" rx="5.5" ry="3.8" fill="#fff" opacity=".55"/>
  <path d="M191 276 Q194 279 196 276 M204 276 Q206 279 209 276" stroke="#b0634a" stroke-width="1.6" fill="none"/>

  <!-- beard (sides, static) -->
  <path d="M134 258 C134 300 160 330 200 336 C240 330 266 300 266 258 C260 284 246 296 232 300 C220 296 180 296 168 300 C154 296 140 284 134 258 Z" fill="url(#gBeard)"/>
  <!-- mouth -->
  <ellipse class="av-mouth" cx="200" cy="298" rx="16" ry="2" fill="#5a1414"/>
  <rect class="av-teeth" x="189" y="295" width="22" height="0" rx="2" fill="#fffaf0"/>
  <!-- chin + lower beard (moves) -->
  <g class="av-jaw">
    <path d="M162 300 C168 294 232 294 238 300 C242 326 228 352 200 356 C172 352 158 326 162 300 Z" fill="url(#gBeard)"/>
    <path d="M186 301 Q200 309 214 301" stroke="#d27a72" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g stroke="#b9bac4" stroke-width="1.4" fill="none" opacity=".7"><path d="M180 318 Q182 332 186 342 M200 318 L200 350 M220 318 Q218 332 214 342"/></g>
  </g>
  <!-- mustache -->
  <path d="M166 290 C174 274 194 276 200 285 C206 276 226 274 234 290 C226 302 210 298 200 293 C190 298 174 302 166 290 Z" fill="#fbfbfd" stroke="#c4c5ce" stroke-width="1.2"/>
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
  let mode = "card", photo = null, loops = null, r = {};
  let ctx = null, audio = null, raf = 0, amp = 0, t0 = 0;

  function build() {
    el.classList.toggle("is-loops", !!loops);
    if (loops) {
      // Real motion: two looping clips (listening / talking) cross-faded by the voice volume.
      el.innerHTML = `<div class="vloop">
        <video class="v-idle" src="${loops.idle}" muted loop playsinline autoplay preload="auto"></video>
        <video class="v-talk" src="${loops.talk}" muted loop playsinline autoplay preload="auto"></video>
      </div>`;
      r = { idle: el.querySelector(".v-idle"), talk: el.querySelector(".v-talk"), wrap: el.querySelector(".vloop") };
      [r.idle, r.talk].forEach((v) => { v.muted = true; v.play().catch(() => {}); });
      applyMode(); setAmp(0);
      return;
    }
    el.innerHTML = photo ? photoSvg(photo) : SVG;
    el.classList.toggle("is-photo", !!photo);
    r = photo
      ? { jaw: el.querySelector(".ph-jaw"), mouth: el.querySelector(".ph-mouth"), teeth: el.querySelector(".ph-teeth"), all: el.querySelector(".ph-all") }
      : {
        jaw: el.querySelector(".av-jaw"), mouth: el.querySelector(".av-mouth"), teeth: el.querySelector(".av-teeth"),
        brows: el.querySelector(".av-brows"), head: el.querySelector(".av-head"),
        pupils: el.querySelector(".av-pupils"), armL: el.querySelector(".av-armL"), armR: el.querySelector(".av-armR"),
        handR: el.querySelector(".av-handR"), fingers: el.querySelector(".av-fingers"),
      };
    applyMode(); setAmp(0);
  }
  function applyMode() {
    el.dataset.mode = mode;
    if (loops) {
      const z = mode === "full" ? 1 : (loops.zoom || 2.2);
      r.wrap.style.transformOrigin = `${(loops.fx ?? 0.5) * 100}% ${(loops.fy ?? 0.22) * 100}%`;
      r.wrap.style.transform = `scale(${z})`;
      return;
    }
    el.querySelector("svg").setAttribute("viewBox", photo ? photoView(photo, mode) : VIEW[mode] || VIEW.card);
  }

  let talkOn = false, quietSince = 0;
  function setAmp(a, t = 0) {
    if (loops) {
      const now = performance.now();
      if (a > 0.12) {
        quietSince = 0;
        if (!talkOn) { talkOn = true; r.talk.style.opacity = "1"; r.talk.play().catch(() => {}); }
      } else if (talkOn && a < 0.06) {
        if (!quietSince) quietSince = now;
        else if (now - quietSince > 380) { talkOn = false; r.talk.style.opacity = "0"; }
      }
      if (!t) { talkOn = false; quietSince = 0; r.talk.style.opacity = "0"; }
      return;
    }
    if (photo) {
      const mw = photo.mw, drop = a * mw * 0.2;
      r.jaw.setAttribute("transform", `translate(0 ${drop.toFixed(2)})`);
      r.mouth.setAttribute("ry", (a > 0.03 ? drop * 0.75 + mw * 0.02 : 0).toFixed(2));
      r.mouth.setAttribute("cy", (photo.my + drop * 0.45).toFixed(2));
      const th = a > 0.15 ? Math.min(mw * 0.045, drop * 0.16) : 0;
      r.teeth.setAttribute("ry", th.toFixed(2));
      r.teeth.setAttribute("cy", (photo.my + th * 0.4).toFixed(2));
      return;
    }
    r.jaw.setAttribute("transform", `translate(0 ${(a * 13).toFixed(2)})`);
    r.mouth.setAttribute("ry", (2 + a * 11).toFixed(2));
    r.mouth.setAttribute("cy", (298 + a * 6).toFixed(2));
    r.teeth.setAttribute("height", (a > 0.12 ? Math.min(5, a * 6) : 0).toFixed(2));
    r.brows.setAttribute("transform", `translate(0 ${(-a * 2.5).toFixed(2)})`);
    const nod = t ? Math.sin(t / 380) * 1.6 * (0.4 + a) : 0;
    const tilt = t ? Math.sin(t / 900) * 1.4 : 0;
    r.head.setAttribute("transform", `rotate(${tilt.toFixed(2)} 200 336) translate(0 ${nod.toFixed(2)})`);
  }

  /* ---- life: eyes look around, hands gesture on strong moments ---- */
  const life = { eye: { x: 0, y: 0, tx: 0, ty: 0, next: 0 }, gesture: null, lastGesture: 0, punch: 0 };
  function lifeStep(now, a) {
    const e = life.eye;
    if (now > e.next) {           // new look target (saccade)
      const talking = a > 0.05;
      const centre = talking && Math.random() < 0.6;
      e.tx = centre ? 0 : (Math.random() * 2 - 1) * 3.6;
      e.ty = centre ? 0 : (Math.random() * 2 - 1) * 2.2;
      e.next = now + (talking ? 700 : 1200) + Math.random() * 2200;
    }
    e.x += (e.tx - e.x) * 0.35; e.y += (e.ty - e.y) * 0.35;
    // gesture on a strong moment
    if (a > 0.62 && now - life.lastGesture > 2200 && !life.gesture) {
      const kinds = ["present", "point", "both", "wave"];
      life.gesture = { kind: kinds[(Math.random() * kinds.length) | 0], t0: now, dur: 1300 + Math.random() * 600 };
      life.lastGesture = now; life.punch = 1;
    }
    let gR = 0, gL = 0, wave = 0, fing = 0;
    if (life.gesture) {
      const g = life.gesture, p = (now - g.t0) / g.dur;
      if (p >= 1) life.gesture = null;
      else {
        const k = Math.max(0, Math.min(1, p < 0.25 ? p / 0.25 : p > 0.7 ? (1 - p) / 0.3 : 1));   // ease in, hold, ease out
        const ease = k * k * (3 - 2 * k);
        if (g.kind === "present") { gR = -9 * ease; wave = -18 * ease; fing = ease; }
        else if (g.kind === "point") { gR = 6 * ease; wave = 22 * ease; fing = ease; }
        else if (g.kind === "both") { gR = -7 * ease; gL = 7 * ease; wave = -12 * ease; fing = ease; }
        else { gR = -11 * ease; wave = Math.sin((now - g.t0) / 90) * 18 * ease - 10 * ease; fing = ease; }
      }
    }
    const idle = Math.sin(now / 1400) * 1.2;
    life.punch *= 0.9;
    return { gR: gR + idle, gL: gL - idle * 0.6, wave, fing };
  }
  function applyLife(now, a) {
    if (loops) return;                 // real video already moves
    const L = lifeStep(now, a);
    if (photo) {                   // still picture: camera push-in + lean on strong moments
      const k = 1 + (now ? Math.sin(now / 2600) * 0.006 : 0) + life.punch * 0.035;
      const lean = life.punch * 0.8 + Math.sin(now / 3100) * 0.25;
      r.all.setAttribute("transform", `translate(${photo.mx} ${photo.my}) rotate(${lean.toFixed(2)}) scale(${k.toFixed(4)}) translate(${-photo.mx} ${-photo.my})`);
      return;
    }
    r.pupils.setAttribute("transform", `translate(${life.eye.x.toFixed(2)} ${life.eye.y.toFixed(2)})`);
    r.armR.setAttribute("transform", `rotate(${L.gR.toFixed(2)} 262 346)`);
    r.armL.setAttribute("transform", `rotate(${L.gL.toFixed(2)} 138 346)`);
    r.handR.setAttribute("transform", `rotate(${L.wave.toFixed(2)} 234 500)`);
    r.fingers.setAttribute("opacity", L.fing.toFixed(2));
  }
  // keep eyes alive even when silent
  let idleRaf = 0;
  const idleLoop = (now) => { if (!audio) applyLife(now, 0); idleRaf = requestAnimationFrame(idleLoop); };
  idleRaf = requestAnimationFrame(idleLoop);

  function setMode(m) { mode = m; applyMode(); }
  // p = { url, W, H, mx, my, mw } in image pixels, or null for the drawn host
  function setPhoto(p) { stop(); photo = p; build(); }
  // l = { idle: url, talk: url, fx, fy, zoom } or null
  function setLoops(l) { stop(); loops = l && l.idle && l.talk ? l : null; build(); }

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
      applyLife(now || performance.now(), amp);
      raf = requestAnimationFrame(loop);
    };
    const a = audio;
    a.onended = () => { stop(); done && done(); };
    a.play().then(() => loop(performance.now())).catch((err) => { console.warn(err); stop(); done && done(); });
  }

  build();
  return { el, speak, stop, setMode, setPhoto, setLoops, _setAmp: setAmp, _test: { life, applyLife } };
}
