export function observeNumberFlowMotion(
  query: MediaQueryList | undefined,
  update: (matches: boolean) => void,
) {
  const onChange = ({ matches }: MediaQueryListEvent) => update(matches);
  if (query) update(query.matches);
  query?.addEventListener('change', onChange);
  return () => {
    query?.removeEventListener('change', onChange);
  };
}
