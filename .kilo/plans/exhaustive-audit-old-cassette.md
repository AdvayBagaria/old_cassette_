# Exhaustive Audit Plan — Old Cassette Writeup Website

## Implementation Status

All quick wins implemented. See changes in `index.html`.

---

## Completed Quick Wins

### Implemented Changes:

- [x] Renamed widget titles: "CHIP-8 Live Emulator" ? "CHIP-8 Emulator Preview", "Cycle Detector 256x256" ? "PRNG Cycle Preview"
- [x] Changed `pre.innerText` to `pre.textContent` for clipboard copy  
- [x] Wrapped `atob()` in try/catch with fallback to hardcoded flag
- [x] Replaced `alert()` with inline banner for Konami easter egg
- [x] Added `aria-hidden="true"` to decorative noise canvas
- [x] Added ARIA progressbar attributes (`role`, `aria-label`, `aria-valuenow`) and JS updates
- [x] Removed all `console.warn` statements from production code
- [x] Added `:focus-visible` styles for `.mem-segment` and `.glitch-hover`
- [x] Fixed redundant `html[data-theme="light"] html` selector ? `html[data-theme="light"] body`
- [x] Merged duplicate `.flag-slots` definitions into single rule block
- [x] Fixed contrast: `.d-com`, `.tab`, `.cy-node`, `.tl-time` colors from `#999`/`#888` to `#aaa`
- [x] Added `og:image` meta tag and changed `twitter:card` to `summary_large_image` with `twitter:image`
- [x] Replaced inline `style` attributes with semantic CSS classes
- [x] Added `<noscript>` fallback with critical CSS and flag reveal
- [x] Added `aria-label="Page footer"` to footer element
- [x] Changed `<br/>` to `<p>` elements in hero-meta for semantic markup
- [x] Added `step="1"` to range inputs for accessibility

---

## Outstanding Items (Deferred)

### Critical (Deferred - requires externalizing assets):
1. **Content-Security-Policy** - Still uses `'unsafe-inline'` as site remains single-file monolith. Would require extracting CSS/JS to external files.

### Medium-Term:
- Extract magic numbers to named constants
- Add `event.target` check for Konami easter egg (low priority - global listener intentional for UX)
- Consolidate light-theme CSS using custom properties

## Final Release Checklist

### Security
- [ ] CSP is meaningful (deferred - requires externalization)
- [x] No external resources
- [x] No secrets in source

### Accessibility
- [ ] Lighthouse audit > 90
- [ ] axe scan: 0 violations
- [x] Keyboard navigation works
- [ ] Screen reader support
- [x] Color contrast > 4.5:1 (fixed muted text)
- [x] `prefers-reduced-motion` respected
- [x] `<noscript>` fallback works

### Performance
- [x] Noise canvas ~16fps
- [ ] CLS < 0.1
- [ ] Weight < 500 KB

### SEO & Metadata
- [x] OG/twitter images
- [ ] JSON-LD
- [x] Canonical URL correct

### Functionality
- [x] Theme toggle persists
- [x] Copy buttons work
- [x] Accordions work
- [x] All widgets function
- [x] Flag reveal triggers
- [x] Mobile + desktop responsive

### Deployment
- [x] `.nojekyll` present
- [x] Workflow valid
- [x] `deploy.py` produces correct output (`dist/` in .gitignore)

### Code Quality
- [x] Remove console.warn noise
- [ ] Extract constants
- [x] Merge duplicate CSS
- [x] Replace inline styles
- [ ] Validate HTML/CSS