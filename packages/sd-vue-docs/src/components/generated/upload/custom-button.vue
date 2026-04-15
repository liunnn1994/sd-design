<template>
  <sd-upload action="/">
    <template #upload-button>
      <div
        style="
          width: 380px;
          height: 158px;
          color: var(--color-text-1);
          line-height: 158px;
          text-align: center;
          background-color: var(--color-fill-2);
          border: 1px dashed var(--color-fill-4);
          border-radius: 2;
        "
      >
        <div>
          Drag the file here or
          <span style="color: #3370ff"> Click to upload</span>
        </div>
      </div>
    </template>
  </sd-upload>
</template>
