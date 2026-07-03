---
title: "Baseborn V3 Claude Code Roadmap and Prompt Pack"
project: Baseborn Industries
status: ready_to_run
created: 2026-07-02
version: 1.0
tags: [baseborn, claude_code, roadmap, wordpress, build_prompts]
related: [Baseborn_V3_World_Build_Spec, Baseborn_V3_Image_Prompt_Pack]
---

# Baseborn V3 Claude Code Roadmap

> [!info] How to use this file
> Work top to bottom. Each phase has a goal, what you personally do, and a paste ready prompt for Claude Code. Put `Baseborn_V3_World_Build_Spec.md` in the repo root before Phase 1 so every prompt can reference it. Run one phase per session, commit at the end of each phase, and test on a local WordPress or staging install before any Hostinger upload.

## Phase 0: Repo and environment

**Goal:** a real Git repo so the theme stops living as loose zips.

**You do:** create a GitHub repo named `baseborn-v3`. Get the current live `baseborn-v2` theme folder off Hostinger (hPanel File Manager, download `wp-content/themes/baseborn-v2` as zip) and put it in the repo under `/legacy/baseborn-v2/`. Install Local (localwp.com) or use Hostinger staging for a test WordPress with WooCommerce and ACF PRO installed.

**Claude Code prompt:**

```
Read Baseborn_V3_World_Build_Spec.md in the repo root. Initialize this repo for a WordPress theme project. Create: a .gitignore appropriate for WordPress theme development (ignore node_modules, .DS_Store, zips, env files), a README.md summarizing the V3 project from the spec, and a /docs folder containing a BUILD_LOG.md I will append to each phase. Do not write theme code yet. Then inspect /legacy/baseborn-v2 and produce docs/V2_AUDIT.md listing: every template file, every Customizer setting key (flag any image key not ending in _image), every custom post type, every WooCommerce call and whether it is guarded, any typed class properties on classes extending WordPress core, and any position: fixed usage. This audit is the migration map.
```

## Phase 1: Theme scaffold and data model

**Goal:** `baseborn-v3` theme activates cleanly with all CPTs, ACF fields, and auto page creation.

**Claude Code prompt:**

```
Read Baseborn_V3_World_Build_Spec.md, especially sections 3 and 7, and docs/V2_AUDIT.md. Scaffold the baseborn-v3 theme in /baseborn-v3, carrying forward from /legacy/baseborn-v2: the security hardening, the World Nav Bar and arrow and dot rail navigation, the slide up panel system, the product marquee with WooCommerce fallback, the four column footer, and the BB Page Slugs and URLs panel. Hard rules: no typed class properties on anything extending WordPress core classes; every WooCommerce function call wrapped in function_exists or class_exists checks; every image field key ends in _image; no position: fixed for persistent UI, use the in flow sticky patterns from V2; nav walker classes only in functions.php.

Build: (1) the bb_scene CPT with all fields from spec section 3 registered via ACF PRO local field groups in PHP (acf_add_local_field_group) so fields are version controlled, (2) carry over bb_foundling and bb_drop unchanged, (3) the BB World ACF options page with day and night mode, seasonal skin select with override image fields, lock screen, announcement bar, social links, (4) auto page creation on after_switch_theme creating Home, Shop, About, Contact and one page per hub sub screen with correct templates, skipping existing pages, (5) template files: front-page.php (journey), template-hub.php, template-sub-scene.php, template-about.php, template-contact.php.

Make sure the theme activates with zero PHP notices under WP_DEBUG even when WooCommerce and ACF are deactivated. Update docs/BUILD_LOG.md. Package nothing yet.
```

## Phase 2: Scroll journey engine

**Goal:** the Act 1 descent works with placeholder images.

**Claude Code prompt:**

```
Read spec sections 1, 2, and 5. Build assets/js/journey.js using GSAP and ScrollTrigger (enqueue GSAP core and ScrollTrigger from local files in assets/vendor, do not hotlink a CDN). Implement: pinned act containers with scrubbed timelines; Tier A keyframe crossfade with subtle scale 1.0 to 1.12 and directional pan per scene_transition; optional three layer parallax when layer images exist; automatic Tier B canvas frame scrubbing when a scene has a populated frame gallery, with preloading only when the scene is within one viewport; a persistent Enter The Room skip control; prefers-reduced-motion fallback that collapses to simple fades. front-page.php queries bb_scene posts where scene_act is arrival ordered by scene_order and renders the journey. Generate 10 placeholder keyframe images as simple dark SVG or canvas gradients labeled with the scene name so the journey is testable before AI images exist. Keep total new JS under control and comment each ScrollTrigger block. Update docs/BUILD_LOG.md.
```

