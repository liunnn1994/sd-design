# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.

When you find dead code:

- Delete it. Dead code is a defect, not something to leave for someone else.
- Cover every kind: unused imports/variables/functions, unreachable branches, vestigial state, files nothing references.
- Verify nothing references it first (including deep imports of built output and test helpers) — a "dead" file that ships in `es/` may still be deep-imported.
- Report what you removed.

The test: Every changed line should trace directly to the user's request.

## Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## Component Test Synchronization

- When changing a component's behavior, API, or styles, update or add the related E2E and Cypress component tests in the same change, including shared tests that assert that component's behavior or styles. Keep assertions aligned with the intended behavior and run the affected tests before considering the change complete.
- All E2E tests must pass in headless Chrome. Run the affected E2E tests in this mode before considering the change complete.

## Browser E2E CI

- Keep `.github/workflows/browser-tests.yml` browser-only. Run Vue component specs, React browser specs, and documentation E2E in headless Chrome. Run the Vue and React non-browser checks in `.github/workflows/non-browser-tests.yml` and keep release validation in the release workflows.
- For PRs targeting `main` and pushes to `main`, select affected specs from the Git diff. Core changes can affect both Vue and React. Framework-only changes target that framework, and documentation changes target the documentation job. Combine the scopes for mixed changes. Preserve full-suite fallbacks for shared infrastructure changes and unavailable diff bases. Daily scheduled runs and manual dispatch cover all three suites.
- Keep documentation E2E in one job. Run the React parity and scenario specs through `@sdata/web-react test:docs:e2e` so the LiveCodes iframe settings stay scoped to documentation tests. Documentation changes and full runs include both frameworks. Shard Vue by the first letter of the component directory and the remaining React specs by the first letter of the spec filename. Start only nonempty shards and ensure the full matrix covers each spec exactly once.
- Share the pnpm store and Cypress binary cache across all shards of the same framework. Use separate cache keys for Vue and React, and keep shard identifiers out of those keys.
- Use the shared file dependency graph in `scripts/browser-dependency-graph.ts` for both frameworks and reuse it from the Vue release selector. Use Oxc for JS, TS, TSX, and Cypress calls, the Vue SFC compiler for `.vue` blocks, PostCSS for SCSS, an HTML parser for fixture entry points, and the existing module resolver for import paths. Do not extract source references with handwritten regular expressions or maintain a separate dependency graph per framework.
- Include transitive dependents. Vue runs whole spec groups for affected runtime components and includes individual specs that depend on changed files across component boundaries. React follows browser fixture and documentation dependencies. Build the documentation preview only when a selected suite requires it. When changing selection or sharding, verify representative Git diffs and confirm that the scheduled run still covers every spec exactly once.

## Vue / React Documentation Parity

- Vue and React component documentation must align 1:1: the same component pages, feature coverage, example scenarios and ordering, and equivalent API documentation. Update both frameworks in the same change.
- Keep common content in `packages/sd-vue-docs/src/content/shared`; use framework-specific blocks for actual differences. Generate the output pages instead of editing `src/content/docs` directly.
- React documentation must use the actual React exports, TSX, props, callbacks, render props, Context and ref APIs; never reuse Vue-only syntax, registration, slots or AppContext instructions as React usage. Verify each framework against its implementation.
- Framework-specific guides, configuration and difference explanations need not match 1:1; add or remove them according to the actual framework support.
- Run documentation parity tests, generation checks and the documentation build after changing these sources or their generator.

## typescript

Type-checking runs on **typescript-native-bridge** (TNB) — a drop-in `typescript` package whose checker is tsgo (TypeScript 7, Go-native), behind the classic `typescript` API. It is pinned exactly in `pnpm-workspace.yaml` (both `catalog:` and `overrides:` — update both, exact version, no caret) and covers `vue-tsc`, `tsc`, and `build:dts`. Editors need `js/ts.tsdk.path` in `.vscode/settings.json` plus "TypeScript: Select TypeScript Version → Use Workspace Version".

- The checker's behavior is tsgo's, not stock TypeScript's — diagnostics can differ from stock; if output looks wrong, compare against tsgo before assuming a repo bug.
- Use `vue-tsc`/`tsc` (the `typescript` package) for type-checking, and `type-fest` whenever possible for type combinations.
- Do not use `@typescript/native-preview` or install `typescript@7` directly — the classic API (`createProgram`, `vue-tsc`, tsserver plugins) is not a drop-in fit for them; TNB exists for this reason.
- Do not replace TNB with stock TypeScript while diagnosing a tool failure. First reproduce the failure against the exact consumer; Cypress 15 supports TypeScript 5, 6 and 7 and uses the workspace TNB without a separate compiler.
- Do not silence TypeScript deprecations with `ignoreDeprecations`; update deprecated compiler options or code so type-checking is clean without suppression.
- If a specific tool is proven incompatible with TNB, keep TNB as the workspace `typescript` override and add stock TypeScript only to that package as an exact alias: `"typescript-stock": "npm:typescript@6.0.3"`. Invoke the aliased compiler explicitly so it cannot replace `vue-tsc`, editor or repository-wide type-checking.

## modules

**This repository is ESM-only. No CJS compatibility.**

All packages (including the root) declare `"type": "module"` — this is a deliberate decision, not something to fix:

- New code uses `import`/`export` only; never write `require()`/`module.exports`.
- Do not add compatibility layers for CJS consumers (dual-format builds, require exports, require-able UMD, etc.).
- Tool configuration uses ESM TypeScript; do not introduce `.cjs` configuration files.
- Use `.ts`/`.mts` for Node scripts; Node ≥24 can import `.ts` directly (e.g. `theme-catalog.ts` imports `token-key.ts`).

## style

Using scss for styles, and follow the existing style conventions in the codebase. Do not introduce new patterns or libraries unless explicitly required.

## Browser compatibility

- Keep published Vue and React components and the documentation site compatible with the Windows 7 desktop baseline in `.browserslistrc`. Verify Chrome 109, Edge 109, Opera 95 and Firefox 115 ESR.
- Use [Baseline Widely Available](https://web.dev/baseline?hl=zh-cn) to inform mobile support and record explicit minimum versions in `.browserslistrc`. Review those minimums when supported device coverage changes.
- Check shared styles and features against both desktop and mobile targets. Apply the mobile floors to features used exclusively on mobile.
- When introducing CSS features, check Can I Use against the configured versions and review both SCSS entry points and compiled CSS. Supply a working fallback where a missing feature affects layout, interaction or legibility. Guard unsupported values stored in custom properties with `@supports` so they do not override the fallback at computed-value time.
- Let `@vitejs/plugin-legacy` handle JavaScript syntax and supported polyfills in application builds that use it. Verify CSS and browser APIs separately, including styles and assets published by the component libraries and loaded directly by consumers.
- When changing browser targets, refresh the browser support tables in the README and the shared getting-started guide.

## Update Notes

## If you make changes to the project architecture, be sure to update README.md, QUICK-START.md, and ARCHITECTURE.md accordingly.

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
