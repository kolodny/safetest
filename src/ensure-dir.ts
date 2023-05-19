import { safeRequire } from './safe-require';

const fs = safeRequire('fs');

export const ensureDir = async (path: string): Promise<void> => {
  try {
    await fs.promises.access(path);
  } catch {
    await fs.promises.mkdir(path, { recursive: true });
  }
};
