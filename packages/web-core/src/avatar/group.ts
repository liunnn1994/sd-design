export function createAvatarGroupFoundation(props: { readonly maxCount: number }) {
  function getVisibleAvatars<T>(children: T[]) {
    return props.maxCount > 0 ? children.slice(0, props.maxCount) : children;
  }
  function getOverflowAvatars<T>(children: T[]) {
    return props.maxCount > 0 ? children.slice(props.maxCount) : [];
  }
  return { getVisibleAvatars, getOverflowAvatars };
}
