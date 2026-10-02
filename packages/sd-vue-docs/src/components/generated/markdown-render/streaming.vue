<template>
  <Space direction="vertical" size="medium" fill>
    <Space wrap>
      <Button :disabled="final" @click="advance">追加内容</Button>
      <Button @click="reset">重置</Button>
      <Tag :color="final ? 'green' : 'blue'"
        >{{ step }}/{{ chunks.length }} · {{ final ? '传输完成' : '传输中' }}</Tag
      >
    </Space>
    <MarkdownRender :content="content" :final="final" />
  </Space>
</template>
<script setup lang="ts">
  import { ref } from 'vue';

  import { Button, MarkdownRender, Space, Tag } from '@sdata/web-vue';
  const initial = '## 临江仙·滚滚长江东逝水\n\n明·杨慎\n\n**滚滚长江';
  // 故意在加粗标记、列表项和代码围栏内部拆分批次，展示未完成节点的更新。
  const chunks = [
    '东逝水**，浪花淘尽英雄。  \n是非成败转头空。青山依旧在，几度夕阳红。\n\n',
    '白发渔樵江渚上，惯看秋月春风。  \n一壶浊酒喜相逢。古今多少事，都付笑谈中。\n\n> **青山依旧在**，*几度夕阳红*。\n\n### 阅读札记\n\n- **长江**：',
    '时间流逝的意象\n- *青山*：世事变迁中的恒常\n- `渔樵`：回望历史的视角\n\n- [x] 读完上阕\n- [ ] 整理下阕笔记\n\n',
    '| 意象 | 诗句 |\n| :--- | :--- |\n| 长江 | 滚滚长江东逝水 |\n| 青山 | 青山依旧在 |\n| 浊酒 | 一壶浊酒喜相逢 |\n\n### 诗词数据\n\n```typescript\nconst poem = {\n  title: "临江仙·滚滚长江东逝水",\n',
    '  author: "杨慎",\n  dynasty: "明",\n}\n```\n\n',
    '“古今多少事，都付笑谈中。”[^note]\n\n[^note]: 本例以诗词为中文排版内容，最后一批完成后设置 `final=true`。\n\n:::tip 传输完成\n诗词、引用、列表、表格、代码和脚注均已追加完成。\n:::',
  ];
  const content = ref(initial);
  const step = ref(0);
  const final = ref(false);
  function advance() {
    if (final.value) return;
    content.value += chunks[step.value];
    step.value += 1;
    final.value = step.value === chunks.length;
  }
  function reset() {
    content.value = initial;
    step.value = 0;
    final.value = false;
  }
</script>
