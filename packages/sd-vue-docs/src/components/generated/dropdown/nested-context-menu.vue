<template>
  <sd-dropdown trigger="contextMenu" alignPoint position="bl" class="sd:block">
    <div class="dropdown-nested-context-menu">
      <div class="dropdown-nested-context-menu-hint">右键空白区域打开外层菜单</div>
      <sd-dropdown trigger="contextMenu" alignPoint position="bl">
        <div class="dropdown-nested-context-menu-node" @contextmenu.stop>
          <span class="dropdown-nested-context-menu-icon">File</span>
          README.md
        </div>
        <template #content>
          <sd-doption value="rename">重命名</sd-doption>
          <sd-doption value="delete">删除</sd-doption>
        </template>
      </sd-dropdown>
    </div>
    <template #content>
      <sd-doption value="new-file">新建文件</sd-doption>
      <sd-doption value="new-dir">新建目录</sd-doption>
      <sd-doption value="upload">上传</sd-doption>
    </template>
  </sd-dropdown>
</template>

<style scoped>
  .dropdown-nested-context-menu {
    height: 420px;
    padding: 12px;
    color: var(--color-text-2);
    background-color: var(--color-fill-2);
  }

  .dropdown-nested-context-menu-hint {
    margin-bottom: 12px;
    font-size: 13px;
  }

  .dropdown-nested-context-menu-node {
    display: inline-flex;
    align-items: center;
    min-width: 160px;
    height: 28px;
    padding: 0 8px;
    color: var(--color-text-1);
    cursor: default;
    border-radius: 4px;
  }

  .dropdown-nested-context-menu-node:hover {
    background-color: var(--color-fill-3);
  }

  .dropdown-nested-context-menu-icon {
    margin-right: 6px;
    font-size: 12px;
    color: var(--color-text-3);
  }
</style>
