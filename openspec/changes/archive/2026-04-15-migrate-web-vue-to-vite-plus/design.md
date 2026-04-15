## Context

The repository already runs on a two-package active workflow, with packages/web-vue providing the component library and packages/sd-vue-docs providing the Astro-based docs site. However, web-vue still wraps Vite, vue-tsc, style asset emission, and watch behavior inside package-local Node.js scripts, while the workspace root continues to orchestrate package scripts directly through pnpm.

This makes the component-library packaging path harder to reason about than it needs to be. Several scripts in web-vue are thin orchestration layers over Vite or vue-tsc rather than repository-specific logic. At the same time, other scripts are genuinely repository-specific generators for icon components, aggregated Less entrypoints, and IDE metadata. The migration therefore needs to separate replaceable build plumbing from logic that should remain explicit.

The docs package is already on Astro/Starlight and includes a docs-specific vendor sync script for the browser REPL. Replacing Astro-native commands is not a goal of this change. The first migration stage also must not expand scope into swapping Jest for Vitest or replacing stylelint, because that would turn a packaging migration into a broader test and lint tooling migration.

## Goals / Non-Goals

**Goals:**

- Move web-vue packaging, declaration generation, and watch entry points to a package-local Vite+ configuration centered on vite.config.ts.
- Use Vite+ as the workspace-level command entry point for root dev, build, check, and test orchestration.
- Preserve repository-specific generators as explicit pre-pack or prebuild tasks rather than burying them inside custom build wrappers.
- Remove Babel-based or otherwise redundant component-library build plumbing once Vite+ owns the replaceable packaging path.
- Keep the docs package on Astro-native commands while allowing root workflows to orchestrate docs tasks through Vite+.

**Non-Goals:**

- Migrating sd-vue-docs away from Astro or replacing its vendor sync workflow.
- Replacing Jest with Vitest in the first stage.
- Replacing stylelint in the first stage.
- Eliminating repository-specific code generation that Vite+ does not own.

## Decisions

### 1. Use Vite+ as the orchestration layer, not as a blanket replacement for all project logic

Vite+ is a strong fit for package-local packaging and workspace task entry points, but it does not replace project-specific code generation or Astro's own application lifecycle. The migration will therefore move replaceable build logic into vite.config.ts and Vite+ tasks, while keeping repository-specific generators and docs-specific scripts explicit.

Alternative considered: attempting to convert every existing script into a built-in Vite+ command. This was rejected because icon generation, Less index generation, web-types generation, and docs vendor synchronization are repository-specific workflows rather than generic pack/build operations.

### 2. Treat web-vue as the primary migration target and keep docs behavior unchanged

The package with the largest tooling payoff is web-vue. It already uses Vite APIs indirectly, which means the current architecture can be simplified by consolidating configuration rather than redesigning package outputs from scratch. The docs package should keep Astro-native dev and build commands, with root workflows delegating to them through vp run.

Alternative considered: migrating the full workspace to Vite+ built-ins in one pass. This was rejected because the docs package is already cleanly aligned with Astro and would gain little from a disruptive rewrite.

### 3. Keep generators as explicit prerequisites to packaging

The generators for icons, Less entry aggregation, and editor metadata remain necessary because they encode package-specific conventions and emitted assets. The migration will keep them as explicit tasks that run before pack or build, instead of keeping them embedded inside wrapper scripts that also perform general packaging work.

Alternative considered: deleting all custom scripts and rebuilding their behavior inside bundler hooks. This was rejected because it obscures generated asset boundaries and makes non-bundling outputs harder to audit.

### 4. Defer test-runner and style-lint migration

The first stage will preserve the current Jest and stylelint workflows, only changing how root commands orchestrate them. This keeps the migration focused on packaging and workflow entry points, which is the primary pain point and the highest-value simplification.

Alternative considered: migrating to Vitest and replacing stylelint during the same change. This was rejected because it would create avoidable risk and make failures harder to attribute.

## Risks / Trade-offs

- [Vite+ packaging may not exactly match current emitted file layout] → Preserve current package output contracts in the design, and validate es, lib, dist, and json outputs before removing old wrappers.
- [Vue SFC and JSX packaging under Vite+/tsdown may need integration-specific setup] → Adopt the supported Vue packaging integration and keep the first stage scoped to web-vue until outputs match expectations.
- [Root vp run orchestration can obscure package-local command boundaries if overused] → Keep package-local commands explicit and use root scripts only as workspace entry points.
- [Keeping generators explicit means some custom scripts remain] → Document that these scripts are intentional repository-specific generators, not leftover build wrappers.
- [Deferring Jest and stylelint migration leaves mixed tooling in place temporarily] → Make the phase boundary explicit in specs and tasks so the follow-up migration can happen independently.

## Migration Plan

1. Add a package-local vite.config.ts for web-vue that centralizes packaging, development watch, and declaration-generation configuration.
2. Replace web-vue scripts that only proxy Vite or vue-tsc behavior with Vite+ commands or Vite+ managed tasks.
3. Rewire icon, Less, and web-types generators as explicit prerequisites for packaging rather than embedding them in generic build wrappers.
4. Update root workspace scripts to call vp run for dev, build, check, and test orchestration while leaving package-specific implementations intact.
5. Validate published outputs and developer workflows, then remove Babel-driven and redundant wrapper logic from web-vue.

Rollback is straightforward because the change is limited to build and orchestration entry points. The previous package scripts can be restored if output validation fails before release.

## Open Questions

- Whether the final web-vue packaging layout is best expressed entirely through Vite+ pack or through a hybrid of Vite+ run tasks plus Vite-managed style emission.
- Whether the current UMD artifacts remain a supported published contract long term or should be separately evaluated after Vite+ ownership is established.
