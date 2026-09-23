# Toast and towel static support repair

The approved Kitchen master remains authoritative. `scripts/repair-object-supports.py` uses only the existing approved-source truth atlases and adjacent pixels to clean the supports; it does not replace the master, the photographed toast body, the towel body, their reference crops, or their shadows.

The second, stationary slice was previously baked into the toast support and looked like a piece of the hidden hero. It now has an independent atlas frame. The proof page provides separate **hero toast**, **remaining slice**, and **hero shadow** toggles. Hide both slices and the shadow to see the empty toaster slot; hide only the hero to leave the intended second slice. With everything shown, the rest crop still matches the approved reference.

The towel support contained a small bright trace at the oven handle and a vertical stripe down the oven door. These traces were replaced from adjacent oven pixels within the same atlas. Hiding towel and shadow now reveals the clean handle and door. This is a static support check; neither object is cleared for motion.
