import { fs } from './safe-node-imports';

export const ensureDir = async (path: string): Promise<void> => {
  try {
    await fs.access(path);
  } catch {
    await fs.mkdir(path, { recursive: true });
  }
};
