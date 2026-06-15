# @sdata/web-vue-auto-import-resolver

`@sdata/web-vue-auto-import-resolver` 为 `@sdata/web-vue` 提供 `unplugin-vue-components` 自动导入解析能力，以及 SCSS 别名解析。

解析器会在运行时读取已安装的 `@sdata/web-vue` 发布产物来识别组件导出和样式入口，因此新增组件后不需要再维护额外的组件映射文件。

当前解析器仅面向模板自动导入场景，不支持 SSR。

## 安装

```bash
pnpm add @sdata/web-vue
pnpm add -D @sdata/web-vue-auto-import-resolver unplugin-vue-components
```

## Vite（推荐）

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { SdDesignResolver, createSdDesignVitePlugin } from '@sdata/web-vue-auto-import-resolver';

export default defineConfig({
  plugins: [
    vue(),
    createSdDesignVitePlugin(),
    Components({
      resolvers: [
        SdDesignResolver({
          sideEffect: true,
        }),
      ],
    }),
  ],
});
```

`sideEffect: true` 会自动注入组件样式入口，例如 `@sdata/web-vue/es/button/style/index.js`。

`createSdDesignVitePlugin()` 会自动配置 Sass importer 来解析 `@sdata/web-vue` SCSS 文件中的 `@style/` 和 `@components/` 别名。

## 手动配置 SCSS importer

`createSdDesignVitePlugin()` 实际上就是在 `config` hook 里调用了 `createSdDesignScssImporter()` 并注入到 `css.preprocessorOptions.scss.importers`。如果你不想用 Vite 插件，或者需要在非 Vite 环境下使用，可以手动配置：

```ts
import { defineConfig } from 'vite';
import { createSdDesignScssImporter } from '@sdata/web-vue-auto-import-resolver';

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        importers: [createSdDesignScssImporter()],
      },
    },
  },
});
```

## 选项

### SdDesignResolver

```ts
interface SdDesignResolverOptions {
  prefix?: string;
  sideEffect?: boolean;
}
```

- `prefix`：组件前缀，默认是 `Sd`，对应模板里的 `<sd-button />`。
- `sideEffect`：是否自动导入组件样式。

### createSdDesignScssImporter / createSdDesignVitePlugin

```ts
interface SdDesignScssImporterOptions {
  /** @default '@sdata/web-vue' */
  packageName?: string;
}
```

- `packageName`：`@sdata/web-vue` 的包名，默认不需要修改。
