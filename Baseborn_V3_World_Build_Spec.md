---
title: "Baseborn V3 World Engine Build Specification"
project: Baseborn Industries
status: draft_for_build
created: 2026-07-02
version: 1.0
tags: [baseborn, wordpress, woocommerce, world_engine, scroll_experience, architecture]
related: [Baseborn_V3_Claude_Code_Roadmap, Baseborn_V3_Image_Prompt_Pack, Baseborn_Industries_Master]
---

# Baseborn V3 World Engine Build Specification

> [!info] What this document is
> The complete architecture for the interactive scroll through world experience described in the Interactive World and Website Vision brief. It defines how the experience is built on WordPress and Hostinger, how the backend stays editable without code, how WooCommerce plugs in, and how AI generated imagery powers the whole thing. This is the document you hand to Claude Code alongside the phase prompts in the roadmap file.

---

## 1. Core decision: how we fake 3D on WordPress

A true realtime 3D world (Three.js, WebGL) requires actual 3D models of the city, house, rooms, and characters. Those models do not exist yet. So V3 uses a proven technique instead: **pre rendered keyframe scenes driven by scroll**. This is the same trick used by cinematic product pages (Apple style scroll scrubbing) and it fits your exact pipeline, because every frame is an image you generate in MidJourney or ChatGPT.

Three tiers, built in order:

| Tier | Technique | What you need | When |
| --- | --- | --- | --- |
| **A. Keyframe Journey** | 10 to 14 hero stills. Scroll crossfades between them with Ken Burns style zoom, pan, and layered parallax. Feels like a camera descending through the world. | 1 image per stop (day and night doubles it) | Build now |
| **B. Frame Sequences** | 30 to 90 frames per camera move, scrubbed on a canvas element as you scroll. True cinematic motion. | Video AI interpolation between your keyframes (Runway, Luma, Kling), exported as JPG frames | Upgrade later, per scene |
| **C. Realtime 3D** | Three.js scenes with actual Foundling models | Blender models of characters and rooms | Future, after 3D modeling |

The engine is built so a scene can be upgraded from Tier A to Tier B by uploading a frame folder in the admin, with zero code changes. Tier C becomes a separate project later.

**Engine library:** GSAP with ScrollTrigger (free core covers everything needed: pinning, scrub, timelines). No page builders, consistent with V2 rules.

---

## 2. The world map (site structure)

The experience is one continuous scroll journey broken into four acts, then the persistent hub. This maps the vision brief onto buildable pages.

### Act 1: Arrival (the descent)
One pinned scroll sequence, 10 keyframes:

1. Earth (stylized created world, no state lines)
2. Cloud dive
3. Coastline (Pacific Northwest feel, ocean pulled closer)
4. City aerial (fictionalized Portland inspired city, bridges, rivers)
5. Freeway lights and moving cars
6. Neighborhood rooftops
7. The Foundlings' street
8. The Foundlings' house exterior
9. Window approach
10. Bedroom reveal (lands on the hub)

### Act 2: Character intros
Three pinned panels, each with a day and night variant driven by the site wide day and night switch:

* Poach: bathroom brushing teeth (day) / garage heavy bag training (night)
* Cypher: living room sketchbook and coffee (day) / GELOS Limited studio (night)
* Neo: backyard skate setup (day) / backyard soccer pitch under lights (night)

Each panel has a single call to action node into that Foundling's route (apparel line plus hobby world).

### Act 3: About and Contact
* About Baseborn: the neon back alley scene. Top half is brand and world philosophy, bottom half is the founder story. Foundlings appear in the scene as visual anchors.
* Contact: St. George HQ storefront in red rock scenery. Contact info, business inquiries, collabs, support.

### Act 4: The Hub (the bedroom)
The scroll journey ends here and the site becomes explorable. This is the existing V2 Room concept expanded. Circuit Nodes (hotspots) on objects:

| Object | Destination |
| --- | --- |
| Clothing rack | Apparel, split by Foundling section |
| Backpack hanger | Hobby worlds: Poach to MMA gear, Cypher to art and clothing, Neo to skate and soccer and snow |
| Desk | Art supplies, tutorials, creative resources |
| Dresser | Collectibles, figurines, non apparel |
| TV and arcade | Social, videos, lore, easter eggs |
| Extra details | Posters, mirror, calendar, window, closet, and more, added over time |

