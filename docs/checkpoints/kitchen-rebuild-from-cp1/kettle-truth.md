# Kitchen kettle static truth checkpoint

Review route: `/?scene=kitchen-object-truth`, then choose **Counter kettle**.

The approved repository-local `approved-master.webp` is the only source for the 120×120 reference crop and the photographed kettle body. The hidden wall tile and counter beneath the kettle are restored deterministically from neighboring tile and stone in that same master. The contact shadow is a separate translucent color layer. The conspicuous silver reflection on the counter belongs to a separate, softly masked photographed layer; hiding it with the body and shadow reveals clean stone. No older Kitchen image or remote atlas is read by this truth gate.

Use the three independent toggles to inspect support alone, kettle alone, contact shadow alone, reflected counter highlight alone, and the intact rest state against **Show reference**. The body is a stationary photographed extraction. Its far side and tipped state have not been authored, and this checkpoint does not approve motion or the Tier 1 terminal frame, which still depends on older remote atlas URLs.

The atlas is reproducible with `python scripts/build-kettle-truth.py`; `npm run verify-kettle-truth` decodes it, checks its exact reference against the approved master, confirms independent layers and clean support samples, and compares the rest composite with the approved crop. Native-size and enlarged crops were visually inspected locally.

## Deployed browser review, 2026-09-23

The production proof at `/?scene=kitchen-object-truth` served the kettle atlas from commit `4bc384c`. The intact reconstruction matched the approved reference at the displayed scale. Kettle-only, shadow-only, reflection-only, and support-only states were toggled separately. With all three effects hidden, no kettle or silver reflection remains on the tile and counter; the shadow alone is subtle. The same deployed build also showed an empty toaster slot with both slices and the hero shadow hidden, a clean oven handle and door with towel and shadow hidden, and a cabinet shelf with both upper plate bodies and shadows hidden. This accepts those static support checks in the browser, not any moving or terminal state.

The review found one diagnostic label error: a reflection-only kettle state was described as “support only.” The label now lists all visible kettle layers.
