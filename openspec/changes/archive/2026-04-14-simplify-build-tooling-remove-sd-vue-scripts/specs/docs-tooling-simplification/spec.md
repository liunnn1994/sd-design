## MODIFIED Requirements

### Requirement: Legacy doc generation scripts MUST be removed from the active workflow

The system MUST remove the legacy VitePress doc generation commands, unused supporting scripts, and any dependency on the shared sd-vue-scripts package from the active documentation workflow once the Starlight migration is in place.

#### Scenario: Repository docs commands are executed

- **WHEN** a developer runs the repository's docs development or build commands
- **THEN** those commands target the Starlight docs package directly and do not require prebuilding or invoking sd-vue-scripts

#### Scenario: Legacy docgen entry points are reviewed

- **WHEN** the migration is complete
- **THEN** docs:prepare, docgen-linked legacy scripts, sd-vue-scripts-linked doc helpers, and other unreferenced automation entry points are absent from the supported documentation workflow

#### Scenario: Docs asset preparation runs

- **WHEN** the docs package prepares vendor assets or styles needed for local development or production builds
- **THEN** it consumes web-vue source files or published-style outputs directly rather than routing through a shared tooling package
