This file is mostly a brain dump of features I want to add to Safetest

## [ ] Code coverage

Document how to use [cypress-io/instrument-cra](https://github.com/cypress-io/instrument-cra) in the startup code in CRA together with an `afterTest` hook to collect coverage reports `fs.writeFileSync(`coverages/${testName}`, JSON.stringify(await page.evaluate(() => window.__coverage__)))`. If we dump each coverage to a json file we can then smoosh them together and generate a nice report with the following:

```bash
npx nyc merge coverages .nyc_output/out.json
npx nyc report --exclude="**/*.safetest.tsx" --reporter=html --reporter=text
```

## [ ] V8 coverage

We should be able to use `v8-to-istanbul` to generate a coverage info when we can't use `cypress-io/instrument-cra`. It's so much slower but may make sense for CI builds. I was playing around with this but lost the exact code on how to do this. The idea is to use the active page to pull any on page sourcemaps (since we can't ensure that it exists on the filesystem and not in memory) and then use `v8-to-istanbul` to generate a coverage info. Here are some snippets to get started:

```tsx
await page.coverage.startJSCoverage();
page.hooks.beforeTest(async () => page.coverage.startJSCoverage());
page.hooks.afterTest(async () => {
  const coverage = await page.coverage.stopJSCoverage();
  const entryWithMaps: Array<{ entry: any; map: any }> = [];
  for (const entry of coverage) {
    const mapUrl = `${entry.url}.map`;
    let map = sourceMaps[mapUrl];
    if (!map) {
      map = await page.evaluate(
        (map) => fetch(map).then((x) => x.json()),
        `${entry.url}.map`
      );
      sourceMaps[mapUrl] = map;
    }

    entryWithMaps.push({ entry, map });
  }

  let coverageMap: any = {};
  for (const { entry, map } of entryWithMaps) {
    const converter = v8toIstanbul(entry.url, 0, {
      source: entry.source,
      sourceMap: { sourcemap: map },
    });
    await converter.load();
    converter.applyCoverage(entry.functions);
    const istanbulCoverage = converter.toIstanbul();
    coverageMap = { ...coverageMap, ...istanbulCoverage };
  }
  const fullFilename = path.join(coveragePath, filename);
  await ensureDir(coveragePath);
  await fs.writeFile(fullFilename, JSON.stringify(coverageMap, null, 2));
});
```

This is not complete code and needs to be tested and debugged. This is really slow, I'm hoping there's some way to speed this up. As far as I can tell forking this process across many CPUs didn't speed it up.

## [ ] Video mode always on in CI

This should also include an example of collecting the artifacts in CI. It would also be nice to link the failing video screenshots in a comment in a PR. Right now github actions artifacts only support zip files so we can't how link to an actual video.

## Timeline view on video files

The reason for `originalMethods` was so that each page method can be monkey patched with a new method that tracks when in time it was called to build up a timeline of what was happening on the page. Something really simple like this can then be used in a simple timeline viewer:

```tsx
for (const key of pageMethods) {
  (page as any)[key] = (...args: any) => {
    const start = Date.now() - startTime;
    const returns = realFn.originalMethods[key].call(page, ...args);
    const onFinish = (results) => {
      timelines[uuid].events.push({
        start,
        end: Date.now() - startTime,
        fn: key,
        args,
      });
    };
    if (returns?.then) {
      return returns.then((res: any) => {
        onFinish(res);
        return res;
      });
    }
    onFinish(returns);
    return returns;
  };
}
```

We'd also need to dump a timelines.json file or something similar. Internal calls should use the `originalMethods` so as not to pollute the timeline.

## [ ] Figure out a better API to expose the component instance

Right now the render function can take a function that returns an element and api object, this was the quickest hack I could think of to get two way communication between the component and the page. The ergonomics of this aren't great. I like the idea of instead having a callback function either in the options or as a third param that takes the rendered/mounted component and returns an api object.

In the case of react we can also have something like an `useExposeApi` hook that we can call in an inline function that will be the api object. React example: https://stackblitz.com/edit/react-ts-sovx1q

## [ ] Use Playwright expect

Encourage people to install @playwright/test and in the safetest/jest module, we can attempt to load `expect` from there. This would allow people to use all the assertions defined at https://playwright.dev/docs/assertions
