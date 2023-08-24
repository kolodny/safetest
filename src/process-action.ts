import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { camelCase } from 'lodash';

import { FormattedTestResults } from '@jest/test-result';
import { ensureDir } from './ensure-dir';

const parsed = Object.fromEntries(
  process.argv
    .map((arg) => arg.match(/(?<=--)([^=]*)(?:=(.*))?/)?.slice(1))
    .map((item) => {
      let value: any = item?.[1];
      if (value === 'false') value = false;
      else if (value === 'true') value = true;
      else if (value === undefined) value = true;
      else if (value === 'undefined') value = undefined;
      else if (!isNaN(parseFloat(value))) value = +value;
      return [camelCase(item?.[0]), value];
    })
    .filter(Boolean)
);

if (
  !parsed['results'] ||
  !parsed['artifacts'] ||
  !parsed['buildUrl'] ||
  !parsed['url']
) {
  throw new Error(
    'results, artifacts, url, and buildUrl arguments are required'
  );
}

const { artifacts, buildUrl, url } = parsed;

const results: FormattedTestResults = JSON.parse(
  fs.readFileSync(parsed['results'], 'utf8')
);

const VIDEO_BASE_URL = `${buildUrl}/videos`;
const TRACE_BASE_URL = `${buildUrl}/trace`;
const UPDATED_BASE_URL = `${buildUrl}/updated_snapshots`;
const DIFF_BASE_URL = `${buildUrl}/image_diffs`;
const FAILURE_BASE_URL = `${buildUrl}/failure_screenshots`;
const RESULTS_URL = `${buildUrl}/results.html`;

const readdir = (dir: string) => {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
};

const commentParts = [];

const videos = readdir(`${artifacts}/videos`);
const diffs = readdir(`${artifacts}/image_diffs`);
const traces = readdir(`${artifacts}/trace/traces`);
const failureScreenshots = readdir(`${artifacts}/failure_screenshots`);
const updated = readdir(`${artifacts}/updated_snapshots`);

if (diffs.length) {
  commentParts.push(`## Screenshot diff${diffs.length > 1 ? 's' : ''} found!`);
  commentParts.push(
    diffs.map((diff) => `![${diff}](${DIFF_BASE_URL}/${diff})`).join(' ')
  );
  commentParts.push('');
}

const gitLsCommand = 'git ls-files __image_snapshots__ --others';
const gitLsFiles = cp.execSync(gitLsCommand, { encoding: 'utf8' });
const newFiles = gitLsFiles.trim().split(/\s+/g).filter(Boolean);
if (newFiles.length) {
  const updatedDir = `${artifacts}/updated_snapshots`;
  if (!fs.existsSync(updatedDir)) {
    fs.mkdirSync(updatedDir);
  }
  commentParts.push(
    `## New screenshot${newFiles.length > 1 ? 's' : ''} found!`
  );
  commentParts.push(
    newFiles
      .map((newFile) => {
        const filename = newFile.split('/').pop();
        const url = `${UPDATED_BASE_URL}/${filename}`;
        return `![${filename}](${url})`;
      })
      .join(' ')
  );
  commentParts.push('');
  for (const newFile of newFiles) {
    fs.copyFileSync(
      newFile,
      newFile.replace(/__image_snapshots__/, updatedDir)
    );
  }
}

if (updated.length) {
  for (const update of updated) {
    const oldName = `${artifacts}/updated_snapshots/${update}`;
    const newName = oldName.replace(/-received\.png/, '.png');
    fs.renameSync(oldName, newName);
  }
}

if (updated.length || newFiles.length) {
  commentParts.push(
    'Screenshot changes detected, run `npm run safetest:regenerate` to update them.'
  );
}

const flattenResults = results.testResults.flatMap((result) =>
  result.assertionResults.flatMap((s) => ({
    filename: path.relative(path.resolve(), result.name),
    ...s,
  }))
);

const failedTests = flattenResults.filter((r) => r.status === 'failed');
if (failedTests.length) {
  if (commentParts.length) commentParts.push('---');
  commentParts.push('# Failed tests:');
  for (const failedTest of failedTests) {
    let videoComment = '';
    const videoAttempts = videos
      .filter((v) => v.includes(`${failedTest.fullName}-attempt-`))
      .sort();
    if (videoAttempts.length) {
      for (const video of videoAttempts) {
        const attempt = video.match(/attempt-(\d+)/)?.[1];
        const tab = video.match(/_tab(\d+)/)?.[1];
        const videoUrl = `${VIDEO_BASE_URL}/${video}`;
        const videoUrlEncoded = videoUrl.replace(/ /g, '%20');
        let suffix = +attempt! ? ` - Attempt ${+attempt! + 1}` : '';
        suffix += tab ? ` - Tab ${+tab + 1}` : '';
        videoComment += `[[Video of test run${suffix}](${videoUrlEncoded})]`;
      }
    }

    let traceComment = '';
    const trace = traces.filter((v) => v.includes(failedTest.fullName));
    if (trace.length) {
      for (const t of trace) {
        const attempt = t.match(/attempt-(\d+)/)?.[1];
        const traceHomepage = `${TRACE_BASE_URL}/index.html`;
        const traceFile = encodeURIComponent(`${TRACE_BASE_URL}/traces/${t}`);
        const traceUrl = `${traceHomepage}?trace=${traceFile}`;
        const traceUrlEncoded = traceUrl.replace(/ /g, '%20');
        const suffix = +attempt! ? ` - Attempt ${+attempt! + 1}` : '';
        traceComment += `[[Trace of test run${suffix}](${traceUrlEncoded})]`;
      }
    }

    let failureScreenshotComment = '';
    const failureScreenshot = failureScreenshots.find((v) =>
      v.includes(failedTest.fullName)
    );
    if (failureScreenshot) {
      const failShotUrl = `${FAILURE_BASE_URL}/${failureScreenshot}`;
      const failShotUrlEncoded = failShotUrl.replace(/ /g, '%20');
      if (!videoComment) {
        failureScreenshotComment = `[[View final screenshot](${failShotUrlEncoded})]`;
      }
    }

    const debugUrl = new URL(url);
    debugUrl.searchParams.set('test_name', failedTest.fullName);
    debugUrl.searchParams.set(
      'test_path',
      failedTest.filename.replace(/\.([tj]sx?)$/, '')
    );
    const debugUrlEncoded = debugUrl.toString().replace(/%2F/g, '/');
    commentParts.push(
      `- ${failedTest.fullName} ${videoComment} ${failureScreenshotComment} ${traceComment} [[Open initial component state](${debugUrlEncoded})]`
    );
  }
}

