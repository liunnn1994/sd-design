import { toRefs, watchEffect } from 'vue';

interface PopupOverflowHiddenProps {
  container: HTMLElement | undefined;
  hidden: boolean;
}

export default function usePopupOverflowHidden(props: PopupOverflowHiddenProps) {
  const { container, hidden } = toRefs(props);

  let needResetContainerStyle = false;
  let originContainerStyle: Partial<CSSStyleDeclaration> = {};
  // 记录真正被锁定的元素：container 在锁定期间被换掉时，还原要作用在旧的这个元素上，
  // 否则旧的容器会永远留着 overflow: hidden。
  let lockedElement: HTMLElement | undefined;

  const getScrollBarWidth = (element: HTMLElement) => {
    return element.tagName === 'BODY'
      ? window.innerWidth - (document.body.clientWidth || document.documentElement.clientWidth)
      : element.offsetWidth - element.clientWidth;
  };

  const setContainerStyle = () => {
    if (container.value && container.value.style.overflow !== 'hidden') {
      const originStyle = container.value.style;
      needResetContainerStyle = true;
      lockedElement = container.value;

      // Record and set the width
      const containerScrollBarWidth = getScrollBarWidth(container.value);
      if (containerScrollBarWidth) {
        originContainerStyle.width = originStyle.width;
        container.value.style.width = `calc(${
          container.value.style.width || '100%'
        } - ${containerScrollBarWidth}px)`;
      }

      // Record and set overflow
      originContainerStyle.overflow = originStyle.overflow;
      container.value.style.overflow = 'hidden';
    }
  };

  const resetContainerStyle = () => {
    if (lockedElement && needResetContainerStyle) {
      const originStyle = originContainerStyle;
      Object.keys(originStyle).forEach((i) => {
        (lockedElement!.style as unknown as Record<string, string>)[i] =
          (originStyle as unknown as Record<string, string>)[i] ?? '';
      });
    }
    needResetContainerStyle = false;
    originContainerStyle = {};
    lockedElement = undefined;
  };

  watchEffect((onInvalidate) => {
    hidden.value ? setContainerStyle() : resetContainerStyle();

    onInvalidate(() => {
      resetContainerStyle();
    });
  });

  return [resetContainerStyle, setContainerStyle];
}
