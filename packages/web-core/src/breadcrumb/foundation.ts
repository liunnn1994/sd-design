export interface BreadcrumbContext {
  readonly total: number;
  readonly maxCount: number;
  readonly needHide: boolean;
}
export function getBreadcrumbNeedHide(state: Pick<BreadcrumbContext, 'total' | 'maxCount'>) {
  return state.maxCount > 0 && state.total > state.maxCount + 1;
}
export function getBreadcrumbRouteEntries<Route extends { path: string }>(props: {
  readonly routes?: Route[] | undefined;
  readonly customUrl?: ((paths: string[]) => string) | undefined;
}) {
  if (!props.routes?.length) {
    return [];
  }

  const paths: string[] = [];
  return props.routes.map((route, index, origin) => {
    paths.push((route.path || '').replace(/^\//, ''));
    const currentPaths = [...paths];
    return {
      route,
      index,
      paths: currentPaths,
      last: index === origin.length - 1,
      href: props.customUrl?.(currentPaths) ?? `#/${currentPaths.join('/').replace(/^\//, '')}`,
    };
  });
}
export function createBreadcrumbItemFoundation(
  props: { readonly index: number },
  breadcrumbCtx: BreadcrumbContext | undefined,
) {
  const getShow = () => {
    if (breadcrumbCtx && breadcrumbCtx.needHide) {
      if (props.index > 1 && props.index <= breadcrumbCtx.total - breadcrumbCtx.maxCount) {
        return false;
      }
    }
    return true;
  };
  const getDisplayMore = () => {
    if (breadcrumbCtx && breadcrumbCtx.needHide) {
      return props.index === 1;
    }
    return false;
  };
  const getShowSeparator = () => (breadcrumbCtx ? props.index < breadcrumbCtx.total - 1 : false);
  return { getShow, getDisplayMore, getShowSeparator };
}