const tests: Record<string, any> = {};
for (const result of results.testResults) {
  const filename = path
    .relative(process.cwd(), result.name)
    .replace(/\.[jt]sx?$/g, '');
  for (const assertionResult of result.assertionResults) {
    let map: Record<string, any> = (tests[filename] ??= {});
    for (const ancestorTitles of assertionResult.ancestorTitles) {
      map[ancestorTitles] ??= {};
      map = map[ancestorTitles];
    }
    const status = {
      passed: '✅',
      failed: '❌',
      focused: '🔍',
      skipped: '⏭️',
      pending: '⏳',
      todo: '📝',
      disabled: '🚫',
    }[assertionResult.status];
    map[assertionResult.title] = [status, assertionResult.fullName];
  }
}

function collect() {
  let summary = '';
  if (diffs.length) {
    summary += '<details><summary>Screenshot diffs</summary>';
    summary += diffs
      .map(
        (diff) =>
          `<a style="width:80%;display:flex;margin:auto;outline:1px solid" href="${DIFF_BASE_URL}/${diff}"><img style="max-width:100%" src="${DIFF_BASE_URL}/${diff}" /></a>`
      )
      .join('<br />');
    summary += '</details>';
  }
  summary += '<ul>';
  recur(tests);
  function recur(map: any, indent = '', filename = '') {
    for (const [key, value] of Object.entries(map)) {
      if (Array.isArray(value)) {
        const [status, fullName] = value;
        summary += `<li>${indent}- ${status} ${key} `;
        const videoAttempts = videos.filter((v) =>
          v.includes(`${fullName}-attempt-`)
        );
        if (videoAttempts.length) {
          for (const video of videoAttempts) {
            const attempt = video.match(/attempt-(\d+)/)?.[1];
            const tab = video.match(/_tab(\d+)/)?.[1];
            let suffix = +attempt! ? ` - Attempt ${+attempt! + 1}` : '';
            suffix += tab ? ` - Tab ${+tab + 1}` : '';

            const videoUrl = `${VIDEO_BASE_URL}/${video}`;
            const videoUrlEncoded = videoUrl.replace(/ /g, '%20');
            summary += `<a href="${videoUrlEncoded}">[Video${suffix}]</a>`;
          }
        }

        const trace = traces.filter((v) => v.includes(fullName));
        for (const t of trace) {
          const attempt = t.match(/attempt-(\d+)/)?.[1];
          const traceHomepage = `${TRACE_BASE_URL}/index.html`;
          const rawTraceFile = `${TRACE_BASE_URL}/traces/${t}`;
          summary += `
            <script>
              (() => {
                const a = document.createElement('a');
                a.href = '${rawTraceFile}';
                const traceFile = a.href;
                document.write('<a href="${traceHomepage}?trace=' + traceFile + '">[Trace${
            +attempt! ? ` - Attempt ${+attempt! + 1}` : ''
          }]</a>');
              })();
            </script>
          `;
        }

        const debugUrl = new URL(url);
        debugUrl.searchParams.set('test_name', fullName);
        debugUrl.searchParams.set(
          'test_path',
          filename.replace(/\.([tj]sx?)$/, '')
        );
        const debugUrlEncoded = debugUrl.toString().replace(/%2F/g, '/');
        summary += `<a href="${debugUrlEncoded}">[Open initial component state]</a>`;
        summary += '</li>';
      } else {
        const title = !filename
          ? `<strong style="margin-top: 24px;display: inline-block;">${key}</strong>`
          : key;
        summary += `<li>${indent}- ${title} `;
        summary += '<ul>';
        recur(value, `${indent}  `, filename || key);
        summary += '</ul>';
      }
    }
  }
  summary += '</ul>';

  if (failedTests.length) {
    const failedTestNames = failedTests.map((t) => t.fullName);
    const stringified = JSON.stringify(failedTestNames);
    const encoded = Buffer.from(stringified).toString('base64');
    const failedInNewlines = failedTestNames.join('\\n');
  }

  return `${summary}`;
}

fs.writeFileSync(`${artifacts}/results.html`, collect());
const summary = RESULTS_URL;
console.log(`\n\n\nView summary at ${summary}\n\n\n`);

if (commentParts.length) {
  commentParts.push('');
  commentParts.push('---');
  commentParts.push(`### [View summary of all tests](${summary})`);
}

const comment = commentParts.join('\n');
console.log(comment);
