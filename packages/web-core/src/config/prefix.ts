const COMPONENT_PREFIX = 'Sd';
const CLASS_PREFIX = 'sd';

export const getComponentPrefix = (options?: { componentPrefix?: string | undefined }) => {
  return options?.componentPrefix ?? COMPONENT_PREFIX;
};

export function resolvePrefixCls(
  componentName: string | undefined,
  state: {
    readonly providerPrefix: string | undefined;
    readonly globalPrefix: string | undefined;
    readonly appPrefix: string | undefined;
  },
): string {
  const prefix = state.providerPrefix ?? state.globalPrefix ?? state.appPrefix ?? CLASS_PREFIX;
  if (componentName) {
    return `${prefix}-${componentName}`;
  }
  return prefix;
}

type CssVarToken<T extends string> = T extends `--${infer Rest}`
  ? `--${typeof CLASS_PREFIX}-${Rest}`
  : `--${typeof CLASS_PREFIX}-${T}`;

export const getCssVarToken = <T extends string>(token: T): CssVarToken<T> => {
  const name = (token as string).replace(/^--/, '');
  return `--${CLASS_PREFIX}-${name}` as CssVarToken<T>;
};
