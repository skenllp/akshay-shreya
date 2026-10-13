# Akshay & Shreya — Wedding Invitation

Customised version of the Jishnu & Vibha template. Static site (HTML, CSS, vanilla JS, GSAP + ScrollTrigger, Lenis); fonts and libraries are self-hosted. No build step.

## Deploy
Drag this folder onto Netlify, or import into Vercel (framework "Other", no build command).

## RSVP
Create a Google Sheet > Extensions > Apps Script, paste `google-apps-script/Code.gs`, deploy as a Web app (Execute as Me, access Anyone), then paste the `/exec` URL into `config.js` as `RSVP_ENDPOINT`. Until then the form validates but reports that RSVP is not switched on.

## Notes
- Opening video: `assets/video/wedding-opening.mp4` (Kerala Nilavilakku opening, lightened slightly; poster `assets/images/opening-poster.jpg` is its exact first frame; does not autoplay: visitors tap "Tap to Open" to start it; Skip Intro button; falls back to the hero if it cannot play).
- Sangeeth time is "To be confirmed" (no calendar file until known).
- Photos: website copies in `assets/images/couple/`; untouched originals are in `../original-photos/` (not deployed).

- Celebrations: three alternating illustrated events joined by one scroll-driven gold dotted SVG path (`buildJourney()` in `js/main.js`, GSAP ScrollTrigger scrub). It is rebuilt on resize, font load and image load, and shows fully drawn for `prefers-reduced-motion`.
- Footer: no couple photograph; dark brown/burgundy veil over the existing lantern background.
- Music: `assets/music.webm` (same track as the Jishnu & Vibha site) with `assets/music.mp3` as a fallback for browsers without WebM/Opus. It starts when the visitor taps Tap to Open / Skip Intro; the round button bottom-left pauses or resumes it.
- Share image: `assets/images/og-image.jpg` (1200×630) at https://akshay-shreya.vercel.app/assets/images/og-image.jpg.
