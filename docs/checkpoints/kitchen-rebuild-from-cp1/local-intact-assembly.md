# Local intact Kitchen assembly · static checkpoint

Review route: `/?scene=kitchen-local-intact` after the branch is built and deployed for review.

The 1000×600 approved master remains the reference and base image. The proof replaces six local regions with their clean repository-local supports, then draws the extracted contact layers and photographed objects in the same camera: pan, toaster and cord, both toast slices, towel, hero plate, remaining plate stack and kettle. Each body, contact layer and reflection has a separate toggle. **Show approved master** switches to the unaltered reference for comparison.

This checkpoint is intentionally partial. Intact architecture is not yet separated into local zone layers. The older remote intact/aftermath atlas routes are not part of this proof. It does not approve motion or any terminal tier.

The local assembly was decoded and compared at native 1000×600 size. After toaster separation, its full-frame mean absolute RGB difference from the approved master is 0.752 per channel. Both the complete rest assembly and the all-extracted-layers-hidden support view were visually inspected. The five earlier individual truth gates remain available at `/?scene=kitchen-object-truth` for larger crop inspection.

The toaster atlas has a clean tile, unplugged outlet, backsplash and counter support; photographed housing and lead; independent wall and counter contact shadows; and a separate stone reflection. The housing and plug retain exact approved-master pixels. Only the empty slot hidden by bread uses the existing approved-source toast support; small unplugged socket marks come from another outlet in the same approved master. The toast slices retain their existing independent layers. `npm run verify-toaster-truth` decodes the atlas, checks the empty support and layer alpha, and compares the full stationary toaster and toast rest with the approved crop (MAE 3.700). This is stationary geometry only; the hidden back and moving states have not been authored.

## Deployed room review, 2026-09-23

The deployed `058e8f9` room proof loaded the repository-local assets and displayed the entire intact composition. Switching to **Show approved master** kept camera and composition aligned. With all extracted layers hidden, the empty toaster slot, oven handle, cabinet shelf and kettle counter remained readable. The room-scale view exposed a small bright triangular remnant in the pan's dark rear backsplash that had been obscured by the pan body in individual rest checks.

The local pan support was repaired at only 209 decoded pixels inside its rear backsplash, using neighboring support pixels derived from the approved master. The master, photographed pan body and pan shadow remain untouched. `npm run verify-pan-support` checks the cleared remnant, decoded dimensions and intact-rest registration. After deployment of `cedcb38`, a refreshed browser review of the all-extracted-layers-hidden room showed the bright triangular remnant was gone. This accepts that stationary pan support in the deployed room view.

The new toaster separation is locally inspected and verified, but still needs a deployed browser review at the room scale, especially with toaster, cord, both shadows and reflection hidden while the two toast slices can be toggled separately.
