# Kitchen plate static truth checkpoint

Review route: `/?scene=kitchen-object-truth`, then choose **Hero plate + remaining stack**.

The approved 1000×600 Kitchen master and towel atlas were restored from the user-supplied repair package. The master now lives at `public/rooms/kitchen/rebuild/truth/approved-master.webp`; the truncated old reference file was removed. The older `object-extraction-v1.webp` was corrupt and unreferenced by the current source, so it was removed rather than replaced by an atlas from the rejected multi-object proof. The repair package's full-resolution PNG remains a local authoring input, not a runtime asset.

The plate truth atlas holds the exact approved reference crop, cabinet support, independent photographed rest bodies for the top hero plate and remaining upper stack, and separate translucent contact shadows. The lower bowl, lower plates, mugs, cabinet frame and shelf stay with the support. The asset is reproducible with `python scripts/build-plate-truth.py` using the repository-local approved master; `npm run verify-plate-truth` decodes the atlas, checks registration and shadows, and compares the combined rest crop with the approved master.

Review the four toggles separately: hide both plate bodies and shadows to inspect the cabinet backing; hide the hero to see one plate missing from the upper stack; view each body and shadow alone; then blink against the reference. The complete rest state is a static reconstruction only. No animation, impact fracture, ceramic debris, or fully exposed airborne plate face is approved here. The kettle also remains unresolved. Motion is blocked.
