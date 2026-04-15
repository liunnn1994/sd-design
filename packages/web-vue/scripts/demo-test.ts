import { mount } from '@vue/test-utils';

import { globSync } from 'glob';
import { fileURLToPath } from 'node:url';
import path from 'path';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const demoModules = import.meta.glob('../components/**/__demo__/*.md');

function demoTest(component: string) {
  describe(`<${component}> demo:`, () => {
    const files = globSync(`components/${component}/__demo__/*.md`, {
      cwd: packageRoot,
      posix: true,
    });
    const table = files.map((filename) => [path.basename(filename, '.md'), filename]);

    test.each(table)('render [%s] correctly', async (_, filename) => {
      const loadDemo = demoModules[`../${filename}`];
      if (!loadDemo) {
        throw new Error(`Demo module not found: ${filename}`);
      }

      const demo = await loadDemo();
      const wrapper = mount(demo.default);
      expect(wrapper.html()).toMatchSnapshot();
    });
  });
}

export default demoTest;