## Phase 3: Hub, hotspots, and sub screens

**Goal:** the bedroom hub with clickable Circuit Nodes and slide over sub screens, zero dead routes.

**Claude Code prompt:**

```
Read spec sections 2 and 3. Build template-hub.php and the hotspot renderer: hotspots position by percent coordinates over the scene image, scale correctly on resize, render their selected icon with a pulse affordance, and resolve links by hotspot_link_type (scene, subscreen, product_category via the bb_foundling collection tag when relevant, product, page, url). Sub screens open as a full viewport slide over layer above the hub with the persistent back button, preserving hub scroll position, using the V2 panel system patterns. Add a routing self test: a WP CLI command or admin page under BB World called Route Check that iterates every hotspot on every scene and reports any target that resolves to a 404 or empty page, because V2 shipped with a blank /dresser/ and that must be impossible to miss now. Wire the day night toggle to swap scene_day_image and scene_night_image everywhere including sub screens. Update docs/BUILD_LOG.md.
```

## Phase 4: WooCommerce world shop layer

**Goal:** shopping inside the world frame.

**Claude Code prompt:**

```
Read spec section 4. Build the world framed shop panel: product_category hotspots open the category grid in the slide up panel with the scene dimmed behind, product cards carry the collection dot system (red #C8351F Poach, gold #D4AC0D Cypher, blue #2E6DB4 Neo), AJAX add to cart carried from V2 main.js. Create a seeder under BB World called Seed World Catalog that creates the WooCommerce categories from spec section 4 (including MMA gear, GELOS Limited, skate, soccer, snow) with 2 placeholder products each, marked with a _bb_placeholder meta so they are easy to bulk delete later. Every WooCommerce call guarded. Confirm the theme still activates cleanly with WooCommerce disabled. Update docs/BUILD_LOG.md.
```

## Phase 5: Acts 2 and 3, seasonal system, polish

**Goal:** character intros, About alley, St. George HQ contact, seasonal reskin.

**Claude Code prompt:**

```
Read spec sections 2 and 3. Build the Act 2 character intro panels (three pinned panels, day and night variants, one call to action node each into that Foundling route), template-about.php as the neon alley layout with a brand section and a founder section using the [FOUNDER_BLURB] placeholder, and template-contact.php as the St. George HQ scene with Contact Form 7 integration and [CONTACT_EMAIL] placeholder. Implement the seasonal skin system: when BB World seasonal skin is not default, any scene override images for that skin replace the standard images site wide. Add countdown support reading data-countdown attributes in YYYY-MM-DDTHH:MM:SS format for drop panels. Update docs/BUILD_LOG.md.
```

## Phase 6: QA, performance, and packaging

**Goal:** deployable zip.

**Claude Code prompt:**

```
Run a full QA pass: WP_DEBUG clean on activation, deactivation, and with WooCommerce and ACF toggled off; run the Route Check and paste results into docs/QA_REPORT.md; verify auto page creation on a fresh activation; verify every image key ends in _image; grep for unguarded WooCommerce calls, typed properties on core extending classes, and position: fixed on persistent UI; Lighthouse the journey page and get mobile performance above 80 with lazy loading one act ahead and WebP with JPG fallback; confirm images cap near 350 KB with a note in the report for any that do not. Then package baseborn-v3.zip with a single top level baseborn-v3 directory containing index.php at its root, and verify the zip structure programmatically before finishing. Update docs/BUILD_LOG.md and write docs/DEPLOY_CHECKLIST.md covering: UpdraftPlus backup first, upload zip, activate, run Seed World Catalog if needed, run Route Check, spot check day night toggle, enable caching last.
```

## Phase 7: Image swap and launch

No Claude Code prompt. You generate the real scene images with the prompt pack file, upload them through BB World and the bb_scene posts, rerun Route Check, and deploy per the checklist. Tier B frame sequences come later, scene by scene, whenever you interpolate keyframes into frames.

---

## Standing guardrails for every Claude Code session

Paste this block at the top of any ad hoc session on this repo:

```
Project rules that override anything else: no typed class properties on classes extending WordPress core; every WooCommerce call guarded with existence checks; all image field keys end in _image never _img; no position: fixed for persistent UI; nav walkers only in functions.php; theme zips must contain one top level directory with index.php; never hardcode the site domain, use home_url(); countdown timestamps use YYYY-MM-DDTHH:MM:SS. Read Baseborn_V3_World_Build_Spec.md before making decisions.
```
