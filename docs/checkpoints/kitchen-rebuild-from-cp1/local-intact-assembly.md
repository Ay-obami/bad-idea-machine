# Local intact Kitchen assembly · static checkpoint

Review route: `/?scene=kitchen-local-intact` after the branch is built and deployed for review.

The 1000×600 approved master remains the reference and base image. The proof replaces five local regions with their clean repository-local supports, then draws the extracted contact layers and photographed objects in the same camera: pan, both toast slices, towel, hero plate, remaining plate stack and kettle. Each exposed body, shadow and kettle reflection has a separate toggle. **Show approved master** switches to the unaltered reference for comparison.

This checkpoint is intentionally partial. The toaster housing and cord remain baked into the toast support; intact architecture is not yet separated into local zone layers. The older remote intact/aftermath atlas routes are not part of this proof. It does not approve motion or any terminal tier.

The local assembly was decoded and compared at native 1000×600 size. Its full-frame mean absolute RGB difference from the approved master is 0.723 per channel. Both the complete rest assembly and the all-extracted-layers-hidden support view were visually inspected. The five individual truth gates remain available at `/?scene=kitchen-object-truth` for larger crop inspection.

The next local asset task is to separate the stationary toaster, its cord and its counter contact from the approved master, with a believable empty counter beneath it. That asset must pass a support-only and intact-rest comparison before the room assembly can be considered complete.

## Deployed room review, 2026-09-23

The deployed `058e8f9` room proof loaded the repository-local assets and displayed the entire intact composition. Switching to **Show approved master** kept camera and composition aligned. With all extracted layers hidden, the empty toaster slot, oven handle, cabinet shelf and kettle counter remained readable. The room-scale view exposed a small bright triangular remnant in the pan's dark rear backsplash that had been obscured by the pan body in individual rest checks.

The local pan support was repaired at only 209 decoded pixels inside its rear backsplash, using neighboring support pixels derived from the approved master. The master, photographed pan body and pan shadow remain untouched. `npm run verify-pan-support` checks the cleared remnant, decoded dimensions and intact-rest registration. This fix awaits a deployed browser recheck; the old deployed support should not be marked accepted.
