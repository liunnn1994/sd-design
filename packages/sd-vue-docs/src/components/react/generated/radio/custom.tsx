/** @jsxImportSource react */
import { Radio, RadioGroup, Space, Tag, TypographyText } from '@sdata/web-react';
function classNames(value: unknown): string {
  return Array.isArray(value)
    ? value.map(classNames).filter(Boolean).join(' ')
    : value && typeof value === 'object'
      ? Object.entries(value)
          .filter(([, active]) => active)
          .map(([name]) => name)
          .join(' ')
      : typeof value === 'string'
        ? value
        : '';
}
function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  return (
    <>
      <RadioGroup data-v-c23eaf92="" defaultValue={'1'}>
        <Radio
          data-v-c23eaf92=""
          value={'1'}
          renderRadio={({ checked }) => (
            <>
              <Tag data-v-c23eaf92="" checked={checked} checkable={true}>
                {'单选标签 1'}
              </Tag>
            </>
          )}
        />
        <Radio
          data-v-c23eaf92=""
          value={'2'}
          renderRadio={({ checked }) => (
            <>
              <Tag data-v-c23eaf92="" checked={checked} checkable={true}>
                {'单选标签 2'}
              </Tag>
            </>
          )}
        />
        <Radio
          data-v-c23eaf92=""
          value={'3'}
          renderRadio={({ checked }) => (
            <>
              <Tag data-v-c23eaf92="" checked={checked} checkable={true}>
                {'单选标签 3'}
              </Tag>
            </>
          )}
        />
      </RadioGroup>
      <div data-v-c23eaf92="" className={'sd:mt-5'}>
        <RadioGroup data-v-c23eaf92="">
          {Array.from({ length: 2 }, (_, index) => index + 1).map((item) => (
            <>
              <Radio
                data-v-c23eaf92=""
                value={item}
                renderRadio={({ checked }) => (
                  <>
                    <Space
                      data-v-c23eaf92=""
                      align={'start'}
                      className={classNames({ 'custom-radio-card-checked': checked })}
                    >
                      <div data-v-c23eaf92="" className={'custom-radio-card-mask'}>
                        <div data-v-c23eaf92="" className={'custom-radio-card-mask-dot'} />
                      </div>
                      <div data-v-c23eaf92="">
                        <div data-v-c23eaf92="" className={'custom-radio-card-title'}>
                          {' 卡片单选框 '}
                          {formatValue(item)}
                        </div>
                        <TypographyText data-v-c23eaf92="" type={'secondary'}>
                          {' 这是一段文本 '}
                        </TypographyText>
                      </div>
                    </Space>
                  </>
                )}
              />
            </>
          ))}
        </RadioGroup>
      </div>
      <style>
        {
          '\n.custom-radio-card[data-v-c23eaf92] {\n    box-sizing: border-box;\n    width: 250px;\n    padding: 10px 16px;\n    border: 1px solid var(--sd-color-border-2);\n    border-radius: 4px;\n}\n.custom-radio-card-mask[data-v-c23eaf92] {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    box-sizing: border-box;\n    width: 14px;\n    height: 14px;\n    border: 1px solid var(--sd-color-border-2);\n    border-radius: 100%;\n}\n.custom-radio-card-mask-dot[data-v-c23eaf92] {\n    width: 8px;\n    height: 8px;\n    border-radius: 100%;\n}\n.custom-radio-card-title[data-v-c23eaf92] {\n    margin-bottom: 8px;\n    color: var(--sd-color-text-1);\n    font-weight: bold;\n    font-size: 14px;\n}\n.custom-radio-card[data-v-c23eaf92]:hover,\n  .custom-radio-card-checked[data-v-c23eaf92],\n  .custom-radio-card:hover .custom-radio-card-mask[data-v-c23eaf92],\n  .custom-radio-card-checked .custom-radio-card-mask[data-v-c23eaf92] {\n    border-color: rgb(var(--sd-primary-6));\n}\n.custom-radio-card-checked[data-v-c23eaf92] {\n    background-color: var(--sd-color-primary-light-1);\n}\n.custom-radio-card:hover .custom-radio-card-title[data-v-c23eaf92],\n  .custom-radio-card-checked .custom-radio-card-title[data-v-c23eaf92] {\n    color: rgb(var(--sd-primary-6));\n}\n.custom-radio-card-checked .custom-radio-card-mask-dot[data-v-c23eaf92] {\n    background-color: rgb(var(--sd-primary-6));\n}\n'
        }
      </style>
    </>
  );
}
