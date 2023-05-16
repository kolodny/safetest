const fs = require('fs');
const { spawnSync } = require('child_process');

const examples = fs.readdirSync('examples');
for (const example of examples) {
  const stat = fs.statSync(`examples/${example}`);
  if (stat.isDirectory()) {
    console.log(`running build for examples/${example}`);
    spawnSync('npm', ['run', 'build', '--if-present'], {
      cwd: `examples/${example}`,
      stdio: 'inherit',
    });
  }
}
