# LESHEM.S OS — Clean 11A.1
## Living Atelier Foundation + Real Render Bridge

### Baseline
Built directly on the current GitHub baseline containing **Clean 10B QA Fixed**.

Verified 10B protections retained:
- A center stone and a meaningful request are both required.
- Pasted text, URLs and file names affect understanding, directions and the brief.
- Uploaded images, models and PDFs are stored through the existing Asset Library.
- Stone selection order is preserved; the first selected stone remains the center stone.
- Reopened creations restore selected stones and textual context.
- Save actions remain guarded against duplicate confirmation.

### What 11A.1 adds

#### 1. Living Atelier product experience
- Rebuilt `/atelier` as a premium, mobile-first guided workspace.
- New visual hierarchy, quiet luxury atmosphere, improved spacing and a consistent graphite / ivory / emerald design language.
- System-wide readable button states: primary, secondary, selected, disabled, loading and hover.
- Clear four-stage journey: start → intent → directions → render.
- Persistent access to “My Creations” and a safe start-over action.

#### 2. Full product and style vocabulary
The visual palette now exposes the real system vocabulary instead of a tiny chip list:
- Pendant, ring, engagement ring, wedding band, earrings, necklace, bracelet, matching piece, metal-only jewelry and free creation.
- Modern, delicate, classic, minimal, luxury, statement, vintage, halo, solitaire, three-stone, tennis, cluster and free direction.
- White, yellow and rose gold, platinum and silver.

The first fully specialized living path remains **one center stone → pendant**. Other product types can already be selected and carried into the existing brief/direction logic, while product-specific visual controls will be expanded in later slices.

#### 3. Visual pendant controls
For the pendant path:
- Setting: prong, bezel, halo or cluster.
- Bail: hidden, classic, integrated or side connection.
- Chain: fine cable, box, fine curb or no chain.
- Four live design sliders:
  - subtle ↔ statement
  - classic ↔ modern
  - minimal ↔ rich
  - balanced design ↔ stone-led
- A responsive conceptual jewelry visual updates immediately as selections change.
- The visual is clearly presented as a live structural preview, not as a finished render.

#### 4. Reactive system response
- “What I understood” updates live from free text, pasted instructions and structured visual selections.
- Structured selections override ambiguous text while text still fills missing choices.
- The selected product, style, metal and pendant structure are injected into all three design directions.
- Every direction is code-enforced to remain the chosen jewelry product type.
- The detailed control state is saved inside the existing brief notes field using a private marker; no new persistence key was introduced.

#### 5. Real render workbench
- New render workspace with visual controls for scene, angle, format, creativity, output count and quality.
- Uses the existing render-package/final-prompt system and saves the prepared package back into the existing Work File.
- Added a server-only Stability AI adapter at `/api/atelier/render`.
- Supports Stable Image Core and Stable Image Ultra.
- The API key stays server-side in `STABILITY_API_KEY` and never reaches the browser.
- Generated images are saved through the existing Asset Library, linked to the Work File and recorded in the existing project render history.
- Controlled user-facing states for preparing, generating, saving, completed and failed.
- Without an API key the UI returns a clear controlled message and does not crash.

### Vercel configuration
Add one server environment variable:

`STABILITY_API_KEY`

No client-side `NEXT_PUBLIC_` key is used.

### Protected architecture
Clean 11A.1 does **not** change:
- existing protected stores
- localStorage / persistence keys
- package.json or package-lock.json
- Work Tray schema
- Asset Library persistence model
- Work File persistence model

No new package was added.

### Build verification
- `npm ci` — passed
- `npm run build` — passed
- `/atelier` — statically generated
- `/api/atelier/render` — dynamic server route generated
- No missing CSS-module class references
- Missing render-key route tested: controlled `engine-not-configured` response

### Recommended QA after Vercel is green
1. Open `/atelier` on desktop and mobile.
2. Choose the emerald from inventory.
3. Write: `תליון עדין ומודרני בזהב לבן`.
4. Select pendant, modern, white gold and adjust setting, bail, chain and sliders.
5. Attach an image, paste another text instruction and add a reference URL.
6. Confirm that the live understanding changes immediately and still identifies a pendant.
7. Continue to “What I understood” and verify the complete structure summary.
8. Generate three directions and verify all three are pendants.
9. Choose one direction and enter the render workbench.
10. Change scene, angle, format and quality; create one render.
11. Confirm that the result is displayed and saved in the same Work File.
12. Exit, open “My Creations” and verify stone, request, references, directions and visual selections return.

### Known boundaries for the next slice
- The current real-render bridge is prompt-driven. It carries stone data and the design brief, but does not yet send the original stone photograph as a direct image-control input. Exact stone-image locking belongs to 11A.2.
- Saved reference files and render outputs are not lost, but their thumbnail blobs are not yet re-resolved inside every Atelier card after a full browser restart. The Asset Library resolver connection is also planned for 11A.2.
- Pendant is the first specialized product-control path. Other jewelry types currently use the shared vocabulary and existing direction/brief logic; each will receive its own visual controls incrementally.

### Recommended commit
`Clean 11A.1 Living Atelier foundation and render bridge`
