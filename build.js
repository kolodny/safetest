const fs = require('fs');
const { spawnSync } = require('child_process');

try {
  fs.mkdirSync('build');
} catch (e) {}

const examples = fs.readdirSync('examples');
const dirs = [];
for (const example of examples) {
  const cwd = `examples/${example}`;
  const stat = fs.statSync(cwd);
  if (stat.isDirectory()) {
    dirs.push(example);
    console.log(`running build for examples/${example}`);
    spawnSync('npm', ['install'], { cwd, stdio: 'inherit' });
    spawnSync('npm', ['run', 'build', '--if-present'], {
      cwd,
      stdio: 'inherit',
    });
  }
}
fs.writeFileSync(
  'build/index.html',
  dirs.map((dir) => `<a href="${dir}">${dir}</a>`).join('<br>')
);
