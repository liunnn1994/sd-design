import { modalMethods, useModal } from './imperative.js';
import { ModalView } from './modal.js';
export type * from './types.js';
export { useModal } from './imperative.js';
export const Modal = Object.assign(ModalView, modalMethods, { useModal });
export default Modal;
