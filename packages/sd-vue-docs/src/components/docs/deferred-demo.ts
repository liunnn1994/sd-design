for (const block of document.querySelectorAll<HTMLElement>('.demo-block[data-deferred]')) {
  const template = block.querySelector<HTMLTemplateElement>('.demo-block__deferred-island');
  const mount = block.querySelector<HTMLElement>('.demo-block__preview-content');
  if (!template || !mount) continue;

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      void customElements.whenDefined('astro-island').then(() => {
        mount.appendChild(template.content);
        block.removeAttribute('data-deferred');
        block.setAttribute('data-loaded', '');
      });
    },
    { rootMargin: '300px 0px' },
  );
  observer.observe(block);
}
