const fs = require('fs');
const { spawnSync } = require('child_process');

try {
  fs.mkdirSync('build');
} catch (e) {}

const examples = fs.readdirSync('examples');
for (const example of examples) {
  const cwd = `examples/${example}`;
  const stat = fs.statSync(cwd);
  if (stat.isDirectory()) {
    console.log(`running test for examples/${example}`);
    const options = { cwd, stdio: 'inherit' };
    spawnSync('npm', ['install'], options);
    spawnSync('npm', ['run', 'safetest:ci', '--if-present'], options);
    spawnSync('npm', ['run', 'process:ci', '--if-present'], options);
  }
}
