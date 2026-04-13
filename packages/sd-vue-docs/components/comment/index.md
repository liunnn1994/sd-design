---
title: 'comment'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 数据展示
title: 评论 Comment
description: 展示评论信息
```

## API

### `<comment>` Props

| 参数名 | 描述 | 类型 | 默认值 |
| --- | --- | --- | :-: |
| author | 作者名 | `string` | `-` |
| avatar | 头像 | `string` | `-` |
| content | 评论内容 | `string` | `-` |
| datetime | 时间描述 | `string` | `-` |
| align | 靠左/靠右 展示 datetime 和 actions | `'left' \| 'right' \| { datetime?: "left" \| "right"; actions?: "left" \| "right" }` | `'left'` |

### `<comment>` Slots

| 插槽名   |   描述   | 参数 |
| -------- | :------: | ---- |
| avatar   |   头像   | -    |
| author   |   作者   | -    |
| datetime | 时间描述 | -    |
| content  | 评论内容 | -    |
| actions  | 操作列表 | -    |

<script setup lang="ts">
import alignDemo from '../../.vitepress/theme/generated/comment/align.vue';
const alignSource = "<template>\n  <a-comment author=\"Balzac\" datetime=\"1 hour\" align=\"right\">\n    <template #actions>\n      <span class=\"action\" key=\"heart\" @click=\"onLikeChange\">\n        <span v-if=\"like\">\n          <IconHeartFill :style=\"{ color: '#f53f3f' }\" />\n        <\/span>\n        <span v-else>\n          <IconHeart />\n        <\/span>\n        {{ 83 + (like ? 1 : 0) }}\n      <\/span>\n      <span class=\"action\" key=\"star\" @click=\"onStarChange\">\n        <span v-if=\"star\">\n          <IconStarFill style=\"{ color: '#ffb400' }\" />\n        <\/span>\n        <span v-else>\n          <IconStar />\n        <\/span>\n        {{ 3 + (star ? 1 : 0) }}\n      <\/span>\n      <span class=\"action\" key=\"reply\">\n        <IconMessage /> Reply\n      <\/span>\n    <\/template>\n    <template #avatar>\n      <a-avatar>\n        <img\n          alt=\"avatar\"\n          src=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp\"\n        />\n      <\/a-avatar>\n    <\/template>\n    <template #content>\n      <div>\n        A design is a plan or specification for the construction of an object or\n        system or for the implementation of an activity or process, or the\n        result of that plan or specification in the form of a prototype, product\n        or process.\n      <\/div>\n    <\/template>\n  <\/a-comment>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\nimport {\n  IconHeart,\n  IconMessage,\n  IconStar,\n  IconStarFill,\n  IconHeartFill,\n} from '@sdata/web-vue/es/icon';\n\nexport default {\n  components: {\n    IconHeart,\n    IconMessage,\n    IconStar,\n    IconStarFill,\n    IconHeartFill,\n  },\n  setup() {\n    const like = ref(false);\n    const star = ref(false);\n    const onLikeChange = () => {\n      like.value = !like.value;\n    };\n    const onStarChange = () => {\n      star.value = !star.value;\n    };\n\n    return {\n      like,\n      star,\n      onLikeChange,\n      onStarChange\n    }\n  },\n};\n<\/script>\n\n<style scoped>\n.action {\n  display: inline-block;\n  padding: 0 4px;\n  color: var(--color-text-1);\n  line-height: 24px;\n  background: transparent;\n  border-radius: 2px;\n  cursor: pointer;\n  transition: all 0.1s ease;\n}\n\n.action:hover {\n  background: var(--color-fill-3);\n}\n<\/style>";
const alignTitle = "Align.Md";
const alignDescription = "通过 `align` 属性可以设置 `datetime` 和 `actions` 的对齐方式.";
import basicDemo from '../../.vitepress/theme/generated/comment/basic.vue';
const basicSource = "<template>\n  <a-comment\n    author=\"Socrates\"\n    content=\"Comment body content.\"\n    datetime=\"1 hour\"\n  >\n    <template #actions>\n      <span class=\"action\" key=\"heart\" @click=\"onLikeChange\">\n        <span v-if=\"like\">\n          <IconHeartFill :style=\"{ color: '#f53f3f' }\" />\n        <\/span>\n        <span v-else>\n          <IconHeart />\n        <\/span>\n        {{ 83 + (like ? 1 : 0) }}\n      <\/span>\n      <span class=\"action\" key=\"star\" @click=\"onStarChange\">\n        <span v-if=\"star\">\n          <IconStarFill style=\"{ color: '#ffb400' }\" />\n        <\/span>\n        <span v-else>\n          <IconStar />\n        <\/span>\n        {{ 3 + (star ? 1 : 0) }}\n      <\/span>\n      <span class=\"action\" key=\"reply\">\n        <IconMessage /> Reply\n      <\/span>\n    <\/template>\n    <template #avatar>\n      <a-avatar>\n        <img\n          alt=\"avatar\"\n          src=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp\"\n        />\n      <\/a-avatar>\n    <\/template>\n  <\/a-comment>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\nimport {\n  IconHeart,\n  IconMessage,\n  IconStar,\n  IconStarFill,\n  IconHeartFill,\n} from '@sdata/web-vue/es/icon';\n\nexport default {\n  components: {\n    IconHeart,\n    IconMessage,\n    IconStar,\n    IconStarFill,\n    IconHeartFill,\n  },\n  setup() {\n    const like = ref(false);\n    const star = ref(false);\n    const onLikeChange = () => {\n      like.value = !like.value;\n    };\n    const onStarChange = () => {\n      star.value = !star.value;\n    };\n\n    return {\n      like,\n      star,\n      onLikeChange,\n      onStarChange\n    }\n  },\n};\n<\/script>\n<style scoped>\n.action {\n  display: inline-block;\n  padding: 0 4px;\n  color: var(--color-text-1);\n  line-height: 24px;\n  background: transparent;\n  border-radius: 2px;\n  cursor: pointer;\n  transition: all 0.1s ease;\n}\n.action:hover {\n  background: var(--color-fill-3);\n}\n<\/style>";
const basicTitle = "Basic.Md";
const basicDescription = "一个基本的评论组件，带有作者、头像、时间和操作。";
import editorDemo from '../../.vitepress/theme/generated/comment/editor.vue';
const editorSource = "<template>\n  <a-comment\n    align=\"right\"\n    author=\"Balzac\"\n    avatar=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp\"\n    content=\"A design is a plan or specification for the construction of an object\n          or system or for the implementation of an activity or process, or the\n          result of that plan or specification in the form of a prototype,\n          product or process.\"\n    datetime=\"1 hour\"\n  >\n    <template #actions>\n      <span class=\"action\"> <IconMessage /> Reply <\/span>\n    <\/template>\n    <a-comment\n      align=\"right\"\n      avatar=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp\"\n    >\n      <template #actions>\n        <a-button key=\"0\" type=\"secondary\"> Cancel <\/a-button>\n        <a-button key=\"1\" type=\"primary\"> Reply <\/a-button>\n      <\/template>\n      <template #content>\n        <a-input placeholder=\"Here is you content.\" />\n      <\/template>\n    <\/a-comment>\n  <\/a-comment>\n<\/template>\n\n<script>\nimport { IconMessage } from '@sdata/web-vue/es/icon';\n\nexport default {\n  components: {\n    IconMessage,\n  },\n};\n<\/script>\n\n<style scoped>\n.action {\n  display: inline-block;\n  padding: 0 4px;\n  color: var(--color-text-1);\n  line-height: 24px;\n  background: transparent;\n  border-radius: 2px;\n  cursor: pointer;\n  transition: all 0.1s ease;\n}\n.action:hover {\n  background: var(--color-fill-3);\n}\n<\/style>";
const editorTitle = "Editor.Md";
const editorDescription = "评论框配合回复框使用";
import nestDemo from '../../.vitepress/theme/generated/comment/nest.vue';
const nestSource = "<template>\n  <a-comment\n    author=\"Socrates\"\n    avatar=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp\"\n    content=\"Comment body content.\"\n    datetime=\"1 hour\"\n  >\n    <template #actions>\n      <span class=\"action\"> <IconMessage /> Reply <\/span>\n    <\/template>\n    <a-comment\n      author=\"Balzac\"\n      avatar=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/9eeb1800d9b78349b24682c3518ac4a3.png~tplv-uwbnlip3yd-webp.webp\"\n      content=\"Comment body content.\"\n      datetime=\"1 hour\"\n    >\n      <template #actions>\n        <span class=\"action\"> <IconMessage /> Reply <\/span>\n      <\/template>\n      <a-comment\n        author=\"Austen\"\n        avatar=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/8361eeb82904210b4f55fab888fe8416.png~tplv-uwbnlip3yd-webp.webp\"\n        content=\"Reply content\"\n        datetime=\"1 hour\"\n      >\n        <template #actions>\n          <span class=\"action\"> <IconMessage /> Reply <\/span>\n        <\/template>\n      <\/a-comment>\n      <a-comment\n        author=\"Plato\"\n        avatar=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp\"\n        content=\"Reply content\"\n        datetime=\"1 hour\"\n      >\n        <template #actions>\n          <span class=\"action\"> <IconMessage /> Reply <\/span>\n        <\/template>\n      <\/a-comment>\n    <\/a-comment>\n  <\/a-comment>\n<\/template>\n\n<script>\nimport { IconHeart, IconMessage, IconStar } from '@sdata/web-vue/es/icon';\n\nexport default {\n  components: {\n    IconHeart,\n    IconMessage,\n    IconStar,\n  },\n};\n<\/script>\n\n<style scoped>\n.action {\n  display: inline-block;\n  padding: 0 4px;\n  color: var(--color-text-1);\n  line-height: 24px;\n  background: transparent;\n  border-radius: 2px;\n  cursor: pointer;\n  transition: all 0.1s ease;\n}\n.action:hover {\n  background: var(--color-fill-3);\n}\n<\/style>";
const nestTitle = "Nest.Md";
const nestDescription = "评论可以嵌套使用";
</script>

## 示例

<DemoBlock :title="alignTitle" :description="alignDescription" :code="alignSource"

>   <alignDemo />
> </DemoBlock>

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="editorTitle" :description="editorDescription" :code="editorSource"

>   <editorDemo />
> </DemoBlock>

<DemoBlock :title="nestTitle" :description="nestDescription" :code="nestSource"

>   <nestDemo />
> </DemoBlock>
