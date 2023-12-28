A couple of things I'd like to add to the project

- [ ] I added an undocumented feature of appending #safetest to the url to get info about available tests in the console. Ideally I want this to be a runner like page similar to Cypress UI or Playwright UI.
- [ ] It's possible to add NextJS server side render component testing to the project. I'm not sure if it's worth it though. We would be able to test things like sending a dark-themed page to a user with dark mode enabled etc, there wouldn't be any page actions since those are client side events.
- [ ] I want to "hide" the Safetest library frames from the stack trace similar to how Playwright does it. It's probably as simple as referencing the Safetest `expect` function into `Error.captureStackTrace(expect)` - [reference](https://github.com/microsoft/playwright/blob/39abc6386f59cd200a8c22ecfd52c1848e091662/packages/playwright/src/transform/transform.ts#L256-L279)
