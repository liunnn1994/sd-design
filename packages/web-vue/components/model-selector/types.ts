import type { LiteralUnion } from 'type-fest';

export const MODEL_SELECTOR_PROVIDERS = [
  'moonshotai-cn',
  'lucidquery',
  'moonshotai',
  'zai-coding-plan',
  'alibaba',
  'xai',
  'vultr',
  'nvidia',
  'upstage',
  'groq',
  'github-copilot',
  'mistral',
  'vercel',
  'nebius',
  'deepseek',
  'alibaba-cn',
  'google-vertex-anthropic',
  'venice',
  'chutes',
  'cortecs',
  'github-models',
  'togetherai',
  'azure',
  'baseten',
  'huggingface',
  'opencode',
  'fastrouter',
  'google',
  'google-vertex',
  'cloudflare-workers-ai',
  'inception',
  'wandb',
  'openai',
  'zhipuai-coding-plan',
  'perplexity',
  'openrouter',
  'zenmux',
  'v0',
  'iflowcn',
  'synthetic',
  'deepinfra',
  'zhipuai',
  'submodel',
  'zai',
  'inference',
  'requesty',
  'morph',
  'lmstudio',
  'anthropic',
  'aihubmix',
  'fireworks-ai',
  'modelscope',
  'llama',
  'scaleway',
  'amazon-bedrock',
  'cerebras',
] as const;

export type ModelSelectorKnownProvider = (typeof MODEL_SELECTOR_PROVIDERS)[number];
export type ModelSelectorProvider = LiteralUnion<ModelSelectorKnownProvider, string>;

export interface ModelSelectorItemData {
  disabled: boolean;
  domId: string;
  element?: HTMLElement;
  groupId?: symbol;
  id: symbol;
  keywords: string[];
  label: string;
  select: (event: Event) => void;
  shortcut?: string;
  value: string;
}
