<template>
  <a-space direction="vertical" size="large">
    <a-input-search
      :style="{ width: '320px' }"
      placeholder="Please enter something"
      button-text="Search"
      search-button
    />
    <a-input-search :style="{ width: '320px' }" placeholder="Please enter something" search-button>
      <template #button-icon>
        <icon-search />
      </template>
      <template #button-default> Search </template>
    </a-input-search>
  </a-space>
</template>
