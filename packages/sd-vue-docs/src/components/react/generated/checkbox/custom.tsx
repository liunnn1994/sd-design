/** @jsxImportSource react */
import { Checkbox, CheckboxGroup, Space, Tag, TypographyText } from '@sdata/web-react';
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
      <CheckboxGroup data-v-16602625="" defaultValue={['1']}>
        <Checkbox
          data-v-16602625=""
          value={'1'}
          renderCheckbox={({ checked }) => (
            <>
              <Tag data-v-16602625="" checked={checked} checkable={true}>
                {'多选标签 1'}
              </Tag>
            </>
          )}
        />
        <Checkbox
          data-v-16602625=""
          value={'2'}
          renderCheckbox={({ checked }) => (
            <>
              <Tag data-v-16602625="" checked={checked} checkable={true}>
                {'多选标签 2'}
              </Tag>
            </>
          )}
        />
        <Checkbox
          data-v-16602625=""
          value={'3'}
          renderCheckbox={({ checked }) => (
            <>
              <Tag data-v-16602625="" checked={checked} checkable={true}>
                {'多选标签 3'}
              </Tag>
            </>
          )}
        />
      </CheckboxGroup>
      <div data-v-16602625="" className={'sd:mt-5'}>
        <CheckboxGroup data-v-16602625="" defaultValue={[1]}>
          {Array.from({ length: 2 }, (_, index) => index + 1).map((item) => (
            <>
              <Checkbox
                data-v-16602625=""
                value={item}
                renderCheckbox={({ checked }) => (
                  <>
                    <Space
                      data-v-16602625=""
                      align={'start'}
                      className={classNames({ 'custom-checkbox-card-checked': checked })}
                    >
                      <div data-v-16602625="" className={'custom-checkbox-card-mask'}>
                        <div data-v-16602625="" className={'custom-checkbox-card-mask-dot'} />
                      </div>
                      <div data-v-16602625="">
                        <div data-v-16602625="" className={'custom-checkbox-card-title'}>
                          {' 卡片多选框 '}
                          {formatValue(item)}
                        </div>
                        <TypographyText data-v-16602625="" type={'secondary'}>
                          {' 这是一段文本 '}
                        </TypographyText>
                      </div>
                    </Space>
                  </>
                )}
              />
            </>
          ))}
        </CheckboxGroup>
      </div>
      <style>
        {
          '\n.custom-checkbox-card[data-v-16602625] {\n    box-sizing: border-box;\n    width: 250px;\n    padding: 10px 16px;\n    border: 1px solid var(--sd-color-border-2);\n    border-radius: 4px;\n}\n.custom-checkbox-card-mask[data-v-16602625] {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    box-sizing: border-box;\n    width: 14px;\n    height: 14px;\n    border: 1px solid var(--sd-color-border-2);\n    border-radius: 2px;\n}\n.custom-checkbox-card-mask-dot[data-v-16602625] {\n    width: 8px;\n    height: 8px;\n    border-radius: 2px;\n}\n.custom-checkbox-card-title[data-v-16602625] {\n    margin-bottom: 8px;\n    color: var(--sd-color-text-1);\n    font-weight: bold;\n    font-size: 14px;\n}\n.custom-checkbox-card[data-v-16602625]:hover,\n  .custom-checkbox-card-checked[data-v-16602625],\n  .custom-checkbox-card:hover .custom-checkbox-card-mask[data-v-16602625],\n  .custom-checkbox-card-checked .custom-checkbox-card-mask[data-v-16602625] {\n    border-color: rgb(var(--sd-primary-6));\n}\n.custom-checkbox-card-checked[data-v-16602625] {\n    background-color: var(--sd-color-primary-light-1);\n}\n.custom-checkbox-card:hover .custom-checkbox-card-title[data-v-16602625],\n  .custom-checkbox-card-checked .custom-checkbox-card-title[data-v-16602625] {\n    color: rgb(var(--sd-primary-6));\n}\n.custom-checkbox-card-checked .custom-checkbox-card-mask-dot[data-v-16602625] {\n    background-color: rgb(var(--sd-primary-6));\n}\n'
        }
      </style>
    </>
  );
}
