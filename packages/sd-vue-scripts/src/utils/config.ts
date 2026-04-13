import fs from 'fs-extra';
import path from 'path';

const CONFIG_DIR = '.config';

export const getUserConfig = async (name: string) => {
  const filename = path.resolve(process.cwd(), CONFIG_DIR, name);
  try {
    await fs.access(filename);
    return require(filename);
  } catch {
    return undefined;
  }
};
