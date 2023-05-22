const fs = require('fs');
const { spawnSync } = require('child_process');

try {
  fs.mkdirSync('build');
} catch (e) {}

const ip = spawnSync('curl', ['https://api.ipify.org'])
  .stdout.toString()
  .trim();

const examples = fs.readdirSync('examples');
for (const example of examples) {
  const cwd = `examples/${example}`;
  const stat = fs.statSync(cwd);
  if (stat.isDirectory()) {
    console.log(`running build for examples/${example}`);
    spawnSync('npm', ['install'], { cwd, stdio: 'inherit' });
    spawnSync('npm', ['run', 'safetest:ci', '--if-present'], {
      cwd,
      stdio: 'inherit',
      env: {
        ...process.env,
        MY_IP: ip,
      },
    });
  }
}
