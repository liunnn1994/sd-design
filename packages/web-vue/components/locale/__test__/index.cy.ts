import zhCN from '../lang/zh-cn';

const languageModules = import.meta.glob<{ default: typeof zhCN }>([
  '../lang/*.ts',
  '!../lang/kv-list.ts',
]);

function hasEqualStructure(obj1: Record<string, unknown>, obj2: Record<string, unknown>): boolean {
  return Object.keys(obj1).every((key) => {
    const v = obj1[key];

    if (typeof v === 'object' && v !== null) {
      if (!obj2[key]) {
        return false;
      }
      return hasEqualStructure(v as Record<string, unknown>, obj2[key] as Record<string, unknown>);
    }

    return Object.prototype.hasOwnProperty.call(obj2, key);
  });
}

describe('Locale', () => {
  it('all language files match the zh-cn structure', () => {
    cy.then(async () => {
      const languages = Object.entries(languageModules).filter(
        ([filename]) => !filename.endsWith('/zh-cn.ts'),
      );
      for (const [, loadLanguage] of languages) {
        // oxlint-disable-next-line no-await-in-loop
        const lang = await loadLanguage();
        expect(
          hasEqualStructure(
            lang.default as unknown as Record<string, unknown>,
            zhCN as unknown as Record<string, unknown>,
          ),
        ).to.equal(true);
      }
    });
  });
});
