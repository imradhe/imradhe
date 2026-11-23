# PHP → MERN migration

The baseline commit on `main` preserves the complete pre-migration `app/` and documentation. The workspace did not contain an existing Git repository or remote; a new local repository was initialized before implementation. Work is on `mern-rewrite`. No deployment or remote push has been performed.

## Runtime and data

| Previously | Now |
| --- | --- |
| PHP views and GraphenePHP router | React components and React Router |
| PHP controllers / MySQL | Express API / Mongoose / MongoDB |
| Apache `.htaccess` | Express routes, redirects and static serving |
| File-based blog | MongoDB posts with a Markdown import command and admin editor |
| MD5 password + legacy cookie | scrypt + opaque, rotating server-side session + CSRF protection |
| PHP Docker image | Multi-stage Node 22 image running as `node` |
| MariaDB service | Private MongoDB Compose service with persistent volume |

`app/data/legacy-content.json` contains the original three stories and three scenes with their IDs, dates, descriptions, tags and content. The source SQL is retained in `app/db/` for provenance and is never copied into the runtime image. Literal `null`/placeholder covers are treated as absent. Escaped quotation marks are decoded and unsafe scene HTML is removed on import and output. Re-seeding is additive and preserves edited records.

All 15 portfolio projects, three education entries, five experience entries, resume PDFs, public media, archived conversations, and five 3D models are retained. Browser-local tools use namespaced storage. Chess imports the original `chessPosition` FEN when present, StreakTracker reads the original reward keys, and Dhwani reads original transcript/timing keys. Browser file selections must be selected again after reloading; browser security does not permit restoring local files from their paths.

The excluded hosting backup’s `aibro`/`adcast` applications were already served on separate subdomains and were not part of the runnable PHP app. Their existing redirects remain. The `_imradhe.com/` backup, zip archive and root SQL files were not modified.

## Public routes

| Original route(s) | MERN behavior |
| --- | --- |
| `/`, `/education`, `/skills`, `/projects`, `/experience`, `/interests` | React portfolio with original data, project tag filters, resume download, share and theme controls |
| `/blog`, `/blog/{slug}` | Published MongoDB posts; drafts and underscore templates hidden; Markdown reader with metadata and read aloud |
| `/scene/{slug}` | Original scene HTML, parent story, date, reading time, read aloud, share and theme support |
| `/stories`, `/stories/{slug}` | Added working story index/chapter list for links that were broken in the original scene view |
| `/login`, `/register`, `/logout` | React authentication; logout requires button confirmation and POST |
| `/admin` | Protected dashboard with login history |
| `/admin/stories`, `/admin/scenes` | Protected lists with explicit Delete actions |
| `/admin/{stories,scenes}/new`, `/edit/{slug}` | React forms and validated API CRUD |
| `/admin/{stories,scenes}/delete/{slug}` | Confirmation page; GET never deletes a record |
| `/admin/{stories,scenes}/view` | Redirect to list; original view files did not exist |
| `/admin/posts`, `/admin/posts/new`, `/admin/posts/edit/{slug}` | Added Markdown blog administration |
| `/ar`, `/AR` | React AR carousel with all five available models |
| `/ar/{model}`, including `/ar/ironman`, `/ar/spiderman`, `/ar/chotabheem` | Model viewer with optional music; static model routes now resolve correctly instead of being shadowed by the old wildcard |
| `/ar/test` | Form demo dialog links to the original Google Form; no simulated success or blind cross-origin submission |
| `/test` | Isolated marker-video camera experiment, launched only after pressing Start |
| `/ar/video` | Added direct alias for the old unregistered video demo |
| `/chess` | Legal chess moves, local persistence, undo, board flip and reset |
| `/streak` | Session-based practice and reward tracker |
| `/streak/new` | Daily tracker with one check-in per local calendar day; missed days reset the consecutive count |
| `/dhwani` | React audio/text alignment, per-line timing, ±0.1s adjustments, playback, reset, JSON and SRT export |
| `/wav2vec` | Server-proxied, configurable ASR with upload playback and useful error handling |
| `/balloon` | Browser speech-synthesis demo replaces the nonfunctional WebSocket scratchpad and its embedded expired credential |
| `/call?phone=...` | Validated telephone link requiring a user click |
| `/deepseek-or-deepfake` | Original archived chat content, Markdown, conversation selection, reasoning disclosure and copy |
| `/health` | `ok`, independent of database availability |
| `/testmail` | 410 Gone; its original configured view did not exist |
| `/aibro`, `/adcast` | Original external subdomain redirects |

Unknown pages, missing posts/scenes and hidden drafts return 404 from production Express. Trailing slashes redirect while preserving query strings. Database-backed content URLs return 503 during a database outage. Public images and resume links retain their paths. Source, configuration, SQL, content import files and environment variables are outside static directories. The sitemap is generated from published database content. Canonical/title/description metadata is injected into production HTML; interactive page content is rendered by React.

## API compatibility

The existing flag endpoints and `{ data, message, status }` response envelope are retained:

- `POST /api/flag`
- `GET /api/flags`
- `GET /api/flags/{annotators,reviewers,supercheckers}`
- `GET /api/flags/{annotator,reviewer,superchecker}/{email}`
- `GET /api/logs`, `/api/routes`, `/api/example`, `/api/test`
- `POST /api/login`, `/api/logout` aliases

Unlike the original API, private flags/logs are no longer public. List/aggregate/log endpoints require an admin. A member can create a flag attributed to their own email in the selected role and read their own role-specific flags. Login takes JSON `{ email, password }`, returns `{ user, csrf }`, and sets a session cookie. Mutations take JSON and `X-CSRF-Token`. `/api/auth/me` refreshes user/session information. Logout is POST and requires CSRF. Legacy arbitrary cross-origin clients must adopt these authenticated, same-origin requests.

New endpoints expose portfolio, genres, archived chats, stories, scenes, posts, ASR, database readiness, and `/api/admin/{stories,scenes,posts}` CRUD. Input is allowlisted, object/operator injection is rejected, and client-supplied roles cannot grant administration.

## Intended changes to broken or unsafe behavior

- No MD5 credential migration, default passwords, hardcoded bearer tokens, GET deletions, or unauthenticated private flag/log data.
- No fake Google Form success state when a cross-origin request fails.
- Streak reward math uses a reward for each practice and keeps completed targets visible. Daily mode uses local calendar dates and preserves earned reward when a consecutive streak breaks.
- Chess uses the maintained chess rules engine; illegal moves are rejected and the entire move history survives reloads.
- Subtitle export uses each line’s own text, correct millisecond rounding and a valid final end time.
- External speech recognition is an explicit deployment setting. The supplied old public demo endpoint was not assumed to remain available.

## Verification

`npm run check` builds the production application, exercises a real temporary MongoDB database through HTTP integration tests, and runs React interaction tests. Physical-device AR, camera access, external Google Forms and a configured ASR provider require service/device validation. Historical PHP deployment instructions live under `docs/legacy/` and are superseded by `app/README.md`.
