<template>
  <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
    <label v-for="item in presetDemos" :key="item.name" class="flex min-w-0 flex-col gap-2">
      <span class="flex items-baseline justify-between gap-3">
        <span class="font-medium text-slate-800 dark:text-slate-100">{{ item.label }}</span>
        <code class="text-xs text-slate-500">{{ item.name }}</code>
      </span>
      <sd-input-mask
        :preset="item.name"
        :default-value="item.value"
        :placeholder="item.placeholder"
        :input-attrs="{ 'aria-label': `${item.label}示例` }"
        allow-clear
      />
    </label>
  </div>
</template>

<script setup lang="ts">
  import type { InputMaskPresetName } from '@sdata/web-vue';

  const presetExamples = {
    'date': { label: '日期', value: '2026-08-06', placeholder: 'YYYY-MM-DD' },
    'time': { label: '时间', value: '10:30:45', placeholder: 'HH:MM:SS' },
    'datetime': {
      label: '日期时间',
      value: '2026-08-06 10:30:00',
      placeholder: 'YYYY-MM-DD HH:mm:ss',
    },
    'rfc3339': {
      label: 'RFC 3339 时间',
      value: '2026-08-06T10:30:00+08:00',
      placeholder: 'YYYY-MM-DDTHH:mm:ssZ',
    },
    'ip': { label: 'IP 地址', value: '2001:db8::1', placeholder: 'IPv4 或 IPv6' },
    'ipv4': { label: 'IPv4 地址', value: '192.168.1.1', placeholder: '192.168.1.1' },
    'ipv6': { label: 'IPv6 地址', value: '2001:db8::1', placeholder: '2001:db8::1' },
    'ip-range': { label: 'IP 网段', value: '192.168.1.0/24', placeholder: 'IP/前缀长度' },
    'url': {
      label: 'URL',
      value: 'https://example.com/docs?q=mask#api',
      placeholder: 'https://example.com',
    },
    'email': { label: '邮箱', value: 'name@example.com', placeholder: 'name@example.com' },
    'fqdn': { label: '完整域名', value: 'docs.example.com', placeholder: 'example.com' },
    'semver': {
      label: '语义化版本',
      value: '1.2.3-beta.1+build.7',
      placeholder: '1.2.3',
    },
    'uuid': {
      label: 'UUID',
      value: '550e8400-e29b-41d4-a716-446655440000',
      placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    },
    'mac-address': {
      label: 'MAC 地址',
      value: '01:23:45:67:89:ab',
      placeholder: '01:23:45:67:89:ab',
    },
    'lat-long': {
      label: '经纬度',
      value: '31.2304, 121.4737',
      placeholder: '纬度, 经度',
    },
    'hex-color': { label: '十六进制颜色', value: '#1677ff', placeholder: '#1677ff' },
    'rgb-color': {
      label: 'RGB 颜色',
      value: 'rgb(22, 119, 255)',
      placeholder: 'rgb(r, g, b)',
    },
    'hsl': { label: 'HSL 颜色', value: 'hsl(210, 100%, 50%)', placeholder: 'hsl(h, s, l)' },
    'imei': { label: 'IMEI', value: '12-345678-901234-5', placeholder: '设备识别码' },
    'issn': { label: 'ISSN', value: '1234-567X', placeholder: '1234-567X' },
    'isrc': { label: 'ISRC', value: 'US-AAA-26-12345', placeholder: 'US-AAA-26-12345' },
    'iso6346': { label: '集装箱编号', value: 'MSCU 123456 7', placeholder: 'MSCU 123456 7' },
    'jwt': {
      label: 'JWT',
      value: 'header.payload.signature',
      placeholder: 'header.payload.signature',
    },
    'mime-type': { label: 'MIME 类型', value: 'application/json', placeholder: 'type/subtype' },
    'mailto-uri': {
      label: '邮件 URI',
      value: 'mailto:name@example.com',
      placeholder: 'mailto:name@example.com',
    },
    'data-uri': {
      label: 'Data URI',
      value: 'data:text/plain;base64,SGVsbG8=',
      placeholder: 'data:type,...',
    },
    'magnet-uri': {
      label: 'Magnet URI',
      value: 'magnet:?xt=urn:btih:0123456789abcdef',
      placeholder: 'magnet:?xt=...',
    },
    'iban': {
      label: 'IBAN',
      value: 'GB82 WEST 1234 5698 7654 32',
      placeholder: '国际银行账号',
    },
  } satisfies Record<InputMaskPresetName, { label: string; value: string; placeholder: string }>;

  const presetDemos = Object.entries(presetExamples).map(([name, example]) => ({
    name: name as InputMaskPresetName,
    ...example,
  }));
</script>
