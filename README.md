# El Le3ba — LOGIC Events

**Language:** English by default. Every page has an **ع / EN** button; each device remembers its choice (teams who prefer Arabic switch once).

Team challenge web app. 100% free: Firebase Spark plan (logins + database) and GitHub Pages (hosting).

| Page | Who | What |
|---|---|---|
| `index.html` | Teams (one device each) | Login → lobby → avatar + voice note → 12-min timer → send evidence |
| `admin.html` | You (any number of devices) | Start/pause/end, approve/decline evidence, challenges + voice notes, teams, scoring |
| `board.html` | Big screen | Live leaderboard (hide/show from admin) |

---

## Setup (about 15 minutes, one time)

### 1. Firebase
1. Go to https://console.firebase.google.com → **Add project** → name it (e.g. `el-le3ba`) → turn Analytics off → Create.
2. **Build → Authentication → Get started → Email/Password → Enable → Save.**
3. Authentication → **Users → Add user** → your admin email + a strong password.
4. **Build → Firestore Database → Create database** → pick a location (e.g. `eur3` or `europe-west`) → **Production mode**.
5. Firestore → **Rules** tab → paste everything from `firestore.rules` → replace `admin@logic-events.com` with your admin email → **Publish**.
6. ⚙️ **Project settings → General → Your apps → Web (</>)** → register app (no hosting) → copy the `firebaseConfig` values.

### 2. Config
Open `js/firebase-config.js`:
- paste the `firebaseConfig` values
- set `ADMIN_EMAIL` to the same admin email

### 3. GitHub Pages
1. https://github.com/new → name `el-le3ba` → **Public** → Create.
2. **Add file → Upload files** → drag the whole folder content (`index.html`, `admin.html`, `board.html`, `css/`, `js/`, `assets/`) → Commit.
3. Repo **Settings → Pages** → Source: *Deploy from a branch* → `main` / `root` → Save. Wait ~1 minute.
4. Your links:
   - Teams: `https://<github-user>.github.io/el-le3ba/`
   - Admin: `https://<github-user>.github.io/el-le3ba/admin.html`
   - Screen: `https://<github-user>.github.io/el-le3ba/board.html`
5. Back in Firebase → **Authentication → Settings → Authorized domains → Add domain** → `<github-user>.github.io`.

> The Firebase config in the code is not a secret — security comes from the Firestore rules.

---

## Before the event
1. Open **admin.html** → log in (first login creates default settings + the 6 challenges).
2. **الإعدادات**: set the number of **Sets** (1 set = max 1 team per challenge at a time, 2 sets = max 2…), timers and points.
3. **Settings → Host character** (الإعدادات → شخصية المضيف): download the generated grandpa image from Canva (full size, 1680×944) and upload it here. The mouth position is pre-set for that image; just press **▶ Test with a voice note**. For any other image, tap the mouth once and save.
   Old note — : upload your licensed host image (e.g. the grandpa-by-the-fireplace from Freepik), tap his mouth once, adjust "عرض البق", press **حفظ مكان البق**, then **▶ جرّب مع VN**. His mouth and beard move with each voice note, full screen, with a flickering fire glow. No image = the drawn grandpa.
4. **التحديات**: rename challenges, add a short description, and record or upload the voice note for each one. Press "جرّب مع الأفاتار" to check the lip-sync.
   - Upload **MP3 / M4A** so it plays on both iPhone and Android.
   - Optional: upload a ready **talking-avatar video (MP4, max 15 MB)** made with HeyGen / D-ID. If a challenge has a video, it plays full screen instead of the host + voice note.
5. **الفرق**: type the number of teams (max 24) → **جهّز الفرق** → **🖨 اطبع كروت الدخول**.
6. Click 🔔 on every admin device so new evidence makes a sound + notification.

## On the day
1. Teams open the link and log in → they wait in the lobby.
2. Admin → **التحكم** shows `online / total`. When everyone is in → **▶ ابدأ**.
3. Each team is put into a free challenge it hasn't played (never more teams than Sets in the same challenge). If all are busy, the team waits and enters automatically when one frees up.
4. Team listens to the avatar → presses start → 12-minute timer → sends a photo or video (in-app video max 30 s).
5. The timer freezes while waiting for your decision. **الأدلة** tab: ✓ approve / ✗ decline.
   - Declined or timed out on attempt 1 → one last attempt of 2 minutes.
   - Failed again → 0 points, moved to the next challenge.
   - Evidence is deleted right after your decision. Nothing is stored.
6. **⏸ وقّف** freezes all timers; **▶** resumes. **🏁** ends the game. Toggle **إظهار الترتيب** any time.

## Scoring (editable)
| Finished within | Points |
|---|---|
| 4 min | 100 |
| 6 min | 85 |
| 8 min | 70 |
| 10 min | 55 |
| 12 min | 40 |
| Last attempt (2 min) | 20 |
| Failed | 0 |

Tie-break: less total time wins.

## Free-plan limits (Spark)
- 50,000 reads / 20,000 writes / 20,000 deletes per day, 1 GB stored. A 24-team, 3-hour event uses roughly 10–20% of the daily limits.
- Evidence and voice notes are split into small pieces inside Firestore (Spark has no file storage) and evidence is deleted after the decision.
- Avoid huge gallery videos; the in-app 🎥 button records small 30-second clips.

## Admin tools during the game
- **تخطي التحدي** on a team card: gives 0 for the current challenge and moves the team on.
- **ريست الفريق**: clears one team's progress.
- **↺ ريست كامل**: clears everything and returns to the lobby (teams and voice notes stay).
