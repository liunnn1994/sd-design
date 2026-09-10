export interface SecretProps {
  /**
   * @zh 原始敏感文本
   * @en Original secret text
   */
  text: string;
  /**
   * @zh 隐藏状态下展示的占位内容
   * @en Placeholder content shown while hidden
   */
  hiddenText?: string;
  /**
   * @zh 是否展示复制按钮
   * @en Whether to show the copy button
   */
  showCopy?: boolean;
  /**
   * @zh 是否显示敏感文本
   * @en Whether the secret text is visible
   */
  visible?: boolean;
}
