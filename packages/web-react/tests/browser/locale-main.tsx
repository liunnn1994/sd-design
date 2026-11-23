import { StrictMode, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { Button } from '../../src/button';
import { ConfigProvider } from '../../src/config-provider';
import { Empty } from '../../src/empty';
import { addI18nMessages, useI18n, useLocale } from '../../src/locale';
import enUS from '../../src/locale/lang/en-us';
import zhCN from '../../src/locale/lang/zh-cn';
import '../../styles/button.scss';
import '../../styles/config-provider.scss';
import '../../styles/empty.scss';

addI18nMessages({ [enUS.locale]: enUS });

const legacyZhCN = { ...zhCN, readonlyTip: undefined };

function ReadonlyTip() {
  const { t } = useI18n();
  return <output data-testid="localized-readonly-tip">{t('readonlyTip')}</output>;
}

function Fixture() {
  const [english, setEnglish] = useState(false);
  return (
    <>
      <Button onClick={() => setEnglish(!english)}>切换局部语言</Button>
      <Button onClick={() => useLocale('en-US')}>切换全局英文</Button>
      <Button
        onClick={() =>
          addI18nMessages(
            {
              'zh-CN': { ...zhCN, empty: { description: '字典已更新' }, readonlyTip: '新只读提示' },
            },
            { overwrite: true },
          )
        }
      >
        更新默认语言字典
      </Button>
      <section data-testid="global-empty">
        <Empty />
      </section>
      <section data-testid="localized-empty">
        <ConfigProvider locale={english ? enUS : legacyZhCN}>
          <Empty />
          <ReadonlyTip />
        </ConfigProvider>
      </section>
    </>
  );
}

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Fixture />
    </StrictMode>,
  ),
);
