# Open plate cabinet · first intact architecture extraction

Review route: `/?scene=kitchen-local-intact` after this branch is deployed for review.

The 205×173 open-cabinet region at `(565, 0)` is now a repository-local lossless image copied pixel-for-pixel from `approved-master.webp`. The stationary renderer clears that region from its base, then draws the cabinet image as an independent architecture layer. The clean plate-cabinet support, remaining upper plate stack, hero plate, and both contact shadows are drawn separately on top. With the cabinet visible, the existing full-room rest composition remains the approved master comparison target.

The master contains no view of the wall hidden by this cabinet. The first diagnostic showed a dark, unfilled shell opening. That first extraction proved ownership and stacking, not an accepted replacement wall or damage state. No older Kitchen image or remote atlas supplies its pixels.

`python scripts/build-cabinet-architecture.py` reproducibly copies the exact cabinet crop from the approved master. `npm run verify-cabinet-architecture` decodes it and checks every pixel. The added 33,844-byte local asset raises the Kitchen rebuild-art budget from 400,000 to 425,000 bytes; the full production bundle budget stays unchanged. This checkpoint does not approve the permanent shell, any other intact architecture zone, hidden cabinet faces, motion or aftermath.

## Deployed visual review

On the deployed branch, the intact layered room and approved-master view appeared aligned, including the cabinet edges and plate stack. Hiding the hero plate and its shadow left the remaining stack; hiding that stack and its shadow exposed the clean photographed shelf without a plate remnant. Hiding the cabinet removed the whole extracted region and disabled the dependent plate controls. The visible dark rectangle is the deliberately unfilled diagnostic opening, **not** approved wall, cabinet damage, or final art. The bowls and mugs still visible when the removable plate stack is hidden belong to the intact cabinet image.

## Proposed backing for the unseen wall

The next checkpoint replaces the black diagnostic opening with `cabinet-backing-proposal.webp`, a separate 205×173 local surface. Its lower tile comes from the adjacent approved-master backsplash and meets the photographed edge. A deterministic painted wall is authored above that tile; the vertical sides and top remain recessed. `scripts/build-cabinet-backing.py` builds the proposal, and `npm run verify-cabinet-backing` checks decoding, distinctness from the intact cabinet and lower-edge continuity. With the cabinet visible, the approved master and exact cabinet layer remain unchanged. With it hidden, the proposal appears and the dependent plates stay absent. The file is **proposed unseen art**, not an approved part of the master or a damage/aftermath frame.

On the deployed checkpoint, the cabinet-hidden view showed the backing instead of black, with no exposed plate pixels. Restoring the cabinet recovered the intact photographed composition. No Kitchen page errors were observed; browser-extension metadata errors were unrelated to the page. The user correctly identified the smooth rectangular area as an obvious cutout. **The cabinet-hidden view fails visual acceptance as finished art.** It remains only an isolation diagnostic; the intact cabinet and independently controlled plates retain their accepted stationary state.

## Intended cabinet damage composition

The game should not make the entire cabinet vanish as a clean rectangle. At low damage, keep the approved cabinet carcass, shelves, dishes and door in place while the hinge and one plate change state. At moderate damage, the door hangs and the plate stack is disturbed; photographed cabinet edges and supports still define the opening. At severe damage, break or displace specific shelf and carcass pieces, with irregular gaps exposing a locally authored wall behind them. Those gaps need coherent trim, tile, depth, shadows, and debris; the wall should occupy only genuinely exposed space. The approved intact master remains the source of every unchanged photographed surface. The current full-rectangle toggle is a separation test, not a target game frame or approved removal state.

## First stationary damage preview

The local proof now offers **Preview stressed hinge**. This preserves the exact photographed cabinet, door, shelves and remaining plate stack, adds a small stress mark on the door wood beside its existing hinge, and slips only the independent hero plate with its shadow. The master comparison remains unchanged. **Isolate backing (diagnostic only)** retains the full-rectangle ownership check but labels it explicitly as a diagnostic; it is not a game frame. This checkpoint contains one static low-damage pose only. Door-hanging, broken shelves, irregular exposed wall, debris and motion are not authored or accepted yet.
