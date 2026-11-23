# MERN migration with the original UI

`main` preserves the PHP baseline. `mern-rewrite` uses MongoDB, Express, React, and Node while retaining the original pages’ HTML structure, copy, assets, styles, and controls.

## UI contract

The original UI is the reference. Do not add a shared navigation bar, footer, theme switcher, cards, explanatory copy, or new controls. Each page owns the same layout it had in PHP.

`app/client/src/original/` contains the baseline HTML fragments and page-specific inline styles. `OriginalMarkup` converts that markup into React elements. Data, form submissions, modals and interactive controls are connected through React without changing their visible structure. PHP is not used at runtime.

The original stylesheet and library versions are retained: Bootstrap 5.1.3 and Nunito on the portfolio/shared pages; the original admin stylesheet, icon font, DataTables and CKEditor; Bootstrap 4.5.2 for the form modal; Bootstrap 5.3.1 for Dhwani; the original chessboard images and widget; Materialize and model-viewer on individual AR pages; OwlCarousel on the AR index.

## Pages

| Routes | Preserved UI |
| --- | --- |
| `/`, `/education`, `/skills`, `/projects`, `/experience`, `/interests` | Original profile row, social icons, script-cycling name, pill navigation, content spacing, resume link, share modal, timeline and project cards/filters |
| `/blog`, `/blog/{slug}` | Original compact index/reader, metadata, tags, back link and Developed By footer |
| `/scene/{slug}` | Original author row, social/share icons, listen/pause/resume links, floating theme button, sticky title, chapter heading and article layout |
| `/login`, `/register` | Original logo, narrow form, placeholders, phone field, validation text, password visibility toggle and button labels |
| `/logout` | Original immediate return to the login page; the actual session mutation is POST with CSRF protection |
| `/admin` | Original Admin Panel header/sidebar and clock |
| `/admin/stories`, `/admin/scenes` | Original table columns, DataTables search/page-size/sorting/pagination, icon actions and delete modal |
| `/admin/{stories,scenes}/new`, `/edit/{slug}` | Original Bootstrap grid, fields, Back/Add/Update controls and scene rich-text editor |
| `/ar`, `/AR` | Original black carousel with Ironman, Tom & Jerry and Hulk, original carousel navigation/dots |
| `/ar/ironman`, `/ar/spiderman`, `/ar/chotabheem` | Original full-screen viewer, centered AR button, circular audio toggle and soundtrack |
| `/ar/test` | Original attendance form and modal, including the original field labels |
| `/test` | Original full-screen camera/marker video experiment |
| `/chess` | Original 80vh draggable chessboard, image pieces, status, Reset button and move notation |
| `/streak`, `/streak/new` | Original StreakTracker card, inputs, practice/reset controls, reward formula and completion view; daily mode keeps the original 24-hour interval |
| `/dhwani` | Original Transcribe/Sync tabs, transcript area, inline timing controls, audio player, audio URL input and Load Audio button; original small-screen notice |
| `/wav2vec` | Original plain speech-to-text form, language selector, upload control, audio player and transcript |
| `/deepseek-or-deepfake` | Original dark sidebar/chat layout, logo, message bubbles, reasoning disclosure and icon action row |
| `/balloon` | Original blank visible surface of the WebSocket scratchpad; no replacement tool UI |
| `/call?phone=...` | Original telephone handoff; without a number, the original message |
| Missing pages, including `/testmail` | Original 404 image, message and home button |

No new public story index, admin blog screen or flags dashboard is exposed in the UI. The original `/aibro` and `/adcast` external redirects remain.

## Runtime and content

| Before | After |
| --- | --- |
| PHP router and views | React Router and original-markup React components |
| PHP controllers / MySQL | Express / Mongoose / MongoDB |
| Apache `.htaccess` | Express routes, redirects and explicit public asset directories |
| File-based blog | MongoDB posts imported from `content/blog/*.md` |
| MD5 password/cookie | Salted scrypt, rotating server-side sessions and CSRF tokens |
| PHP Docker image | Node 22 multi-stage image, unprivileged runtime user |

The original three stories, three scenes, dates, identifiers, descriptions, tags, cover values, all 15 projects, three education entries, five experience entries, PDFs, photographs, audio, chat archive and 3D models are retained. `data/legacy-content.json` comes from `db/imradhe.sql`; the unrelated Kautilya database is not imported. Re-seeding preserves existing edits.

Browser tools use the original localStorage keys. No default account/password is included. The supplied export contains no users. Registration preserves the original fields and six-character minimum; the visible original password validation also requires a letter, number, special character and uppercase letter.

Private flags/logs remain authenticated in the rewritten API. Story/scene/post mutations remain available through protected API endpoints. HTML is sanitized; destructive database operations use DELETE and CSRF protection while keeping the original confirmation modal. These server details do not add UI controls.

ASR credentials are configured server-side with `ASR_URL`/`ASR_TOKEN`. The original upload form is retained. The old scratchpad’s embedded bearer credential is not shipped. External Google Forms, native AR, camera permissions and an ASR provider require validation with those services/devices.

## Verification

Compare the rendered React pages with the `main` PHP baseline at the same viewport, including fonts, element bounds, spacing, responsive behavior, modals and form controls. `npm run check` also builds the client, tests the Express API against disposable MongoDB, and verifies retained form/streak/subtitle behavior.

The historical PHP deployment notes are under `docs/legacy/`. Current run, seed and deployment instructions are in `app/README.md`.
