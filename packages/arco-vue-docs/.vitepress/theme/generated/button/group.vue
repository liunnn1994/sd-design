<template>
  <a-space direction="vertical">
    <a-button-group>
      <a-button>Publish</a-button>
      <a-button>
        <template #icon>
          <icon-down />
        </template>
      </a-button>
    </a-button-group>
    <a-button-group>
      <a-button>Publish</a-button>
      <a-button>
        <template #icon>
          <icon-more />
        </template>
      </a-button>
    </a-button-group>
    <a-button-group>
      <a-button type="primary">
        <icon-left />
        Prev
      </a-button>
      <a-button type="primary">
        Next
        <icon-right />
      </a-button>
    </a-button-group>
    <a-space size="large">
      <a-button-group type="primary">
        <a-button> copy </a-button>
        <a-button> cut </a-button>
        <a-button> find </a-button>
      </a-button-group>
      <a-button-group type="primary" status="warning">
        <a-button> <template #icon><icon-heart-fill /></template> </a-button>
        <a-button> <template #icon><icon-star-fill /></template> </a-button>
        <a-button> <template #icon><icon-thumb-up-fill /></template> </a-button>
      </a-button-group>
      <a-button-group size="small" disabled>
        <a-button> prev </a-button>
        <a-button> next </a-button>
      </a-button-group>
    </a-space>
  </a-space>
</template>