### Sub screens
Every hotspot opens a sub screen: a head on close up image of that spot with floating object buttons, exactly the V2 pattern. Sub screens **slide over** the hub as a full viewport layer with the persistent back button, rather than replacing the page. This resolves the open design question from the master doc: sliding over preserves scroll position and world continuity, and it lets vertical sub screens be taller and scrollable. Flag if you want the replace behavior instead.

---

## 3. Data model (the easy to edit backend)

Everything editable lives in ACF PRO field groups attached to custom post types and one options page. This deliberately moves scene editing out of the Customizer, because V2 proved the Customizer preview iframe fights this kind of theme (fixed position invisibility, preview JS key mismatches). The Customizer keeps only global identity settings.

### Custom post types

**`bb_scene`** (replaces and extends the V2 `bb_location`)
* `scene_act` (select: arrival / intro / about / hub / subscreen)
* `scene_order` (number)
* `scene_day_image` (image)
* `scene_night_image` (image)
* `scene_bg_layer_image`, `scene_mid_layer_image`, `scene_fg_layer_image` (optional images for parallax depth, Tier A)
* `scene_frame_folder_day`, `scene_frame_folder_night` (optional gallery fields for Tier B frame sequences)
* `scene_transition` (select: crossfade / zoom_in / pan_down / scrub_sequence)
* `scene_caption` (short world voice line, optional)
* `scene_hotspots` (repeater, below)

**Hotspot repeater fields** (each row is one Circuit Node)
* `hotspot_label` (text)
* `hotspot_x`, `hotspot_y` (number, percent position on the image)
* `hotspot_icon` (select: pulse_dot / mini_poach / mini_cypher / mini_neo / hang_tag / spray_can / custom_image)
* `hotspot_link_type` (select: scene / subscreen / product_category / product / page / url)
* `hotspot_target` (relationship or text depending on type)

**`bb_foundling`** and **`bb_drop`** carry over from V2 unchanged.

### Options page: BB World Settings (ACF options, under the existing BB World admin menu)
* Lock screen image and toggle
* Day and night mode (auto by visitor clock / forced day / forced night)
* Seasonal skin (select: default / holiday / event) plus per skin image override fields, so a Christmas reskin is a dropdown change, not a rebuild
* Announcement bar, social links, footer content
* Global fallback image

### Non negotiable naming rule
Every image field key ends in `_image`. Never `_img`. This single convention caused a site wide breakage in V2 and it is now law.

### Auto page creation
On theme activation the theme programmatically creates and assigns: Home (world journey), Shop, About, Contact, and one page per hub sub screen, each with the right template, skipping any page that already exists. This was confirmed feasible in the V2 sessions and V3 finally implements it.

---

## 4. WooCommerce integration

* Hotspots with `product_category` type open a **world framed shop panel**: the category grid slides up inside the scene chrome (dark frame, scene image dimmed behind), so shopping never feels like leaving the world. Reuses the V2 slide up panel system.
* Product cards keep the V2 collection dot system (red Poach, gold Cypher, blue Neo).
* Each `bb_foundling` post already stores a WooCommerce collection tag; hotspot buttons resolve category URLs through it, so renaming a category in WooCommerce never breaks a scene.
* The product marquee strip from V2 stays, mounted below the hub, pulling live products with the styled placeholder fallback.
* Quick add to cart stays AJAX (existing `main.js` pattern).
* Every WooCommerce call wrapped in existence checks. No exceptions. V2 law.

### New category architecture required by the vision brief
The hobby worlds add categories that do not exist yet in the V2 category map:
* Poach: MMA and Muay Thai gear (gloves, wraps, rash guards, training apparel)
* Cypher: GELOS Limited (handmade and DIY pieces as their own line)
* Neo: skate (decks, boards), soccer (balls, cones, training), snow gear

These are created as WooCommerce categories with placeholder products during the build so every hotspot resolves, then swapped for real products as they exist.

---

## 5. Scroll engine behavior

