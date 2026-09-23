# Kitchen kettle static truth checkpoint

Review route: `/?scene=kitchen-object-truth`, then choose **Counter kettle**.

The approved repository-local `approved-master.webp` is the only source for the 120×120 reference crop and the photographed kettle body. The hidden wall tile and counter beneath the kettle are restored deterministically from neighboring tile and stone in that same master. The contact shadow is a separate translucent color layer. The conspicuous silver reflection on the counter belongs to a separate, softly masked photographed layer; hiding it with the body and shadow reveals clean stone. No older Kitchen image or remote atlas is read by this truth gate.

Use the three independent toggles to inspect support alone, kettle alone, contact shadow alone, reflected counter highlight alone, and the intact rest state against **Show reference**. The body is a stationary photographed extraction. Its far side and tipped state have not been authored, and this checkpoint does not approve motion or the Tier 1 terminal frame, which still depends on older remote atlas URLs.

The atlas is reproducible with `python scripts/build-kettle-truth.py`; `npm run verify-kettle-truth` decodes it, checks its exact reference against the approved master, confirms independent layers and clean support samples, and compares the rest composite with the approved crop. Native-size and enlarged crops were visually inspected locally.
