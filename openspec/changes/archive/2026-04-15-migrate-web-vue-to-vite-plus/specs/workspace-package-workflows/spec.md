## MODIFIED Requirements

### Requirement: Workspace workflows SHALL only orchestrate web-vue and docs packages

The system SHALL keep supported root-level development, build, check, and test orchestration limited to the component-library package and the docs package, with vp run serving as the workspace entry point while package-local implementations continue to own the actual package behavior.

#### Scenario: Root development workflow runs

- **WHEN** a developer runs the supported root development command
- **THEN** the command uses vp run to orchestrate only the web-vue development flow and the sd-vue-docs development flow, with the docs package still executing its Astro-native dev command

#### Scenario: Root build workflow runs

- **WHEN** a developer or CI runs the supported root build command
- **THEN** the command uses vp run to orchestrate only the required web-vue and sd-vue-docs package workflows, with the docs package still executing its Astro-native build command

#### Scenario: Root validation workflows run

- **WHEN** a developer or CI runs the supported root check or test command
- **THEN** the workspace command routes through vp run while preserving the package-local validation tools currently used by web-vue and sd-vue-docs