* **Pinned acts:** each act pins to the viewport while its internal timeline scrubs with scroll (GSAP ScrollTrigger `pin: true, scrub: 1`).
* **Tier A transitions:** keyframe images stacked; scroll drives opacity crossfades plus subtle scale (1.0 to 1.12) and directional pan, with the three parallax layers moving at different rates when provided.
* **Tier B:** if a frame gallery exists for a scene, the engine switches that scene to canvas frame scrubbing automatically.
* **Mobile:** same scroll engine, vertical images preferred for sub screens per the two format standard (3:4 or 2:3). Touch swipe advances hub scenes, matching V2 `world.js`.
* **Reduced motion:** `prefers-reduced-motion` collapses the journey to simple fades and a skip to hub button. The skip button also always exists in the corner for returning visitors ("Enter the room").
* **Performance:** images lazy load one act ahead; frame sequences preload only when their trigger is within one viewport; WebP with JPG fallback; hero images capped near 350 KB.
* **Positioning law:** no `position: fixed` for anything that must appear inside preview contexts. Persistent UI (back button, day night toggle, cart) uses in flow sticky patterns proven in the V2 nav rebuild.

---

## 6. Visual canon for this build

The Foundling geometry rules are untouched and non negotiable: low poly, visible flat polygon faces, Poach two upright horns in brick red #C8351F, Cypher one right horn plus mandatory broken left stub in golden yellow #D4AC0D, Neo drooping horns in cobalt blue #2E6DB4.

> [!warning] Canon conflict to resolve
> The vision brief asks for soft shadows, bloom, and ambient occlusion (2003 to 2008 console era Blender render). The locked V2 visual system says hard shadow edges only. These cannot both be true. Recommendation: the **journey scenes** (Earth, city, descent) adopt the console era cinematic treatment, while **hub and sub screen scenes** keep the locked hard shadow isometric canon so nothing already built drifts. The image prompt pack is written with this split. Confirm or override.

> [!warning] Scope conflict to resolve
> The vision brief expands the world far beyond the three locked locations (Room, Courtyard, Street) into a full house, city, gym, studio, and HQ. Treat V3 as an authorized canon expansion where the existing three locations remain valid interior destinations of the larger world. The Courtyard and Street become reachable from the neighborhood scenes rather than being replaced. Confirm.

---

## 7. Theme packaging and deployment

* Theme slug: `baseborn-v3`, delivered as `baseborn-v3.zip` with a single top level directory and `index.php` present (V2 law, silent rejection otherwise).
* Built as a full theme carrying forward the V2 codebase, not a child theme, so the fixed navigation, marquee, footer, and security hardening come along.
* No typed class property declarations on anything extending WordPress core classes.
* Deployed to Hostinger via zip upload, staging first if a staging environment exists on the plan. I am not certain whether your Hostinger plan includes staging, so verify in hPanel before the first V3 deploy; if it does not, deploy during a low traffic window with an UpdraftPlus backup taken immediately before.
* Domain is never hardcoded anywhere in the theme. All internal URLs resolve through `home_url()` and the BB Page Slugs and URLs panel, because the canonical front domain (imbaseborn.com vs basebornindustries.com) is still an open conflict in the master document.

---

## 8. Placeholder inventory (gaps filled with temporary content)

Everything below ships as a working placeholder so the build never stalls. Each token also appears in the image prompt pack.

| Token | Placeholder used | Replace with |
| --- | --- | --- |
| [CITY_NAME] | "Foundling City" | Real fictional city name if you want one |
| [HOUSE_STYLE] | Two story weathered craftsman, dark wood, brick base | Your intended house design |
| [FOUNDER_BLURB] | Three sentence generic founder story | Saul's real founder story |
| [GELOS_LOGO] | Plain stitched "GELOS LTD." tag | Real GELOS Limited mark |
| [HQ_SIGNAGE] | "BASEBORN IND. HQ" steel letters | Final HQ sign design |
| [CONTACT_EMAIL] | hello@ placeholder, wired to Contact Form 7 | Real inbox |
| [DROP_DATE] | Countdown set to a dummy future date | Real drop date in YYYY-MM-DDTHH:MM:SS |
| [AMBIENT_AUDIO] | None (field exists, empty) | Optional scene loops later |

---

## 9. Definition of done for V3 phase one

* Full scroll journey works desktop and mobile with Tier A keyframes (placeholder AI images acceptable)
* Hub loads with all hotspots resolving to real routes, zero dead clicks (the V2 dresser failure mode is the test case)
* Day and night toggle swaps every scene image
* WooCommerce categories exist for every hotspot with at least placeholder products
* All scene content editable from BB World admin without touching code
* Auto page creation verified on a fresh activation
* WP_DEBUG clean, no notices from the theme
