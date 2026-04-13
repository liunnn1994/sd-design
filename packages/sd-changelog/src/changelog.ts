import { marked, Tokens } from 'marked';
import { invertKeyValues } from './utils/invert';
import { ChangelogData } from './interface';

export const getChangelogList = (
  content: string,
  config: {
    pr: any;
    typeDict: Record<string, string>;
    keyDict: Record<string, string>;
  }
) => {
  const _content = content.replace(/\r\n/g, '\n');
  const _typeDict = invertKeyValues(config.typeDict);
  const _keyDict = invertKeyValues(config.keyDict);

  const typeRule = new RegExp(
    '##\\s*Types? of changes.+?\\[\\s*[xX]\\s*]\\s*(.+?)(?:\\n|$)',
    'si'
  );
  const typeMatch = _content.match(typeRule)?.[1].trim();
  const defaultType = typeMatch && _typeDict[typeMatch];

  const rule = new RegExp('##\\s*Changelog\\n(.+?)(?:##|$)', 'si');
  const match = _content.match(rule)?.[1];
  if (!match) return undefined;
  const tokens = marked.lexer(match);
  const table = tokens.find(
    (token): token is Tokens.Table => token.type === 'table'
  );
  if (!table) return undefined;

  const keys = table.header.map((header) => {
    return _keyDict[header.text];
  });

  return table.rows.reduce((list, row) => {
    const data = row.reduce(
      (item, cell, index) => {
        const key = keys[index];
        const value = cell.text;

        if (!key) {
          return item;
        }

        if (key === 'type') {
          item[key] = _typeDict[value];
        } else if (key === 'issues') {
          item[key] = value
            .split(',')
            .map((item) => item.match(/#\d+/)?.[0])
            .filter((item) => Boolean(item)) as string[];
        } else {
          item[key] = value;
        }

        return item;
      },
      {
        type: defaultType ?? '',
        pr: config.pr,
      } as ChangelogData
    );

    list.push(data);
    return list;
  }, [] as ChangelogData[]);
};
