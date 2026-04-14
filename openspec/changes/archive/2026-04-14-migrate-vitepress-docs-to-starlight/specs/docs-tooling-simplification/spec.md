## ADDED Requirements

### Requirement: MDX SHALL become the editable source of truth for docs

The system SHALL store migrated documentation pages as Markdown or MDX files directly under the Starlight docs content tree so maintainers can modify the final pages without re-running a docgen-style page generator.

#### Scenario: A maintainer edits a migrated page

- **WHEN** a maintainer updates a generated Starlight document after migration
- **THEN** the change is applied by editing the page file directly rather than editing an intermediate generated output

#### Scenario: The docs site is built

- **WHEN** the docs package build command runs
- **THEN** it consumes the Starlight content tree directly without executing the legacy docs:prepare workflow

### Requirement: Legacy doc generation scripts MUST be removed from the active workflow

The system MUST remove the legacy VitePress doc generation commands and unused supporting scripts from the active documentation workflow once the Starlight migration is in place.

#### Scenario: Repository docs commands are executed

- **WHEN** a developer runs the repository's docs development or build commands
- **THEN** those commands target the Starlight docs package instead of the legacy VitePress package

#### Scenario: Legacy docgen entry points are reviewed

- **WHEN** the migration is complete
- **THEN** docs:prepare, docgen-linked legacy scripts, and other unreferenced legacy docs automation entry points are absent from the supported documentation workflow
