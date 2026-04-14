import path from 'node:path';

const root = process.cwd();

const resolvePath = (...relativePath) => path.resolve(root, ...relativePath);

const components = resolvePath('components');
const icon = resolvePath('icon');
const iconSvgs = resolvePath('icon', '_svgs');
const iconComponents = resolvePath('components', 'icon');

export default {
  root,
  components,
  icon,
  iconSvgs,
  iconComponents,
  resolvePath,
};
