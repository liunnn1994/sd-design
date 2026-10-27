# Graph Report - sd-design  (2026-10-27)

## Corpus Check
- 0 files · ~0 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 104 nodes · 96 edges · 32 communities (0 shown, 32 thin omitted)
- Extraction: 3% EXTRACTED · 97% INFERRED · 0% AMBIGUOUS · INFERRED: 93 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `82dd01e4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## God Nodes (most connected - your core abstractions)

## Surprising Connections (you probably didn't know these)
- `local-theme-provider-runtime spec` --uses--> `ConfigProvider theme object`  [INFERRED]
   →   _Bridges community 0 → community 2_
- `Migrate Generated Demos to Script Setup + Tailwind` --modifies--> `Generated Demo Components`  [INFERRED]
   →   _Bridges community 10 → community 3_

## Import Cycles
- None detected.

## Communities (32 total, 32 thin omitted)

## Knowledge Gaps
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

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