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
const dirs = [];
for (const example of examples) {
  const cwd = `examples/${example}`;
  const stat = fs.statSync(cwd);
  if (stat.isDirectory()) {
    dirs.push(example);
    console.log(`running build for examples/${example}`);
    promises.push(
      Promise.resolve().then(async () => {
        await spawnAsync('npm', ['install'], { cwd, stdio: 'inherit' });
        await spawnAsync('npm', ['run', 'build'], { cwd, stdio: 'inherit' });
      })
    );
  }
}
Promise.all(promises).then(() => {
  console.log('done');
  fs.writeFileSync(
    'build/index.html',
    `<style>table,td,th{border:1px solid;border-collapse:collapse;padding:8px}</style><table><tr><th>App</th><th>Artifacts</tr>` +
      dirs
        .map(
          (dir) =>
            `<td><a href="${dir}">${dir} App</a></td><td><a href="/report.html#results=${dir}/artifacts/results.json&url=${dir}/">${dir} Artifacts</a>`
        )
        .join('</tr></tr>')
  );
});
