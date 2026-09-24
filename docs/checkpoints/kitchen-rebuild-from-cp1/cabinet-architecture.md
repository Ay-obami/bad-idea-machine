# Open plate cabinet · first intact architecture extraction

Review route: `/?scene=kitchen-local-intact` after this branch is deployed for review.

The 205×173 open-cabinet region at `(565, 0)` is now a repository-local lossless image copied pixel-for-pixel from `approved-master.webp`. The stationary renderer clears that region from its base, then draws the cabinet image as an independent architecture layer. The clean plate-cabinet support, remaining upper plate stack, hero plate, and both contact shadows are drawn separately on top. With the cabinet visible, the existing full-room rest composition remains the approved master comparison target.

The master contains no view of the wall hidden by this cabinet. **Hide open plate cabinet** therefore shows a dark, unfilled shell opening; plate controls are disabled while their cabinet support is absent. The opening is a diagnostic that proves ownership and stacking, not an accepted replacement wall or damage state. No older Kitchen image, generated wall or remote atlas supplies its pixels.

`python scripts/build-cabinet-architecture.py` reproducibly copies the exact cabinet crop from the approved master. `npm run verify-cabinet-architecture` decodes it and checks every pixel. The added 33,844-byte local asset raises the Kitchen rebuild-art budget from 400,000 to 425,000 bytes; the full production bundle budget stays unchanged. This checkpoint does not approve the permanent shell, any other intact architecture zone, hidden cabinet faces, motion or aftermath.
