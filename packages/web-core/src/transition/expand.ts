const toHTMLElement = (element: Element) => element as HTMLElement;

export const onBeforeEnter = (el: Element) => {
  const element = toHTMLElement(el);
  element.style.height = '0';
};
export const onEnter = (el: Element) => {
  const element = toHTMLElement(el);
  element.style.height = `${element.scrollHeight}px`;
};
export const onAfterEnter = (el: Element) => {
  const element = toHTMLElement(el);
  element.style.height = '';
};
export const onBeforeLeave = (el: Element) => {
  const element = toHTMLElement(el);
  element.style.height = `${element.scrollHeight}px`;
};
export const onLeave = (el: Element) => {
  const element = toHTMLElement(el);
  element.style.height = `0`;
};
export const onAfterLeave = (el: Element) => {
  const element = toHTMLElement(el);
  element.style.height = ``;
};
