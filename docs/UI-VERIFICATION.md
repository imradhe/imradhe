# Original UI comparison

The PHP baseline on `main` and the React version were run simultaneously against separate disposable databases. Browser comparisons used the same viewport and the original stylesheets, fonts and media. No production data was changed.

The following element bounds matched exactly between the rendered pages:

| Page | Compared elements |
| --- | --- |
| Homepage | Profile header, pill navigation, content panel |
| Education | Timeline position, width, height, border and padding |
| Projects | Filter area and project card position, width and height |
| Login | Form position, width, height and font |
| Share modal | Original content, position, width and height after its fade animation |
| Admin stories | Header height, main area and DataTables table bounds |
| New story | Form bounds, all seven field positions and widths |
| New scene | CKEditor bounds, toolbar and field layout |
| Scene reader | Author header, sticky title and article bounds |
| StreakTracker | Original card position, width and height |
| Dhwani | Container, transcript area and audio player bounds |
| Chess | Board position, width, height, 32 image pieces and initially empty notation |
| Mobile homepage (390 × 844) | Header, horizontally scrolling navigation and content panel bounds |

Functional checks included sign-in, original form validation and password visibility, automatic story slug generation, saving through the original editor, DataTables loading, legal chess dragging and reset, and the retained streak/reward flow. Automated checks cover the backend and original account/streak/subtitle behavior.

The animated profile name cycles through scripts independently on each page, so screenshots taken at different times can show different scripts. Physical AR/camera access and external Google Forms/ASR services were not submitted or granted permissions during verification.
