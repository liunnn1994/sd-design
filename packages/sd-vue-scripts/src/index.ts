#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';

import buildComponent from './scripts/build-component';
import buildMaterial from './scripts/build-material';
import buildMaterialLibrary from './scripts/build-material-library';
import buildStyle from './scripts/build-style';
import devComponent from './scripts/dev-component';
import dtsgen from './scripts/dtsgen';
import icongen from './scripts/icongen';
import jsongen from './scripts/jsongen';
import lessgen from './scripts/lessgen';
import test from './scripts/test';

const program = new Command();

const packageContent = fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8');
const packageData: any = JSON.parse(packageContent);

program.version(packageData.version).name('sd-vue-scripts').usage('command [options]');

program
  .command('icongen')
  .description('generate icon components.')
  .action(() => {
    icongen();
  });

program
  .command('lessgen')
  .description('generate index less file.')
  .action(() => {
    lessgen();
  });

program
  .command('dtsgen <files>')
  .description('emit .d.ts files for vue files.')
  .option('-o, --outDir <direname>', 'Specify an output folder for all emitted files')
  .action((files, options) => {
    dtsgen(files, options);
  });

program
  .command('dev:component')
  .description('build components with watch mode.')
  .action(async () => {
    await devComponent();
  });

program
  .command('build:component')
  .description('build production files.')
  .option('-u, --umd', 'build with UMD file')
  .action(async ({ umd }) => {
    await buildComponent({ umd });
  });

program
  .command('build:style')
  .description('build style related files.')
  .option('-M, --material', 'generate style for material')
  .action(async ({ material }) => {
    await buildStyle({ material });
  });

program
  .command('build:material <input>')
  .description('build vue material.')
  .action(async (input) => {
    await buildMaterial(input);
  });

program
  .command('build:material-library')
  .description('build vue material library.')
  .action(async () => {
    await buildMaterialLibrary();
  });

program
  .command('test')
  .description('run test for component or material.')
  .option('-c, --components <names>', 'component name(s) joined by comma(,)')
  .allowUnknownOption()
  .action(async ({ components }) => {
    components = typeof components === 'string' ? components.split(',') : [];
    await test(components, program.args.slice(1));
  });

program
  .command('jsongen')
  .description('generate vetur and web-types json files')
  .action(async () => {
    await jsongen();
  });

program.parse(process.argv);
