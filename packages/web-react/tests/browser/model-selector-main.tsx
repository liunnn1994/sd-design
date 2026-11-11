import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ConfigProvider } from '../../src/config-provider/index.js';
import enUS from '../../src/locale/lang/en-us.js';
import { ModelSelectorContent, ModelSelectorDialog } from '../../src/model-selector/content.js';
import { ModelSelectorGroup } from '../../src/model-selector/group.js';
import { ModelSelectorInput } from '../../src/model-selector/input.js';
import { ModelSelectorItem } from '../../src/model-selector/item.js';
import { modelSelectorLogoSources } from '../../src/model-selector/logo-sources.js';
import { ModelSelectorLogo } from '../../src/model-selector/logo.js';
import { ModelSelector } from '../../src/model-selector/model-selector.js';
import { ModelSelectorTrigger } from '../../src/model-selector/trigger.js';
import {
  ModelSelectorEmpty,
  ModelSelectorList,
  ModelSelectorName,
  ModelSelectorShortcut,
  ModelSelectorSeparator,
} from '../../src/model-selector/views.js';
import '../../styles/model-selector.scss';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const [events, setEvents] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);
  const [attached, setAttached] = useState(false);
  const [english, setEnglish] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [name, setName] = useState('Gamma');
  const [removed, setRemoved] = useState(false);
  const [input, setInput] = useState('');
  const [disabled, setDisabled] = useState(query.has('disabled'));
  const [mounted, setMounted] = useState(true);
  const record = (event: string) => setEvents((old) => [...old, event]);
  if (query.has('logos'))
    return (
      <>
        {[...Object.keys(modelSelectorLogoSources), 'unknown-provider', 'constructor'].map(
          (provider) => (
            <ModelSelectorLogo key={provider} provider={provider} data-provider={provider} />
          ),
        )}
      </>
    );
  const shared = {
    ...(attached
      ? { visible: true }
      : query.has('controlled')
        ? { visible }
        : query.has('undefined')
          ? { visible: undefined }
          : {}),
    defaultVisible: query.has('inline') || query.has('dialog') || query.has('undefined'),
    defaultExpanded: !query.has('collapsed'),
    closeOnSelect: !query.has('keep'),
    resetQueryOnClose: !query.has('preserve'),
    onUpdateVisible: (next: boolean) => record(`update:${next}`),
    onVisibleChange: (next: boolean) => {
      record(`visible:${next}`);
      if (!query.has('frozen')) setVisible(next);
    },
    onSelect: (value: string, event: Event) => record(`root:${value}:${event.type}`),
  };
  const content = (
    <>
      <ModelSelectorInput
        placeholder="Search models"
        value={query.has('input-controlled') ? input : undefined}
        onValueChange={(next) => {
          record(`input:${next}`);
          setInput(next);
        }}
        inputAttrs={{ 'aria-label': 'Models', 'onKeyDown': () => record('native-key') }}
      />
      <ModelSelectorList>
        <ModelSelectorEmpty />
        <ModelSelectorSeparator />
        <ModelSelectorGroup heading={query.has('no-heading') ? undefined : 'First group'}>
          {(reverse ? ['Beta', 'Alpha'] : ['Alpha', 'Beta'])
            .filter((item) => !removed || item !== 'Alpha')
            .map((label) => (
              <ModelSelectorItem
                key={label}
                value={label.toLowerCase()}
                label={label}
                keywords={label === 'Alpha' ? ['reasoning'] : []}
                disabled={label === 'Beta' && disabled}
                selected={label === 'Alpha'}
                shortcut={
                  query.has('ime')
                    ? label === 'Alpha'
                      ? 'Enter'
                      : undefined
                    : query.has('chord')
                      ? label === 'Alpha'
                        ? 'a+b'
                        : 'Ctrl+-'
                      : label === 'Alpha'
                        ? 'Alt+Shift+1'
                        : undefined
                }
                onSelect={(value, event) => record(`item:${value}:${event.type}`)}
              >
                {({ active, selected }) => (
                  <>
                    <ModelSelectorName>{label}</ModelSelectorName>
                    {query.has('scoped') && (
                      <span data-testid={`scope-${label}`}>{`${active}:${selected}`}</span>
                    )}
                  </>
                )}
              </ModelSelectorItem>
            ))}
        </ModelSelectorGroup>
        <ModelSelectorGroup heading="Second group">
          <ModelSelectorItem
            value="third"
            label={query.has('rendered') ? undefined : name}
            shortcut="Alt+Shift+3"
            onSelect={(value) => record(`item:${value}`)}
          >
            <ModelSelectorName>{name}</ModelSelectorName>
            <ModelSelectorShortcut>Alt+Shift+3</ModelSelectorShortcut>
          </ModelSelectorItem>
        </ModelSelectorGroup>
      </ModelSelectorList>
    </>
  );
  return (
    <ConfigProvider locale={english ? enUS : undefined}>
      <button onClick={() => setAttached(true)}>Attach control</button>
      <button onClick={() => setEnglish(!english)}>Language</button>
      <button onClick={() => setReverse(!reverse)}>Reorder</button>
      <button onClick={() => setName('Delta')}>Rename</button>
      <button onClick={() => setRemoved(true)}>Remove Alpha</button>
      <button onClick={() => setDisabled(!disabled)}>Disable Beta</button>
      <button onClick={() => setInput('Beta')}>Set query</button>
      <button onClick={() => setMounted(false)}>Unmount</button>
      <output data-testid="events">{events.join('|')}</output>
      {mounted && (
        <div onKeyDown={() => record('parent-key')}>
          {query.has('dialog') ? (
            <ModelSelectorDialog
              {...shared}
              renderToBody={!query.has('local')}
              unmountOnClose={false}
            >
              {content}
            </ModelSelectorDialog>
          ) : (
            <ModelSelector {...shared}>
              {(scope) => (
                <>
                  <output data-testid="visible">{String(scope.visible)}</output>
                  <ModelSelectorTrigger disabled={query.has('trigger-disabled')}>
                    {query.has('custom-trigger') ? (
                      <>
                        <button
                          className="custom-trigger"
                          style={{ color: 'rgb(100, 50, 20)' }}
                          onClick={() => record('child-click')}
                        >
                          Choose models
                        </button>
                        <span data-testid="sibling">Sibling</span>
                      </>
                    ) : (
                      'Choose models'
                    )}
                  </ModelSelectorTrigger>
                  {query.has('inline') ? (
                    content
                  ) : (
                    <ModelSelectorContent
                      className="custom-content"
                      width={query.has('width') ? 480 : 640}
                      renderToBody={!query.has('local')}
                      unmountOnClose={!query.has('persist-content')}
                    >
                      {content}
                    </ModelSelectorContent>
                  )}
                </>
              )}
            </ModelSelector>
          )}
        </div>
      )}
    </ConfigProvider>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
