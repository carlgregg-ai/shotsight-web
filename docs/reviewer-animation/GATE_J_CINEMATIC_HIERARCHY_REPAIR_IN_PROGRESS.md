# Gate J — cinematic hierarchy repair in progress

Date: 2026-09-05

Status: **IN PROGRESS — CI / RENDER QA REQUIRED**.

Previous cinematic head `2da6d28fa8347a2f5949d92ade75c3f4895e31f8` passed GitHub Actions run `33936143973` and produced artifact `9960246350`. Direct inspection of the rendered frames showed that the engineering-dashboard problem was reduced, but the principal coach view still under-used the governing Bible's shooter/mount hierarchy: the mannequin remained too small relative to the scene, and the decisive shot point was only represented by a corner event cue rather than a model-derived spatial marker.

The governing Bible was re-read in full. Relevant locked requirements include target -> movement relationship -> decisive point -> explanation; strong rounded shooter silhouette; hands/shoulders/mount legible; clay visually dominant; warm quiet range; synchronized external/first-person/other views; technical accuracy over charm; and no unsupported future/lead fabrication.

Repair commit: `bb27a480a523f58fcd75d10099c75eb5470492ff`.

Presentation-only changes in that commit:
- closer external/coach camera and narrower coach FOV to make the mounted shooter materially more legible while retaining the target flight in frame;
- model-derived amber `SHOT` spatial ring at the canonical target position at `scenario.shotTime_s`, identical across all three method renders;
- no target trajectory, method timing, bore direction, ballistic state, event ordering, or method parameters changed;
- no BREAK event was added; the new marker is explicitly the canonical shot-event location, not a claim of clay break.

GitHub Actions run `33938799882` is currently in progress. Do not accept Gate J until the run is green, a fresh artifact is downloaded, representative frames/video are inspected against the Bible, and numerical method-comparison tests remain green.

CPSA Episode 3 reconstruction remains `VIDEO_FRAME_ACCESS_REQUIRED`; no disputed direction or image-space measurements are inferred from metadata.
