<script setup lang="ts">
  defineProps<{
    title: string;
    tag: string;
    tone?: 'brand' | 'success' | 'warning';
  }>();
</script>

<template>
  <article class="showcase-card" :data-tone="tone ?? 'brand'">
    <header class="showcase-card__header">
      <div>
        <h3>{{ title }}</h3>
      </div>
      <sd-tag size="small">{{ tag }}</sd-tag>
    </header>
    <div class="showcase-card__body">
      <slot />
    </div>
  </article>
</template>

<style scoped>
  .showcase-card {
    display: grid;
    grid-template-rows: min-content;
    gap: 1rem;
    width: min(20rem, 100%);
    min-width: 320px;
    min-height: 22rem;
    padding: 1.1rem;
    background: color-mix(in srgb, var(--sl-color-bg) 78%, transparent);
    border: 1px solid rgb(20 118 255 / 12%);
    border-radius: 1.5rem;
    box-shadow: 0 14px 34px rgb(15 23 42 / 6%);
  }

  .showcase-card[data-tone='success'] {
    border-color: rgb(53 208 127 / 18%);
  }

  .showcase-card[data-tone='warning'] {
    border-color: rgb(255 184 0 / 20%);
  }

  .showcase-card__header {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    justify-content: space-between;
    height: fit-content;
  }

  .showcase-card__header h3 {
    margin: 0;
    font-size: 1.1rem;
    line-height: 1.3;
  }

  .showcase-card__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    min-height: 0;
  }

  :root[data-theme='dark'] .showcase-card {
    background: rgb(255 255 255 / 3%);
    border-color: rgb(255 255 255 / 10%);
    box-shadow: 0 18px 44px rgb(0 0 0 / 24%);
  }

  @media (width <= 640px) {
    .showcase-card {
      width: 100%;
      min-height: 20rem;
    }
  }
</style>
