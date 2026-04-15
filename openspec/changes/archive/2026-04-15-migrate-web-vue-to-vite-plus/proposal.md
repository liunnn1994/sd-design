## Why

The web-vue package still relies on a hand-rolled build orchestration layer around Vite, vue-tsc, and asset generation scripts, which makes the component-library toolchain harder to maintain and harder to align with the rest of the workspace. Vite+ now provides a credible path to consolidate packaging, task orchestration, and workspace command entry points without changing the docs site's Astro-based workflow.

## What Changes

- Migrate the web-vue component-library build entry points to a Vite+ managed configuration centered on a package-local vite.config.ts.
- Replace package-local wrapper scripts for component build, declaration generation, and development watch with Vite+ task and packaging entry points.
- Keep repository-specific code generation for icons, aggregated Less entries, and web-types metadata, but run those generators as explicit pre-pack or prebuild tasks instead of mixing them into custom build wrappers.
- Preserve the current docs package build and dev workflow based on Astro, and preserve the current Jest and stylelint workflows during the first migration stage.
- Update root workspace scripts to use vp run as the top-level orchestration layer for component-library and docs workflows.
- Remove Babel-based component build plumbing and other replaceable component-library build logic once Vite+ fully owns the web-vue packaging path.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `component-library-tooling`: Change the supported web-vue development and build workflow so Vite+ owns package-local packaging, declaration generation, and task entry points while preserving repository-specific generators.
- `workspace-package-workflows`: Change the supported root-level dev, build, check, and test commands so they are orchestrated through Vite+ while keeping the docs package on Astro-native commands.

## Impact

- Affected package: packages/web-vue.
- Affected workspace orchestration: package.json at the repository root.
- Expected new dependency surface: vite-plus and any Vite+/tsdown-compatible Vue packaging integration required by web-vue.
- Expected removals or reductions: Babel-driven library build plumbing in web-vue and redundant custom Node.js build wrappers that only proxy Vite or vue-tsc behavior.
- Explicitly not in scope for this change: migrating sd-vue-docs away from Astro, replacing Jest with Vitest, or replacing stylelint in the first stage.
