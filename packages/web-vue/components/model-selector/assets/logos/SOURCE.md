# Model provider logos

这些 SVG 来自 [models.dev](https://github.com/anomalyco/models.dev) 的 provider logo 服务，并于 2026-07-29 固化到组件包内，运行时不会请求外部资源。

`wandb`、`synthetic`、`requesty`、`morph` 和 `lmstudio` 在上游没有独立的 `providers/<id>/logo.svg`，组件会与上游服务保持一致，使用本目录的 `default.svg`。未知的自定义 provider 也使用同一离线回退资源。
