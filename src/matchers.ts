// Copied  and modified to work here from https://github.com/microsoft/playwright/blob/main/packages/playwright-test/src/matchers/matchers.ts

/**
 * Copyright Microsoft Corporation. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Locator, Page, APIResponse } from 'playwright-core';

interface MatcherResult {
  pass: boolean;
  message: () => string;
}

type Matcher<T extends any[] = []> = (
  ...args: T
) => MatcherResult | Promise<MatcherResult>;

interface LocatorEx extends Locator {
  _expect(
    expression: string,
    options: any
  ): Promise<{
    matches: boolean;
    received?: any;
    log?: string[];
    timedOut?: boolean;
  }>;
}

interface APIResponseEx extends APIResponse {
  _fetchLog(): Promise<string[]>;
}

type ExpectMatcherContext = any;

async function toBeTruthy(
  this: ExpectMatcherContext,
  matcherName: string,
  receiver: any,
  receiverType: string,
  query: (
    isNot: boolean,
    timeout?: number
  ) => Promise<{
    matches: boolean;
    log?: string[];
    received?: any;
    timedOut?: boolean;
  }>,
  options: { timeout?: number } = {}
) {
  // const timeout = undefined

  const { matches, log, timedOut } = await query(!!this.isNot);

  const message = () => '';

  return { message, pass: matches };
}

async function toEqual<T>(
  this: ExpectMatcherContext,
  matcherName: string,
  receiver: any,
  receiverType: string,
  query: (
    isNot: boolean,
    timeout?: number
  ) => Promise<{
    matches: boolean;
    received?: any;
    log?: string[];
    timedOut?: boolean;
  }>,
  expected: T,
  options: { timeout?: number; contains?: boolean } = {}
) {
  const timeout = undefined;

  const {
    matches: pass,
    received,
    log,
    timedOut,
  } = await query(!!this.isNot, timeout);

  const message = () => '';

  return { actual: received, expected, message, name: matcherName, pass };
}

const isString = (value: any): value is string => typeof value === 'string';
const isRegExp = (value: any): value is RegExp => value instanceof RegExp;

async function toMatchText(
  this: ExpectMatcherContext,
  matcherName: string,
  receiver: any,
  receiverType: string,
  query: (
    isNot: boolean,
    timeout?: number
  ) => Promise<{
    matches: boolean;
    received?: string;
    log?: string[];
    timedOut?: boolean;
  }>,
  expected: string | RegExp,
  options: { timeout?: number; matchSubstring?: boolean } = {}
) {
  const matcherOptions = {
    isNot: this.isNot,
    promise: this.promise,
  };

  if (
    !(typeof expected === 'string') &&
    !(expected && typeof expected.test === 'function')
  ) {
    throw new Error('value must be a string or regular expression');
  }

  const timeout = undefined;

  const {
    matches: pass,
    received,
    log,
    timedOut,
  } = await query(!!this.isNot, timeout);
  const stringSubstring = options.matchSubstring ? 'substring' : 'string';
  const receivedString = received || '';
  const message = () => '';

  return { message, pass };
}

function toExpectedTextValues(
  items: (string | RegExp)[],
  options: {
    matchSubstring?: boolean;
    normalizeWhiteSpace?: boolean;
    ignoreCase?: boolean;
  } = {}
): any[] {
  return items.map((i) => ({
    string: isString(i) ? i : undefined,
    regexSource: isRegExp(i) ? i.source : undefined,
    regexFlags: isRegExp(i) ? i.flags : undefined,
    matchSubstring: options.matchSubstring,
    ignoreCase: options.ignoreCase,
    normalizeWhiteSpace: options.normalizeWhiteSpace,
  }));
}

export function toBeAttached(
  this: ExpectMatcherContext,
  locator: LocatorEx,
  options?: { attached?: boolean; timeout?: number }
) {
  return toBeTruthy.call(
    this,
    'toBeAttached',
    locator,
    'Locator',
    async (isNot, timeout) => {
      const attached =
        !options || options.attached === undefined || options.attached === true;
      return await locator._expect(
        attached ? 'to.be.attached' : 'to.be.detached',
        { isNot, timeout }
      );
    },
    options
  );
}

export function toBeChecked(
  this: ExpectMatcherContext,
  locator: LocatorEx,
  options?: { checked?: boolean; timeout?: number }
) {
  return toBeTruthy.call(
    this,
    'toBeChecked',
    locator,
    'Locator',
    async (isNot, timeout) => {
      const checked =
        !options || options.checked === undefined || options.checked === true;
      return await locator._expect(
        checked ? 'to.be.checked' : 'to.be.unchecked',
        { isNot, timeout }
      );
    },
    options
  );
}

export function toBeDisabled(
  this: ExpectMatcherContext,
  locator: LocatorEx,
  options?: { timeout?: number }
) {
  return toBeTruthy.call(
    this,
    'toBeDisabled',
    locator,
    'Locator',
    async (isNot, timeout) => {
      return await locator._expect('to.be.disabled', { isNot, timeout });
    },
    options
  );
}

export function toBeEditable(
  this: ExpectMatcherContext,
  locator: LocatorEx,
  options?: { editable?: boolean; timeout?: number }
) {
  return toBeTruthy.call(
    this,
    'toBeEditable',
    locator,
    'Locator',
    async (isNot, timeout) => {
      const editable =
        !options || options.editable === undefined || options.editable === true;
      return await locator._expect(
        editable ? 'to.be.editable' : 'to.be.readonly',
        { isNot, timeout }
      );
    },
    options
  );
}

export function toBeEmpty(
  this: ExpectMatcherContext,
  locator: LocatorEx,
  options?: { timeout?: number }
) {
  return toBeTruthy.call(
    this,
    'toBeEmpty',
    locator,
    'Locator',
    async (isNot, timeout) => {
      return await locator._expect('to.be.empty', { isNot, timeout });
    },
    options
  );
}

export function toBeEnabled(
  this: ExpectMatcherContext,
  locator: LocatorEx,
  options?: { enabled?: boolean; timeout?: number }
) {
  return toBeTruthy.call(
    this,
    'toBeEnabled',
    locator,
    'Locator',
    async (isNot, timeout) => {
      const enabled =
        !options || options.enabled === undefined || options.enabled === true;
      return await locator._expect(
        enabled ? 'to.be.enabled' : 'to.be.disabled',
        { isNot, timeout }
      );
    },
    options
  );
}

export function toBeFocused(
  this: ExpectMatcherContext,
  locator: LocatorEx,
  options?: { timeout?: number }
) {
  return toBeTruthy.call(
    this,
    'toBeFocused',
    locator,
    'Locator',
    async (isNot, timeout) => {
      return await locator._expect('to.be.focused', { isNot, timeout });
    },
    options
  );
}

export function toBeHidden(
  this: ExpectMatcherContext,
  locator: LocatorEx,
  options?: { timeout?: number }
) {
  return toBeTruthy.call(
    this,
    'toBeHidden',
    locator,
    'Locator',
    async (isNot, timeout) => {
      return await locator._expect('to.be.hidden', { isNot, timeout });
    },
    options
  );
}

export function toBeVisible(
  this: ExpectMatcherContext,
  locator: LocatorEx,
  options?: { visible?: boolean; timeout?: number }
) {
  return toBeTruthy.call(
    this,
    'toBeVisible',
    locator,
    'Locator',
    async (isNot, timeout) => {
      const visible =
        !options || options.visible === undefined || options.visible === true;
      return await locator._expect(visible ? 'to.be.visible' : 'to.be.hidden', {
        isNot,
        timeout,
      });
    },
    options
  );
}

export function toBeInViewport(
  this: ExpectMatcherContext,
  locator: LocatorEx,
  options?: { timeout?: number; ratio?: number }
) {
  return toBeTruthy.call(
    this,
    'toBeInViewport',
    locator,
    'Locator',
    async (isNot, timeout) => {
      return await locator._expect('to.be.in.viewport', {
        isNot,
        expectedNumber: options?.ratio,
        timeout,
      });
    },
    options
  );
}

export function toContainText(
  this: ExpectMatcherContext,
  locator: LocatorEx,
  expected: string | RegExp | (string | RegExp)[],
  options: {
    timeout?: number;
    useInnerText?: boolean;
    ignoreCase?: boolean;
  } = {}
) {
  if (Array.isArray(expected)) {
    return toEqual.call(
      this,
      'toContainText',
      locator,
      'Locator',
      async (isNot, timeout) => {
        const expectedText = toExpectedTextValues(expected, {
          matchSubstring: true,
          normalizeWhiteSpace: true,
          ignoreCase: !!options.ignoreCase,
        });
        return await locator._expect('to.contain.text.array', {
          expectedText,
          isNot,
          useInnerText: options.useInnerText,
          timeout,
        });
      },
      expected,
      { ...options, contains: true }
    );
  } else {
    return toMatchText.call(
      this,
      'toContainText',
      locator,
      'Locator',
      async (isNot, timeout) => {
        const expectedText = toExpectedTextValues([expected], {
          matchSubstring: true,
          normalizeWhiteSpace: true,
          ignoreCase: !!options.ignoreCase,
        });
        return await locator._expect('to.have.text', {
          expectedText,
          isNot,
          useInnerText: options.useInnerText,
          timeout,
        });
      },
      expected,
      options
    );
  }
}

export function toHaveAttribute(
  this: ExpectMatcherContext,
  locator: LocatorEx,
  name: string,
  expected: string | RegExp,
  options?: { timeout?: number }
) {
  return toMatchText.call(
    this,
    'toHaveAttribute',
    locator,
    'Locator',
    async (isNot, timeout) => {
      const expectedText = toExpectedTextValues([expected]);
      return await locator._expect('to.have.attribute', {
        expressionArg: name,
        expectedText,
        isNot,
        timeout,
      });
    },
    expected,
    options
  );
}

export function toHaveClass(
  this: ExpectMatcherContext,
  locator: LocatorEx,
  expected: string | RegExp | (string | RegExp)[],
  options?: { timeout?: number }
) {
  if (Array.isArray(expected)) {
    return toEqual.call(
      this,
      'toHaveClass',
      locator,
      'Locator',
      async (isNot, timeout) => {
        const expectedText = toExpectedTextValues(expected);
        return await locator._expect('to.have.class.array', {
          expectedText,
          isNot,
          timeout,
        });
      },
      expected,
      options
    );
  } else {
    return toMatchText.call(
      this,
      'toHaveClass',
      locator,
      'Locator',
      async (isNot, timeout) => {
        const expectedText = toExpectedTextValues([expected]);
        return await locator._expect('to.have.class', {
          expectedText,
          isNot,
          timeout,
        });
      },
      expected,
      options
    );
  }
}

export function toHaveCount(
  this: ExpectMatcherContext,
  locator: LocatorEx,
  expected: number,
  options?: { timeout?: number }
) {
  return toEqual.call(
    this,
    'toHaveCount',
    locator,
    'Locator',
    async (isNot, timeout) => {
      return await locator._expect('to.have.count', {
        expectedNumber: expected,
        isNot,
        timeout,
      });
    },
    expected,
    options
  );
}

export function toHaveCSS(
  this: ExpectMatcherContext,
  locator: LocatorEx,
  name: string,
  expected: string | RegExp,
  options?: { timeout?: number }
) {
  return toMatchText.call(
    this,
    'toHaveCSS',
    locator,
    'Locator',
    async (isNot, timeout) => {
      const expectedText = toExpectedTextValues([expected]);
      return await locator._expect('to.have.css', {
        expressionArg: name,
        expectedText,
        isNot,
        timeout,
      });
    },
    expected,
    options
  );
}

export function toHaveId(
  this: ExpectMatcherContext,
  locator: LocatorEx,
  expected: string | RegExp,
  options?: { timeout?: number }
) {
  return toMatchText.call(
    this,
    'toHaveId',
    locator,
    'Locator',
    async (isNot, timeout) => {
      const expectedText = toExpectedTextValues([expected]);
      return await locator._expect('to.have.id', {
        expectedText,
        isNot,
        timeout,
      });
    },
    expected,
    options
  );
}

export function toHaveJSProperty(
  this: ExpectMatcherContext,
  locator: LocatorEx,
  name: string,
  expected: any,
  options?: { timeout?: number }
) {
  return toEqual.call(
    this,
    'toHaveJSProperty',
    locator,
    'Locator',
    async (isNot, timeout) => {
      return await locator._expect('to.have.property', {
        expressionArg: name,
        expectedValue: expected,
        isNot,
        timeout,
      });
    },
    expected,
    options
  );
}

export function toHaveText(
  this: ExpectMatcherContext,
  locator: LocatorEx,
  expected: string | RegExp | (string | RegExp)[],
  options: {
    timeout?: number;
    useInnerText?: boolean;
    ignoreCase?: boolean;
  } = {}
) {
  if (Array.isArray(expected)) {
    return toEqual.call(
      this,
      'toHaveText',
      locator,
      'Locator',
      async (isNot, timeout) => {
        const expectedText = toExpectedTextValues(expected, {
          normalizeWhiteSpace: true,
          ignoreCase: !!options.ignoreCase,
        });
        return await locator._expect('to.have.text.array', {
          expectedText,
          isNot,
          useInnerText: options?.useInnerText,
          timeout,
        });
      },
      expected,
      options
    );
  } else {
    return toMatchText.call(
      this,
      'toHaveText',
      locator,
      'Locator',
      async (isNot, timeout) => {
        const expectedText = toExpectedTextValues([expected], {
          normalizeWhiteSpace: true,
          ignoreCase: !!options.ignoreCase,
        });
        return await locator._expect('to.have.text', {
          expectedText,
          isNot,
          useInnerText: options?.useInnerText,
          timeout,
        });
      },
      expected,
      options
    );
  }
}

export function toHaveValue(
  this: ExpectMatcherContext,
  locator: LocatorEx,
  expected: string | RegExp,
  options?: { timeout?: number }
) {
  return toMatchText.call(
    this,
    'toHaveValue',
    locator,
    'Locator',
    async (isNot, timeout) => {
      const expectedText = toExpectedTextValues([expected]);
      return await locator._expect('to.have.value', {
        expectedText,
        isNot,
        timeout,
      });
    },
    expected,
    options
  );
}

export function toHaveValues(
  this: ExpectMatcherContext,
  locator: LocatorEx,
  expected: (string | RegExp)[],
  options?: { timeout?: number }
) {
  return toEqual.call(
    this,
    'toHaveValues',
    locator,
    'Locator',
    async (isNot, timeout) => {
      const expectedText = toExpectedTextValues(expected);
      return await locator._expect('to.have.values', {
        expectedText,
        isNot,
        timeout,
      });
    },
    expected,
    options
  );
}

export function toHaveTitle(
  this: ExpectMatcherContext,
  page: Page,
  expected: string | RegExp,
  options: { timeout?: number } = {}
) {
  const locator = page.locator(':root') as LocatorEx;
  return toMatchText.call(
    this,
    'toHaveTitle',
    locator,
    'Locator',
    async (isNot, timeout) => {
      const expectedText = toExpectedTextValues([expected], {
        normalizeWhiteSpace: true,
      });
      return await locator._expect('to.have.title', {
        expectedText,
        isNot,
        timeout,
      });
    },
    expected,
    options
  );
}

export function toHaveURL(
  this: ExpectMatcherContext,
  page: Page,
  expected: string | RegExp,
  options?: { timeout?: number }
) {
  const baseURL = (page.context() as any)._options.baseURL;
  expected =
    typeof expected === 'string' ? `${new URL(baseURL, expected)}` : expected;
  const locator = page.locator(':root') as LocatorEx;
  return toMatchText.call(
    this,
    'toHaveURL',
    locator,
    'Locator',
    async (isNot, timeout) => {
      const expectedText = toExpectedTextValues([expected]);
      return await locator._expect('to.have.url', {
        expectedText,
        isNot,
        timeout,
      });
    },
    expected,
    options
  );
}

function isTextualMimeType(mimeType: string) {
  return !!mimeType.match(
    /^(text\/.*?|application\/(json|(x-)?javascript|xml.*?|ecmascript|graphql|x-www-form-urlencoded)|image\/svg(\+xml)?|application\/.*?(\+json|\+xml))(;\s*charset=.*)?$/
  );
}

export async function toBeOK(
  this: ExpectMatcherContext,
  response: APIResponseEx
) {
  const contentType = response.headers()['content-type'];
  const isTextEncoding = contentType && isTextualMimeType(contentType);
  const [log, text] =
    this.isNot === response.ok()
      ? await Promise.all([
          response._fetchLog(),
          isTextEncoding ? response.text() : null,
        ])
      : [];

  const message = () => '';

  const pass = response.ok();
  return { message, pass };
}
