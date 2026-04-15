## 1. Web-vue Vite+ foundation

- [x] 1.1 Add the Vite+ dependencies and package-local configuration needed for Vue SFC, JSX, declaration generation, and packaging inside packages/web-vue.
- [x] 1.2 Create packages/web-vue/vite.config.ts that consolidates the current module, UMD, style, watch, and declaration-generation behavior into a Vite+ managed design.
- [x] 1.3 Preserve the current published output contract for es, lib, dist, and json artifacts while validating that the new Vite+ packaging path produces equivalent outputs.

## 2. Replace replaceable build wrappers

- [x] 2.1 Update packages/web-vue/package.json so start, build:component, build:dts, and related replaceable entry points route through Vite+ instead of custom Node.js wrappers.
- [x] 2.2 Rewire icon generation, Less index generation, and web-types generation as explicit pre-pack or prebuild tasks without removing those repository-specific generators.
- [x] 2.3 Remove Babel-based or otherwise redundant component-library build plumbing that is no longer needed once Vite+ owns packaging.

## 3. Preserve non-goal workflows

- [x] 3.1 Keep the existing Jest unit-test workflow supported from packages/web-vue without migrating to Vitest in this change.
- [x] 3.2 Keep the existing stylelint workflow supported in the first migration stage without replacing it as part of the packaging change.
- [x] 3.3 Keep packages/sd-vue-docs on Astro-native dev and build commands, including its docs-specific vendor sync workflow.

## 4. Migrate root workspace entry points

- [x] 4.1 Update the repository root package.json so dev, build, check, and test commands use vp run as the top-level orchestration entry point.
- [x] 4.2 Ensure root orchestration still targets only packages/web-vue and packages/sd-vue-docs, with docs tasks delegating to Astro-native package-local commands.
- [x] 4.3 Validate local and CI-oriented workflows after the migration and remove obsolete root-level command plumbing that no longer reflects the supported workflow.
