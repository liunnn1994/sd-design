# Graph Report - sd-design  (2026-11-16)

## Corpus Check
- 0 files · ~0 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 104 nodes · 96 edges · 32 communities (10 shown, 22 thin omitted)
- Extraction: 3% EXTRACTED · 97% INFERRED · 0% AMBIGUOUS · INFERRED: 93 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3a50d285`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- upgrade-style-architecture
- Component Size System
- upgrade-style-architecture
- Generated Demo Components
- Arco Design Migration
- component-library-tooling capability
- Controlled/Uncontrolled Pattern
- migrate-generated-demos-to-script-setup-tailwind
- overdrive skill
- Naive UI Migration
- Astro Config (sd-vue-docs)
- polish skill
- quieter skill
- typeset skill
- Trigger Component
- sync-vendor.mjs
- Virtual List
- Astro Runtime (Starlight + MDX)
- docs-tooling-simplification capability
- LLMs.txt Standard
- useFormItem Hook
- Netlify docs deploy
- OpenSpec CLI
- Astro/Starlight
- Astro/Starlight
- Global Method Pattern
- workspace-package-workflows capability
- RangePicker
- ShortcutType
- DescriptionsItem
- icongen
- Root Directory

## God Nodes (most connected - your core abstractions)

## Surprising Connections (you probably didn't know these)
- `local-theme-provider-runtime spec` --uses--> `ConfigProvider theme object`  [INFERRED]
   →   _Bridges community 0 → community 2_
- `Migrate Generated Demos to Script Setup + Tailwind` --modifies--> `Generated Demo Components`  [INFERRED]
   →   _Bridges community 10 → community 3_

## Import Cycles
- None detected.

## Communities (32 total, 22 thin omitted)

### Community 0 - "upgrade-style-architecture"
Cohesion: 0.31
Nodes (9): ConfigProvider theme object, CSS variable fallback strategy, css-variable-token-system spec, homepage-theme-showcase spec, Less-to-Scss migration, runtime-theme-config-provider spec, scss-style-architecture spec, upgrade-style-architecture (+1 more)

### Community 2 - "upgrade-style-architecture"
Cohesion: 0.24
Nodes (10): docs-theme-editor spec, fix-local-theme design, fix-local-theme implementation baseline, fix-local-theme-implementation, fix-local-theme tasks, local-theme-provider-runtime spec, subtree theme container, theme-docs-runtime-consistency spec (+2 more)

### Community 3 - "Generated Demo Components"
Cohesion: 0.23
Nodes (16): Alert Component Documentation, Avatar Component Documentation, Badge Component Documentation, Breadcrumb Component Documentation, Button Component Documentation, Card Component Documentation, Carousel Component Documentation, Checkbox Component Documentation (+8 more)

### Community 7 - "migrate-generated-demos-to-script-setup-tailwind"
Cohesion: 0.28
Nodes (9): DemoEditor REPL preview, generated-demo-source-conventions spec, interactive-doc-examples spec (modified), migrate-generated-demos design, migrate-generated-demos-to-script-setup-tailwind, migrate-generated-demos tasks, script setup lang=ts convention, shared demo Tailwind stylesheet (+1 more)

### Community 8 - "overdrive skill"
Cohesion: 0.22
Nodes (9): browser automation iteration (overdrive), context-appropriate ambition assessment, frontend-design skill dependency (overdrive), performance rules (overdrive), progressive enhancement (overdrive), propose before building (overdrive), overdrive skill, overdrive technical toolkit (+1 more)

### Community 10 - "Astro Config (sd-vue-docs)"
Cohesion: 0.25
Nodes (8): Generated Demo Source Conventions Spec, Migrate Generated Demos to Script Setup + Tailwind, sd-vue-docs, Astro Config (sd-vue-docs), Generated Docs Sidebar, LLMs Documentation Integration, LLMs.txt Documentation Page, Tailwind CSS Setup

### Community 11 - "polish skill"
Cohesion: 0.29
Nodes (7): polish checklist, polish dimensions, final verification (polish), frontend-design skill dependency (polish), interaction states checklist, pre-polish assessment, polish skill

### Community 12 - "quieter skill"
Cohesion: 0.40
Nodes (5): frontend-design skill dependency (quieter), intensity source assessment, quieter design philosophy, quieter refinement dimensions, quieter skill

### Community 13 - "typeset skill"
Cohesion: 0.40
Nodes (5): typography assessment dimensions, frontend-design skill dependency (typeset), typography improvement dimensions, typography sizing strategy, typeset skill

### Community 15 - "sync-vendor.mjs"
Cohesion: 0.67
Nodes (3): Build Artifacts (es, dist, json), Public Vendor Resources, sync-vendor.mjs

## Knowledge Gaps
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 15 inferred relationships involving `Generated Demo Components` (e.g. with `Migrate Generated Demos to Script Setup + Tailwind` and `Alert Component Documentation`) actually correct?**
  _`Generated Demo Components` has 15 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `DemoBlock Component` (e.g. with `Alert Component Documentation` and `Avatar Component Documentation`) actually correct?**
  _`DemoBlock Component` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `upgrade-style-architecture` (e.g. with `fix-local-theme-implementation` and `ConfigProvider theme object`) actually correct?**
  _`upgrade-style-architecture` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `overdrive skill` (e.g. with `browser automation iteration (overdrive)` and `context-appropriate ambition assessment`) actually correct?**
  _`overdrive skill` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `polish skill` (e.g. with `polish checklist` and `polish dimensions`) actually correct?**
  _`polish skill` has 5 INFERRED edges - model-reasoned connections that need verification._