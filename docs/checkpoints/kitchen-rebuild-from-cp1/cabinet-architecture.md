# Open plate cabinet · first intact architecture extraction

Review route: `/?scene=kitchen-local-intact` after this branch is deployed for review.

The 205×173 open-cabinet region at `(565, 0)` is now a repository-local lossless image copied pixel-for-pixel from `approved-master.webp`. The stationary renderer clears that region from its base, then draws the cabinet image as an independent architecture layer. The clean plate-cabinet support, remaining upper plate stack, hero plate, and both contact shadows are drawn separately on top. With the cabinet visible, the existing full-room rest composition remains the approved master comparison target.

The master contains no view of the wall hidden by this cabinet. The first diagnostic showed a dark, unfilled shell opening. That first extraction proved ownership and stacking, not an accepted replacement wall or damage state. No older Kitchen image or remote atlas supplies its pixels.

`python scripts/build-cabinet-architecture.py` reproducibly copies the exact cabinet crop from the approved master. `npm run verify-cabinet-architecture` decodes it and checks every pixel. The added 33,844-byte local asset raises the Kitchen rebuild-art budget from 400,000 to 425,000 bytes; the full production bundle budget stays unchanged. This checkpoint does not approve the permanent shell, any other intact architecture zone, hidden cabinet faces, motion or aftermath.

## Deployed visual review

On the deployed branch, the intact layered room and approved-master view appeared aligned, including the cabinet edges and plate stack. Hiding the hero plate and its shadow left the remaining stack; hiding that stack and its shadow exposed the clean photographed shelf without a plate remnant. Hiding the cabinet removed the whole extracted region and disabled the dependent plate controls. The visible dark rectangle is the deliberately unfilled diagnostic opening, **not** approved wall, cabinet damage, or final art. The bowls and mugs still visible when the removable plate stack is hidden belong to the intact cabinet image.

## Proposed backing for the unseen wall

The next checkpoint replaces the black diagnostic opening with `cabinet-backing-proposal.webp`, a separate 205×173 local surface. Its lower tile comes from the adjacent approved-master backsplash and meets the photographed edge. A deterministic painted wall is authored above that tile; the vertical sides and top remain recessed. `scripts/build-cabinet-backing.py` builds the proposal, and `npm run verify-cabinet-backing` checks decoding, distinctness from the intact cabinet and lower-edge continuity. With the cabinet visible, the approved master and exact cabinet layer remain unchanged. With it hidden, the proposal appears and the dependent plates stay absent. The file is **proposed unseen art**, not an approved part of the master or a damage/aftermath frame.

On the deployed checkpoint, the cabinet-hidden view showed the backing instead of black, with no exposed plate pixels or obvious gap at the tile edge. Restoring the cabinet recovered the intact photographed composition. No Kitchen page errors were observed; browser-extension metadata errors were unrelated to the page. At close inspection the painted area is smoother than the photographed cabinetry and tile. This passes as a stationary diagnostic backing, while finished cabinet-removal damage and aftermath art remain unapproved.
