## ADDED Requirements

### Requirement: Component examples SHALL remain viewable and editable in docs

The system SHALL render component examples inside Starlight documentation pages with both a live preview and an interface for editing the example source.

#### Scenario: A component page includes demos

- **WHEN** a migrated component page contains one or more legacy demo sources
- **THEN** each demo is rendered as an interactive example block with preview, description, and editable source code

#### Scenario: A user edits demo code

- **WHEN** a user changes the code in the interactive example editor
- **THEN** the preview updates using the edited source without requiring a full page refresh

### Requirement: Demo source fidelity MUST be preserved

The system MUST preserve each demo's original Vue source, title, and Chinese description during migration so that the interactive editor starts from the same behavior as the legacy docs example.

#### Scenario: Demo metadata is migrated

- **WHEN** the migration script converts a legacy **demo**/\*.md file
- **THEN** it stores the demo title, description, and extracted Vue source for the target Starlight page

#### Scenario: Demo source is shown to the reader

- **WHEN** a reader opens an interactive example block
- **THEN** the editor content matches the migrated Vue source from the legacy demo file
