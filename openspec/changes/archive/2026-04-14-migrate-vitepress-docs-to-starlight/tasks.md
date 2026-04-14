## 1. Starlight site foundation

- [x] 1.1 Add the Astro/Starlight configuration, content structure, and Vue integration needed for the new docs package.
- [x] 1.2 Replace starter content in packages/sd-vue-docs with simplified-Chinese site metadata, homepage, nav, and sidebar scaffolding for guides and components.
- [x] 1.3 Add shared MDX components and styles required to render migrated component docs and example blocks.

## 2. Migration pipeline

- [x] 2.1 Implement a Node migration script that reads legacy guide-source, component README.zh-CN.md, and **demo** sources and writes final Markdown/MDX files into the Starlight content tree.
- [x] 2.2 Add migration transforms for frontmatter, headings, internal links, component category grouping, and demo metadata extraction.
- [x] 2.3 Add coverage validation so the migration command fails when any legacy guide or component document is not represented in the target site.

## 3. Interactive examples

- [x] 3.1 Implement a Starlight-compatible interactive demo component that renders preview, description, and editable Vue source for each migrated example.
- [x] 3.2 Connect migrated demo metadata and source strings to the interactive example component and verify edited code updates the preview.
- [x] 3.3 Verify component pages render all migrated demos correctly in local development and production build output.

## 4. Workflow switch and cleanup

- [x] 4.1 Update repository and package-level docs commands to use packages/sd-vue-docs for dev, build, and preview workflows.
- [x] 4.2 Remove legacy docs:prepare, docgen-related commands, and unused migration/generation scripts that are no longer part of the supported workflow.
- [x] 4.3 Update README and package documentation to describe the Starlight + MDX authoring flow and simplified-Chinese-only scope.
