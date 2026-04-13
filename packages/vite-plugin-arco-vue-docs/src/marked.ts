import { marked, Tokens } from 'marked';
import yaml from 'js-yaml';
import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/index';
import { parse } from '@vue/compiler-sfc';
import path from 'path';
import { FileImportToken, I18nDescriptionToken } from './interface';

const languages = ['shell', 'js', 'ts', 'jsx', 'tsx', 'less', 'diff'];
loadLanguages(languages);

function cleanHref(href: string) {
  try {
    return encodeURI(href).replace(/%25/g, '%');
  } catch {
    return null;
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function highlightCode(code: string, lang?: string) {
  if (lang === 'vue') {
    const { descriptor } = parse(code);
    const { script, styles } = descriptor;

    let htmlContent = code;
    const hasStyle = Boolean(styles.length > 0);
    if (script?.content) {
      htmlContent = htmlContent.replace(script.content, '$script$');
    }
    if (hasStyle) {
      styles.forEach((style, index) => {
        htmlContent = htmlContent.replace(style.content, `$style-${index}$`);
      });
    }

    let highlighted = Prism.highlight(
      htmlContent,
      Prism.languages.html,
      'html'
    );
    if (script?.content) {
      const scriptLang = script.lang ?? 'js';
      const highlightedScript = Prism.highlight(
        script.content,
        Prism.languages[scriptLang],
        scriptLang
      );
      highlighted = highlighted.replace('$script$', highlightedScript);
    }
    if (hasStyle) {
      styles.forEach((style, index) => {
        const styleLang = style.lang ?? 'css';
        const highlightedStyle = Prism.highlight(
          style.content,
          Prism.languages[styleLang],
          styleLang
        );
        highlighted = highlighted.replace(
          `$style-${index}$`,
          highlightedStyle
        );
      });
    }

    return highlighted;
  }

  if (lang && languages.includes(lang)) {
    return Prism.highlight(code, Prism.languages[lang], lang);
  }

  return escapeHtml(code);
}

const frontMatter = {
  name: 'frontMatter',
  level: 'block',
  tokenizer(src: string) {
    const rule = /^```yaml\n+(.+?)\n+```(?:\n|$)/s;
    const match = rule.exec(src);
    if (match) {
      const text = match[1].trim();
      const attributes = yaml.load(text);

      return {
        type: 'frontMatter',
        raw: match[0],
        text,
        attributes,
      };
    }
    return undefined;
  },
  renderer() {
    // frontMatter不返回内用
    return '';
  },
};

const fileImport = {
  name: 'fileImport',
  level: 'block',
  tokenizer(src: string) {
    const rule = /^@import\s+(.+)(?:\n|$)/;
    const match = rule.exec(src);
    if (match) {
      const filename = match[1].trim();
      const basename = path.basename(filename, '.md');

      return {
        type: 'fileImport',
        raw: match[0],
        filename,
        basename,
      };
    }
    return undefined;
  },
  renderer(token: FileImportToken) {
    return `<demo-${token.basename} />\n`;
  },
};

const i18nDescription = {
  name: 'i18nDescription',
  level: 'block',
  tokenizer(src: string) {
    const rule = /^##\s+(zh-CN|en-US)\n+(.+?)\n+---(?:\n|$)/s;
    const match = rule.exec(src);

    if (match) {
      const text = match[2].trim();
      const content = marked.parse(text) as string;
      return {
        type: 'i18nDescription',
        raw: match[0],
        text,
        locale: match[1],
        content,
      };
    }
    return undefined;
  },
  renderer(token: I18nDescriptionToken) {
    return token.content;
  },
};

marked.use({
  breaks: true,
  renderer: {
    heading(this: any, token: Tokens.Heading) {
      const content = this.parser.parseInline(token.tokens);
      if (token.depth === 2) {
        const anchor = token.text.replace(/\s+/g, '-');
        return `<anchor-head level="${token.depth}" href="${escapeHtml(
          anchor
        )}">${content}</anchor-head>`;
      }
      return `<h${token.depth} id="${escapeHtml(token.text)}">${content}</h${token.depth}>`;
    },
    link(this: any, token: Tokens.Link) {
      const href = cleanHref(token.href);
      if (href === null) {
        return token.text;
      }
      const text = this.parser.parseInline(token.tokens);
      let out = `<a class="link" href="${escapeHtml(href)}"`;
      let title = token.title ?? undefined;
      if (title) {
        if (/_blank/.test(title)) {
          out += ` target="_blank"`;
          title = title.replace('_blank', '').trim();
          if (title) {
            out += ` title="${title}"`;
          }
        } else {
          out += ` title="${title}"`;
        }
      }
      out += `>${text}</a>`;
      return out;
    },
    image(token: Tokens.Image) {
      const href = cleanHref(token.href);
      if (href === null) {
        return token.text;
      }

      let out = `<img src="${escapeHtml(href)}" alt="${escapeHtml(
        token.text ?? ''
      )}"`;

      if (token.title) {
        out += ` title="${escapeHtml(token.title)}"`;
      }

      out += '>';
      return out;
    },
    code(token: Tokens.Code) {
      const lang = token.lang?.match(/\S*/)?.[0];
      let code = highlightCode(token.text, lang);
      code = code.replace(/{{|}}/g, (value) => {
        if (value === '{{') {
          return '&#123;&#123;';
        }
        return '&#125;&#125;';
      });
      code = `${code.replace(/\n$/, '')}\n`;

      if (!lang) {
        return `<pre class="code-content"><code>${code}</code></pre>\n`;
      }

      return `<pre class="code-content"><code class="language-${lang}">${code}</code></pre>\n`;
    },
    table(this: any, token: Tokens.Table) {
      const header = token.header
        .map((cell) => `<a-th>${this.parser.parseInline(cell.tokens)}</a-th>`)
        .join('');
      const body = token.rows
        .map((row) => {
          const cells = row
            .map((cell) => `<a-td>${this.parser.parseInline(cell.tokens)}</a-td>`)
            .join('');
          return `<a-tr>${cells}</a-tr>`;
        })
        .join('');

      return `<a-table class="component-api-table">
  <colgroup>
    <col style="min-width: 120px"/>
  </colgroup>
  <a-thead><a-tr>${header}</a-tr></a-thead><a-tbody>${body}</a-tbody>
</a-table>`;
    },
    tablerow(token: Tokens.TableRow<string>): string {
      return `<a-tr>${token.text}</a-tr>`;
    },
    tablecell(this: any, token: Tokens.TableCell): string {
      const content = this.parser.parseInline(token.tokens);
      if (token.header) {
        return `<a-th>${content}</a-th>`;
      }
      return `<a-td>${content}</a-td>`;
    },
  },
  // @ts-ignore @types/marked版本过低导致
  extensions: [i18nDescription, fileImport, frontMatter],
});

export default marked;
