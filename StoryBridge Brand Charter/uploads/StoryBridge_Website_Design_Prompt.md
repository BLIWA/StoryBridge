# StoryBridge Content & Media — Website Design Prompt

*Use this document as a single prompt to give Claude when you're ready to design/build the site. It consolidates everything from `Who_We_Are.md`, `How.md`, and the Maghreb Boutique Agency Benchmarks & Pricing Strategy report.*

---

## The Prompt

Using the StoryBridge Content & Media project files (`Who_We_Are.md`, `How.md`, and the Maghreb Boutique Agency Benchmarks and Pricing Strategy report), design a full website for StoryBridge Content & Media.

### Brand & tone
Reflect the "editorial-led, journalist-founded" positioning identified in the benchmarking report (the VeraContent / Untold / The Content House template) — journalistic credibility as the core trust anchor, not generic "digital agency" language. Own the trilingual Maghreb niche explicitly (Arabic + French + English, with North African/Maghrebi Arabic nuance vs. Gulf-centric Modern Standard Arabic).

### Design direction
Boutique, editorial, warm-but-professional. Avoid generic "digital marketing agency" visual clichés — lean into a journalism/print-inspired aesthetic (clean typography, editorial layout conventions, masthead-style treatments) that reinforces the "journalistic values applied to content" positioning. Founder profiles should feel like a bio page in a publication, not a generic "meet the team" grid.

### Format
Build this as an HTML/React artifact (or confirm my preferred format) so I can see and iterate on the actual design, not just a written plan. Before building, load the frontend-design skill for visual design guidance, and confirm single-page vs. multi-page site if it isn't obvious from context.

---

## Full Sitemap & Section-by-Section Requirements

### 1. Home
- Hero section
- Short "About" blurb (the ready-made short version explicitly written for website use in `Who_We_Are.md`)
- Trust signals (journalism credentials, languages, editorial process)
- Service overview with links to Services page
- Primary CTA

### 2. Who We Are
- Full origin story from `Who_We_Are.md`: the friendship, the shared newsroom, the shared magazine experience, and how the idea became a company
- "What We Do" — the four core pillars: Content & Editorial, Translation & Localization, Editing & Writing, Media & Press Services
- "Why StoryBridge?" brand philosophy section

### 3. Founder Profiles
- Individual bio for **Assia Touati** — editor-in-chief, editorial instinct, audience/message shaping, understanding content as part of a larger product
- Individual bio for **Imen Bliwa** — journalist, translator, researcher across Arabic/English/French, 10+ years in journalism, translation and international media
- Framed per the report's benchmark pattern: founders' journalism credentials as the core trust anchor (VeraContent's Shaheen Samavati, Untold's Rob Cowen, The Content House's two-journalist-founder model — StoryBridge is the closest structural analogue to The Content House)

### 4. How We Work
Visualize the 7-step methodology from `How.md` as a process/journey:
1. We listen first
2. We build the right approach
3. We go beyond the desk (field/on-location capability: reporting, interviews, events, fixing)
4. We create with purpose
5. We connect languages and cultures
6. We deliver
7. And we stay involved (ongoing partnership model)

Include the closing tagline: *"Listen. Understand. Prepare. Go where the story is. Create. Translate. Edit. Deliver."*

### 5. Services
Productized into named packages per the report's recommendations:
- Article Pack
- Website Content
- Press Release + Distribution
- Localization
- Editorial Polish
- **Launch Package** (bundled: content + translation + press release + distribution — the report's clearest expression of the four-service model)

Show the visible multi-step editorial workflow as a quality guarantee (brief → native writer → editor → QA), and highlight a single point-of-contact/project manager per assignment — a recurring differentiator across VeraContent, ContentME, and Tarjama per the report.

### 6. Newsletter
Dual-purpose section:
- **As a service**: newsletter writing/management offered as part of the Content & Editorial line
- **As proof**: StoryBridge's own newsletter functions as a live portfolio of writing quality (per the report's findings on VeraContent, ContentME, and Tarjama's content-marketing engines)
- Include a signup capture form

### 7. Blog
- Blog index + sample post layout
- Functions as the "live portfolio of writing quality" the report identifies as a critical proof mechanism for boutique content agencies
- Should reinforce editorial/print aesthetic, not a generic CMS blog template

### 8. Case Studies / Portfolio *(gap identified — not explicit in source docs, but recommended)*
- Not mentioned directly in `Who_We_Are.md` or `How.md`, but the benchmarking report repeatedly flags case studies and client testimonials as a **near-universal trust signal** across every competitor profiled (VeraContent, Untold, ContentME, Tarjama, Contentworks, etc.)
- Recommend including even as a placeholder/"coming soon" structure until real client work exists

### 9. Pricing / Packages
Transparent pricing bands per the report's recommendations (pricing transparency itself is flagged as a rare differentiator in the Maghreb market, where most competitors quote on request):
- **Translation**: ~$0.06–0.12/word (Arabic/English/French)
- **Content**: ~$80–250 per article, depending on length/research
- **Editing/Proofreading**: ~$0.02–0.05/word, or per-project rate
- **Media/Press**: monthly retainer in the ~$1,000–3,000 band

### 10. Contact
- Standard contact form/info
- Reinforce the single point-of-contact / project-manager framing from the Services section

---

## Source Traceability Notes

| Section | Primary Source |
|---|---|
| Home, Who We Are, Founder Profiles | `Who_We_Are.md` |
| How We Work | `How.md` |
| Services (productized packages), Newsletter (as proof), Blog (as proof), Pricing bands, Case Studies gap | Benchmarks & Pricing Strategy report |
| Newsletter (as service), Contact | Combined / inferred from four-pillar service model + report's PM/single-point-of-contact recommendation |

**Open item to confirm with the person before building:** whether Case Studies/Portfolio should be built as a full section now (with placeholder content) or deferred until real client work is available to feature.
