const fs = require('fs');

try {
  fs.mkdirSync('build');
} catch (e) {}

const examples = fs.readdirSync('examples');
for (const example of examples) {
  const cwd = `examples/${example}`;
  const build = `build/${example}`;
  const stat = fs.statSync(cwd);
  if (stat.isDirectory()) {
    console.log(`collecting artifacts for examples/${example}`);
    const artifacts = `${build}/artifacts`;

    const dir = fs.readdirSync(cwd);
    if (dir.includes('artifacts')) {
      const src = `${cwd}/artifacts`;
      const dst = artifacts;
      fs.renameSync(src, dst);
    }

    if (dir.includes('results.json')) {
      const src = `${cwd}/results.json`;
      const dst = `${artifacts}/results.json`;
      fs.renameSync(src, dst);
    }

    if (dir.includes('artifacts-info.json')) {
      const src = `${cwd}/artifacts-info.json`;
      const dst = `${artifacts}/artifacts-info.json`;
      fs.renameSync(src, dst);
    }

    if (dir.includes('__image_snapshots__')) {
      const src = `${cwd}/__image_snapshots__`;
      const dst = `${artifacts}/__image_snapshots__`;
      fs.cpSync(src, dst, { recursive: true });
    }

    console.log(dir);
  }
}
