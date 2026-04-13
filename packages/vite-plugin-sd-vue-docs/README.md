# `@sd-design/vite-plugin-sd-vue-docs`

Provides Markdown to Vue Component in SD Vue Docs

## Usage

```tsx
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDocs from '@sd-design/vite-plugin-sd-vue-docs';

export default defineConfig({
  plugins: [vueDocs(), vue()],
});
```
