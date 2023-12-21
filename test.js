const fs = require('fs');
const { spawn } = require('child_process');

const spawnAsync = (command, args, options) => {
  return new Promise((resolve) => {
    spawn(command, args, options).on('close', resolve);
  });
};

try {
  fs.mkdirSync('build');
} catch (e) {}

const examples = fs.readdirSync('examples');
const promises = [];
for (const example of examples) {
  const cwd = `examples/${example}`;
  const stat = fs.statSync(cwd);
  if (stat.isDirectory()) {
    console.log(`running build for examples/${example}`);
    const options = { cwd, stdio: 'inherit' };
    const ifPresent = '--if-present';
    promises.push(
      Promise.resolve().then(async () => {
        await spawnAsync('npm', ['install'], options);
        await spawnAsync('npm', ['run', 'safetest:ci', ifPresent], options);
        await spawnAsync('npm', ['run', 'process:ci', ifPresent], options);
      })
    );
  }
}
