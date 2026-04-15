import zhCN from '../lang/zh-cn';

const languageModules = import.meta.glob('../lang/*.ts');

function hasEqualStructure(obj1: Record<string, unknown>, obj2: Record<string, unknown>) {
  return Object.keys(obj1).every((key) => {
    const v = obj1[key];

    if (typeof v === 'object' && v !== null) {
      if (!obj2[key]) {
        return false;
      }

      return hasEqualStructure(v, obj2[key]);
    }

    return obj2.hasOwnProperty(key);
  });
}

export default function toMatchStructure(actual, expected) {
  const pass = hasEqualStructure(actual, expected);

  return {
    message: () => `expected ${expected} to match structure ${actual}`,
    pass,
  };
}

expect.extend({
  toMatchStructure,
});

describe('Locale', () => {
  test('should have same object', async () => {
    const languages = Object.entries(languageModules).filter(
      ([filename]) => !filename.endsWith('/zh-cn.ts'),
    );

    for (const [, loadLanguage] of languages) {
      // oxlint-disable-next-line no-await-in-loop
      const lang = await loadLanguage();
      expect(lang.default).toMatchStructure(zhCN);
    }
  });
});
