import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VENDOR_DIR = path.join(__dirname, '../vendor');

const submodules = [
  {
    name: 'element-plus',
    url: 'https://github.com/element-plus/element-plus.git',
  },
  { name: 'naive-ui', url: 'https://github.com/tusen-ai/naive-ui.git' },
  {
    name: 'tdesign-vue-next',
    url: 'https://github.com/Tencent/tdesign-vue-next.git',
  },
  {
    name: 'intelligent-monitoring',
    url: 'git@git.s-data.cn:monitor/sdata-monitor/intelligent-monitoring.git',
  },
  { name: 'vuetify', url: 'https://github.com/vuetifyjs/vuetify.git' },
  { name: 'ant-design', url: 'https://github.com/ant-design/ant-design.git' },
];

if (!fs.existsSync(VENDOR_DIR)) {
  fs.mkdirSync(VENDOR_DIR, { recursive: true });
}

submodules.forEach((mod) => {
  const modPath = path.join(VENDOR_DIR, mod.name);

  try {
    if (fs.existsSync(modPath)) {
      console.log(`[更新] ${mod.name}...`);
      execSync('git pull --rebase', { cwd: modPath, stdio: 'inherit' });
    } else {
      console.log(`[克隆] ${mod.name}...`);
      // 使用 --depth 1 极大加快下载速度
      execSync(`git clone ${mod.url} "${modPath}" --depth 1`, {
        stdio: 'inherit',
      });
    }
  } catch (error) {
    console.error(`[失败] ${mod.name}: ${error.message}`);
  }
});
