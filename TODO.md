A couple of things I'd like to add to the project

- [ ] Right now `process-actions` is a bit of a mess. I'd like to instead output a structured JSON file that can be used to generate the HTML or create some dashboard dynamically. This would allow for more flexibility in the future and allow easy customization.

- [ ] I added an undocumented feature of appending #safetest to the url to get info about available tests in the console. Ideally I want this to be a runner like page similar to Cypress UI or Playwright UI. This is not as high priority since `process-actions` does link directly to the component under test.
