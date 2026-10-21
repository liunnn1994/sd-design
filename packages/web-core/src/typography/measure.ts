export function createTypographyTextContainer() {
  const container = document.createElement('div');
  container.setAttribute('aria-hidden', 'true');
  container.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;overflow:hidden;';
  document.body.appendChild(container);
  return container;
}
export function measureTypographyInnerText(
  container: HTMLDivElement,
  render: () => void,
  unmount: () => void,
) {
  try {
    render();
    return container.innerText;
  } finally {
    unmount();
    container.remove();
  }
}
