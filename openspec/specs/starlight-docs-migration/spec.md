## ADDED Requirements

### Requirement: Legacy Chinese docs SHALL be migrated into Starlight content

The system SHALL migrate all existing simplified-Chinese guide pages and component documentation from the legacy VitePress docs sources into the Starlight docs collection as routable Markdown or MDX files.

#### Scenario: Guide pages are migrated

- **WHEN** the migration script processes packages/sd-vue-docs/guide-source/\*.zh-CN.md
- **THEN** it creates corresponding files under the Starlight docs content tree with preserved title, description, and rewritten internal links

#### Scenario: Component docs are migrated

- **WHEN** the migration script processes packages/web-vue/components/\*/README.zh-CN.md
- **THEN** it creates one Starlight page per component with the component title, description, category metadata, and converted body content

### Requirement: Migration coverage MUST be verifiable

The system MUST verify that every legacy guide page and every component documentation page that exists in the migration source set has a corresponding generated target file in the Starlight docs tree.

#### Scenario: Migration completes with full coverage

- **WHEN** all source guides and component README files are converted successfully
- **THEN** the migration command reports a successful coverage check with no missing documents

#### Scenario: Migration detects a missing target

- **WHEN** any source guide or component README does not produce a target document
- **THEN** the migration command fails and reports the missing source entry

### Requirement: The Starlight docs site SHALL be simplified-Chinese only

The system SHALL expose only simplified-Chinese documentation content, navigation labels, and routes for the migrated docs site.

#### Scenario: Site navigation is generated

- **WHEN** the Starlight configuration builds the top navigation and sidebar
- **THEN** all labels and linked documents are derived from the simplified-Chinese content set only

#### Scenario: No secondary locale content is present

- **WHEN** the docs content tree is inspected after migration
- **THEN** it does not contain duplicated locale directories or non-Chinese variants for the migrated pages
