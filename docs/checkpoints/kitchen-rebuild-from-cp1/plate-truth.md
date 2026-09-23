# Kitchen plate static truth checkpoint

Review route: `/?scene=kitchen-object-truth`, then choose **Hero plate + remaining stack**.

The approved 1000×600 Kitchen master and towel atlas were restored from the user-supplied repair package. The master now lives at `public/rooms/kitchen/rebuild/truth/approved-master.webp`; the truncated old reference file was removed. The older `object-extraction-v1.webp` was corrupt and unreferenced by the current source, so it was removed rather than replaced by an atlas from the rejected multi-object proof. The repair package's full-resolution PNG remains a local authoring input, not a runtime asset.

The plate truth atlas holds the exact approved reference crop, cabinet support, independent photographed rest bodies for the top hero plate and remaining upper stack, and separate translucent contact shadows. The lower bowl, lower plates, mugs, cabinet frame and shelf stay with the support. The asset is reproducible with `python scripts/build-plate-truth.py` using the repository-local approved master; `npm run verify-plate-truth` decodes the atlas, checks registration and shadows, and compares the combined rest crop with the approved master.

Review the four toggles separately: hide both plate bodies and shadows to inspect the cabinet backing; hide the hero to see one plate missing from the upper stack; view each body and shadow alone; then blink against the reference. The complete rest state is a static reconstruction only. No animation, impact fracture, ceramic debris, or fully exposed airborne plate face is approved here. The kettle also remains unresolved. Motion is blocked.

## Static visual review, 2026-09-23

The approved master and the six atlas compositions were inspected at native room scale and enlarged crop scale. The first extraction failed: its hero mask included multiple bright plate rims and its stack mask included left cabinet pixels. The masks were corrected against the photographic rim positions and inspected again on transparency, on the cabinet support, and in the full 1000×600 room. At this scope, the top hero plate, remaining stack, support, separate shadows, and combined intact rest state are visually accepted as **static assets**. The hero face exposed by rotation has not been authored or inspected. The interactive browser route could not be screenshot in this workspace because the local browser has no Chrome binary; the atlas compositions and HTTP route were checked separately. This is not motion acceptance or approval of the whole Kitchen.

The deployed route was subsequently reviewed in a browser at commit `5fb5f9d`: the four toggles, support-only state, isolated shadows, and intact reference switch passed the static gate. The earlier local-browser limitation no longer limits this scoped acceptance.

The thin bright rim at the very top of the upper pile is the **hero plate**. The **remaining stack** is the upper plates directly beneath it. The cabinet wood, lower bowl, lower plates, and mugs are part of the **support** and remain when both upper plate bodies are hidden. Each upper plate component has its own faint contact shadow. The visually small change when hiding only the hero is intentional: one thin plate leaves the top of a tall stack. No moving plate face is accepted yet.
