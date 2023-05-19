import { Locator } from 'playwright-core';

export type Matchers<T> = LocatorAssertions &
  PageAssertions &
  APIResponseAssertions &
  jest.JestMatchers<T>;

interface LocatorAssertions {
  /**
   * Makes the assertion check for the opposite condition. For example, this code tests that the Locator doesn't contain text
   * `"error"`:
   *
   * ```js
   * await expect(locator).not.toContainText('error');
   * ```
   *
   */
  not: Matchers<any>;

  /**
   * Ensures the [Locator] points to a checked input.
   *
   * ```js
   * const locator = page.getByLabel('Subscribe to newsletter');
   * await expect(locator).toBeChecked();
   * ```
   *
   * @param options
   */
  toBeChecked(options?: {
    checked?: boolean;

    /**
     * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator] points to a disabled element. Element is disabled if it has "disabled" attribute or is disabled
   * via ['aria-disabled'](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-disabled). Note
   * that only native control elements such as HTML `button`, `input`, `select`, `textarea`, `option`, `optgroup` can be
   * disabled by setting "disabled" attribute. "disabled" attribute on other elements is ignored by the browser.
   *
   * ```js
   * const locator = page.locator('button.submit');
   * await expect(locator).toBeDisabled();
   * ```
   *
   * @param options
   */
  toBeDisabled(options?: {
    /**
     * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator] points to an editable element.
   *
   * ```js
   * const locator = page.getByRole('textbox');
   * await expect(locator).toBeEditable();
   * ```
   *
   * @param options
   */
  toBeEditable(options?: {
    editable?: boolean;

    /**
     * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator] points to an empty editable element or to a DOM node that has no text.
   *
   * ```js
   * const locator = page.locator('div.warning');
   * await expect(locator).toBeEmpty();
   * ```
   *
   * @param options
   */
  toBeEmpty(options?: {
    /**
     * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator] points to an enabled element.
   *
   * ```js
   * const locator = page.locator('button.submit');
   * await expect(locator).toBeEnabled();
   * ```
   *
   * @param options
   */
  toBeEnabled(options?: {
    enabled?: boolean;

    /**
     * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator] points to a focused DOM node.
   *
   * ```js
   * const locator = page.getByRole('textbox');
   * await expect(locator).toBeFocused();
   * ```
   *
   * @param options
   */
  toBeFocused(options?: {
    /**
     * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures that [Locator] either does not resolve to any DOM node, or resolves to a
   * [non-visible](https://playwright.dev/docs/api/actionability#visible) one.
   *
   * ```js
   * const locator = page.locator('.my-element');
   * await expect(locator).toBeHidden();
   * ```
   *
   * @param options
   */
  toBeHidden(options?: {
    /**
     * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures that [Locator] points to an [attached](https://playwright.dev/docs/api/actionability#attached) and [visible](https://playwright.dev/docs/api/actionability#visible)
   * DOM node.
   *
   * ```js
   * const locator = page.locator('.my-element');
   * await expect(locator).toBeVisible();
   * ```
   *
   * @param options
   */
  toBeVisible(options?: {
    /**
     * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;

    visible?: boolean;
  }): Promise<void>;

  /**
   * Ensures the [Locator] points to an element that contains the given text. You can use regular expressions for the value
   * as well.
   *
   * ```js
   * const locator = page.locator('.title');
   * await expect(locator).toContainText('substring');
   * await expect(locator).toContainText(/\d messages/);
   * ```
   *
   * If you pass an array as an expected value, the expectations are:
   * 1. Locator resolves to a list of elements.
   * 1. Elements from a **subset** of this list contain text from the expected array, respectively.
   * 1. The matching subset of elements has the same order as the expected array.
   * 1. Each text value from the expected array is matched by some element from the list.
   *
   * For example, consider the following list:
   *
   * ```html
   * <ul>
   *   <li>Item Text 1</li>
   *   <li>Item Text 2</li>
   *   <li>Item Text 3</li>
   * </ul>
   * ```
   *
   * Let's see how we can use the assertion:
   *
   * ```js
   * // ✓ Contains the right items in the right order
   * await expect(page.locator('ul > li')).toContainText(['Text 1', 'Text 3']);
   *
   * // ✖ Wrong order
   * await expect(page.locator('ul > li')).toContainText(['Text 3', 'Text 2']);
   *
   * // ✖ No item contains this text
   * await expect(page.locator('ul > li')).toContainText(['Some 33']);
   *
   * // ✖ Locator points to the outer list element, not to the list items
   * await expect(page.locator('ul')).toContainText(['Text 3']);
   * ```
   *
   * @param expected Expected substring or RegExp or a list of those.
   * @param options
   */
  toContainText(
    expected: string | RegExp | Array<string | RegExp>,
    options?: {
      /**
       * Whether to perform case-insensitive match. `ignoreCase` option takes precedence over the corresponding regular
       * expression flag if specified.
       */
      ignoreCase?: boolean;

      /**
       * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
       */
      timeout?: number;

      /**
       * Whether to use `element.innerText` instead of `element.textContent` when retrieving DOM node text.
       */
      useInnerText?: boolean;
    }
  ): Promise<void>;

  /**
   * Ensures the [Locator] points to an element with given attribute.
   *
   * ```js
   * const locator = page.locator('input');
   * await expect(locator).toHaveAttribute('type', 'text');
   * ```
   *
   * @param name Attribute name.
   * @param value Expected attribute value.
   * @param options
   */
  toHaveAttribute(
    name: string,
    value: string | RegExp,
    options?: {
      /**
       * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
       */
      timeout?: number;
    }
  ): Promise<void>;

  /**
   * Ensures the [Locator] points to an element with given CSS classes. This needs to be a full match or using a relaxed
   * regular expression.
   *
   * ```html
   * <div class='selected row' id='component'></div>
   * ```
   *
   * ```js
   * const locator = page.locator('#component');
   * await expect(locator).toHaveClass(/selected/);
   * await expect(locator).toHaveClass('selected row');
   * ```
   *
   * Note that if array is passed as an expected value, entire lists of elements can be asserted:
   *
   * ```js
   * const locator = page.locator('list > .component');
   * await expect(locator).toHaveClass(['component', 'component selected', 'component']);
   * ```
   *
   * @param expected Expected class or RegExp or a list of those.
   * @param options
   */
  toHaveClass(
    expected: string | RegExp | Array<string | RegExp>,
    options?: {
      /**
       * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
       */
      timeout?: number;
    }
  ): Promise<void>;

  /**
   * Ensures the [Locator] resolves to an exact number of DOM nodes.
   *
   * ```js
   * const list = page.locator('list > .component');
   * await expect(list).toHaveCount(3);
   * ```
   *
   * @param count Expected count.
   * @param options
   */
  toHaveCount(
    count: number,
    options?: {
      /**
       * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
       */
      timeout?: number;
    }
  ): Promise<void>;

  /**
   * Ensures the [Locator] resolves to an element with the given computed CSS style.
   *
   * ```js
   * const locator = page.getByRole('button');
   * await expect(locator).toHaveCSS('display', 'flex');
   * ```
   *
   * @param name CSS property name.
   * @param value CSS property value.
   * @param options
   */
  toHaveCSS(
    name: string,
    value: string | RegExp,
    options?: {
      /**
       * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
       */
      timeout?: number;
    }
  ): Promise<void>;

  /**
   * Ensures the [Locator] points to an element with the given DOM Node ID.
   *
   * ```js
   * const locator = page.getByRole('textbox');
   * await expect(locator).toHaveId('lastname');
   * ```
   *
   * @param id Element id.
   * @param options
   */
  toHaveId(
    id: string | RegExp,
    options?: {
      /**
       * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
       */
      timeout?: number;
    }
  ): Promise<void>;

  /**
   * Ensures the [Locator] points to an element with given JavaScript property. Note that this property can be of a primitive
   * type as well as a plain serializable JavaScript object.
   *
   * ```js
   * const locator = page.locator('.component');
   * await expect(locator).toHaveJSProperty('loaded', true);
   * ```
   *
   * @param name Property name.
   * @param value Property value.
   * @param options
   */
  toHaveJSProperty(
    name: string,
    value: any,
    options?: {
      /**
       * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
       */
      timeout?: number;
    }
  ): Promise<void>;

  /**
   * This function will wait until two consecutive locator screenshots yield the same result, and then compare the last
   * screenshot with the expectation.
   *
   * ```js
   * const locator = page.getByRole('button');
   * await expect(locator).toHaveScreenshot('image.png');
   * ```
   *
   * @param name Snapshot name.
   * @param options
   */
  toHaveScreenshot(
    name: string | Array<string>,
    options?: {
      /**
       * When set to `"disabled"`, stops CSS animations, CSS transitions and Web Animations. Animations get different treatment
       * depending on their duration:
       * - finite animations are fast-forwarded to completion, so they'll fire `transitionend` event.
       * - infinite animations are canceled to initial state, and then played over after the screenshot.
       *
       * Defaults to `"disabled"` that disables animations.
       */
      animations?: 'disabled' | 'allow';

      /**
       * When set to `"hide"`, screenshot will hide text caret. When set to `"initial"`, text caret behavior will not be changed.
       * Defaults to `"hide"`.
       */
      caret?: 'hide' | 'initial';

      /**
       * Specify locators that should be masked when the screenshot is taken. Masked elements will be overlaid with a pink box
       * `#FF00FF` that completely covers its bounding box.
       */
      mask?: Array<Locator>;

      /**
       * An acceptable ratio of pixels that are different to the total amount of pixels, between `0` and `1`. Default is
       * configurable with `TestConfig.expect`. Unset by default.
       */
      maxDiffPixelRatio?: number;

      /**
       * An acceptable amount of pixels that could be different. Default is configurable with `TestConfig.expect`. Unset by
       * default.
       */
      maxDiffPixels?: number;

      /**
       * Hides default white background and allows capturing screenshots with transparency. Not applicable to `jpeg` images.
       * Defaults to `false`.
       */
      omitBackground?: boolean;

      /**
       * When set to `"css"`, screenshot will have a single pixel per each css pixel on the page. For high-dpi devices, this will
       * keep screenshots small. Using `"device"` option will produce a single pixel per each device pixel, so screenhots of
       * high-dpi devices will be twice as large or even larger.
       *
       * Defaults to `"css"`.
       */
      scale?: 'css' | 'device';

      /**
       * An acceptable perceived color difference in the [YIQ color space](https://en.wikipedia.org/wiki/YIQ) between the same
       * pixel in compared images, between zero (strict) and one (lax), default is configurable with `TestConfig.expect`.
       * Defaults to `0.2`.
       */
      threshold?: number;

      /**
       * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
       */
      timeout?: number;
    }
  ): Promise<void>;

  /**
   * This function will wait until two consecutive locator screenshots yield the same result, and then compare the last
   * screenshot with the expectation.
   *
   * ```js
   * const locator = page.getByRole('button');
   * await expect(locator).toHaveScreenshot();
   * ```
   *
   * @param options
   */
  toHaveScreenshot(options?: {
    /**
     * When set to `"disabled"`, stops CSS animations, CSS transitions and Web Animations. Animations get different treatment
     * depending on their duration:
     * - finite animations are fast-forwarded to completion, so they'll fire `transitionend` event.
     * - infinite animations are canceled to initial state, and then played over after the screenshot.
     *
     * Defaults to `"disabled"` that disables animations.
     */
    animations?: 'disabled' | 'allow';

    /**
     * When set to `"hide"`, screenshot will hide text caret. When set to `"initial"`, text caret behavior will not be changed.
     * Defaults to `"hide"`.
     */
    caret?: 'hide' | 'initial';

    /**
     * Specify locators that should be masked when the screenshot is taken. Masked elements will be overlaid with a pink box
     * `#FF00FF` that completely covers its bounding box.
     */
    mask?: Array<Locator>;

    /**
     * An acceptable ratio of pixels that are different to the total amount of pixels, between `0` and `1`. Default is
     * configurable with `TestConfig.expect`. Unset by default.
     */
    maxDiffPixelRatio?: number;

    /**
     * An acceptable amount of pixels that could be different. Default is configurable with `TestConfig.expect`. Unset by
     * default.
     */
    maxDiffPixels?: number;

    /**
     * Hides default white background and allows capturing screenshots with transparency. Not applicable to `jpeg` images.
     * Defaults to `false`.
     */
    omitBackground?: boolean;

    /**
     * When set to `"css"`, screenshot will have a single pixel per each css pixel on the page. For high-dpi devices, this will
     * keep screenshots small. Using `"device"` option will produce a single pixel per each device pixel, so screenhots of
     * high-dpi devices will be twice as large or even larger.
     *
     * Defaults to `"css"`.
     */
    scale?: 'css' | 'device';

    /**
     * An acceptable perceived color difference in the [YIQ color space](https://en.wikipedia.org/wiki/YIQ) between the same
     * pixel in compared images, between zero (strict) and one (lax), default is configurable with `TestConfig.expect`.
     * Defaults to `0.2`.
     */
    threshold?: number;

    /**
     * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator] points to an element with the given text. You can use regular expressions for the value as well.
   *
   * ```js
   * const locator = page.locator('.title');
   * await expect(locator).toHaveText(/Welcome, Test User/);
   * await expect(locator).toHaveText(/Welcome, .*\/);
   * ```
   *
   * If you pass an array as an expected value, the expectations are:
   * 1. Locator resolves to a list of elements.
   * 1. The number of elements equals the number of expected values in the array.
   * 1. Elements from the list have text matching expected array values, one by one, in order.
   *
   * For example, consider the following list:
   *
   * ```html
   * <ul>
   *   <li>Text 1</li>
   *   <li>Text 2</li>
   *   <li>Text 3</li>
   * </ul>
   * ```
   *
   * Let's see how we can use the assertion:
   *
   * ```js
   * // ✓ Has the right items in the right order
   * await expect(page.locator('ul > li')).toHaveText(['Text 1', 'Text 2', 'Text 3']);
   *
   * // ✖ Wrong order
   * await expect(page.locator('ul > li')).toHaveText(['Text 3', 'Text 2', 'Text 1']);
   *
   * // ✖ Last item does not match
   * await expect(page.locator('ul > li')).toHaveText(['Text 1', 'Text 2', 'Text']);
   *
   * // ✖ Locator points to the outer list element, not to the list items
   * await expect(page.locator('ul')).toHaveText(['Text 1', 'Text 2', 'Text 3']);
   * ```
   *
   * @param expected Expected substring or RegExp or a list of those.
   * @param options
   */
  toHaveText(
    expected: string | RegExp | Array<string | RegExp>,
    options?: {
      /**
       * Whether to perform case-insensitive match. `ignoreCase` option takes precedence over the corresponding regular
       * expression flag if specified.
       */
      ignoreCase?: boolean;

      /**
       * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
       */
      timeout?: number;

      /**
       * Whether to use `element.innerText` instead of `element.textContent` when retrieving DOM node text.
       */
      useInnerText?: boolean;
    }
  ): Promise<void>;

  /**
   * Ensures the [Locator] points to an element with the given input value. You can use regular expressions for the value as
   * well.
   *
   * ```js
   * const locator = page.locator('input[type=number]');
   * await expect(locator).toHaveValue(/[0-9]/);
   * ```
   *
   * @param value Expected value.
   * @param options
   */
  toHaveValue(
    value: string | RegExp,
    options?: {
      /**
       * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
       */
      timeout?: number;
    }
  ): Promise<void>;

  /**
   * Ensures the [Locator] points to multi-select/combobox (i.e. a `select` with the `multiple` attribute) and the specified
   * values are selected.
   *
   * For example, given the following element:
   *
   * ```html
   * <select id="favorite-colors" multiple>
   *   <option value="R">Red</option>
   *   <option value="G">Green</option>
   *   <option value="B">Blue</option>
   * </select>
   * ```
   *
   * ```js
   * const locator = page.locator("id=favorite-colors");
   * await locator.selectOption(["R", "G"]);
   * await expect(locator).toHaveValues([/R/, /G/]);
   * ```
   *
   * @param values Expected options currently selected.
   * @param options
   */
  toHaveValues(
    values: Array<string | RegExp>,
    options?: {
      /**
       * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
       */
      timeout?: number;
    }
  ): Promise<void>;
}

/**
 * The [PageAssertions] class provides assertion methods that can be used to make assertions about the [Page] state in the
 * tests. A new instance of [PageAssertions] is created by calling
 * [expect(page)](https://playwright.dev/docs/api/class-playwrightassertions#playwright-assertions-expect-page):
 *
 * ```js
 * import { test, expect } from '@playwright/test';
 *
 * test('navigates to login', async ({ page }) => {
 *   // ...
 *   await page.getByText('Sign in').click();
 *   await expect(page).toHaveURL(/.*\/login/);
 * });
 * ```
 *
 */
interface PageAssertions {
  /**
   * Makes the assertion check for the opposite condition. For example, this code tests that the page URL doesn't contain
   * `"error"`:
   *
   * ```js
   * await expect(page).not.toHaveURL('error');
   * ```
   *
   */
  not: Matchers<any>;

  /**
   * This function will wait until two consecutive page screenshots yield the same result, and then compare the last
   * screenshot with the expectation.
   *
   * ```js
   * await expect(page).toHaveScreenshot('image.png');
   * ```
   *
   * @param name Snapshot name.
   * @param options
   */
  toHaveScreenshot(
    name: string | Array<string>,
    options?: {
      /**
       * When set to `"disabled"`, stops CSS animations, CSS transitions and Web Animations. Animations get different treatment
       * depending on their duration:
       * - finite animations are fast-forwarded to completion, so they'll fire `transitionend` event.
       * - infinite animations are canceled to initial state, and then played over after the screenshot.
       *
       * Defaults to `"disabled"` that disables animations.
       */
      animations?: 'disabled' | 'allow';

      /**
       * When set to `"hide"`, screenshot will hide text caret. When set to `"initial"`, text caret behavior will not be changed.
       * Defaults to `"hide"`.
       */
      caret?: 'hide' | 'initial';

      /**
       * An object which specifies clipping of the resulting image. Should have the following fields:
       */
      clip?: {
        /**
         * x-coordinate of top-left corner of clip area
         */
        x: number;

        /**
         * y-coordinate of top-left corner of clip area
         */
        y: number;

        /**
         * width of clipping area
         */
        width: number;

        /**
         * height of clipping area
         */
        height: number;
      };

      /**
       * When true, takes a screenshot of the full scrollable page, instead of the currently visible viewport. Defaults to
       * `false`.
       */
      fullPage?: boolean;

      /**
       * Specify locators that should be masked when the screenshot is taken. Masked elements will be overlaid with a pink box
       * `#FF00FF` that completely covers its bounding box.
       */
      mask?: Array<Locator>;

      /**
       * An acceptable ratio of pixels that are different to the total amount of pixels, between `0` and `1`. Default is
       * configurable with `TestConfig.expect`. Unset by default.
       */
      maxDiffPixelRatio?: number;

      /**
       * An acceptable amount of pixels that could be different. Default is configurable with `TestConfig.expect`. Unset by
       * default.
       */
      maxDiffPixels?: number;

      /**
       * Hides default white background and allows capturing screenshots with transparency. Not applicable to `jpeg` images.
       * Defaults to `false`.
       */
      omitBackground?: boolean;

      /**
       * When set to `"css"`, screenshot will have a single pixel per each css pixel on the page. For high-dpi devices, this will
       * keep screenshots small. Using `"device"` option will produce a single pixel per each device pixel, so screenhots of
       * high-dpi devices will be twice as large or even larger.
       *
       * Defaults to `"css"`.
       */
      scale?: 'css' | 'device';

      /**
       * An acceptable perceived color difference in the [YIQ color space](https://en.wikipedia.org/wiki/YIQ) between the same
       * pixel in compared images, between zero (strict) and one (lax), default is configurable with `TestConfig.expect`.
       * Defaults to `0.2`.
       */
      threshold?: number;

      /**
       * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
       */
      timeout?: number;
    }
  ): Promise<void>;

  /**
   * This function will wait until two consecutive page screenshots yield the same result, and then compare the last
   * screenshot with the expectation.
   *
   * ```js
   * await expect(page).toHaveScreenshot();
   * ```
   *
   * @param options
   */
  toHaveScreenshot(options?: {
    /**
     * When set to `"disabled"`, stops CSS animations, CSS transitions and Web Animations. Animations get different treatment
     * depending on their duration:
     * - finite animations are fast-forwarded to completion, so they'll fire `transitionend` event.
     * - infinite animations are canceled to initial state, and then played over after the screenshot.
     *
     * Defaults to `"disabled"` that disables animations.
     */
    animations?: 'disabled' | 'allow';

    /**
     * When set to `"hide"`, screenshot will hide text caret. When set to `"initial"`, text caret behavior will not be changed.
     * Defaults to `"hide"`.
     */
    caret?: 'hide' | 'initial';

    /**
     * An object which specifies clipping of the resulting image. Should have the following fields:
     */
    clip?: {
      /**
       * x-coordinate of top-left corner of clip area
       */
      x: number;

      /**
       * y-coordinate of top-left corner of clip area
       */
      y: number;

      /**
       * width of clipping area
       */
      width: number;

      /**
       * height of clipping area
       */
      height: number;
    };

    /**
     * When true, takes a screenshot of the full scrollable page, instead of the currently visible viewport. Defaults to
     * `false`.
     */
    fullPage?: boolean;

    /**
     * Specify locators that should be masked when the screenshot is taken. Masked elements will be overlaid with a pink box
     * `#FF00FF` that completely covers its bounding box.
     */
    mask?: Array<Locator>;

    /**
     * An acceptable ratio of pixels that are different to the total amount of pixels, between `0` and `1`. Default is
     * configurable with `TestConfig.expect`. Unset by default.
     */
    maxDiffPixelRatio?: number;

    /**
     * An acceptable amount of pixels that could be different. Default is configurable with `TestConfig.expect`. Unset by
     * default.
     */
    maxDiffPixels?: number;

    /**
     * Hides default white background and allows capturing screenshots with transparency. Not applicable to `jpeg` images.
     * Defaults to `false`.
     */
    omitBackground?: boolean;

    /**
     * When set to `"css"`, screenshot will have a single pixel per each css pixel on the page. For high-dpi devices, this will
     * keep screenshots small. Using `"device"` option will produce a single pixel per each device pixel, so screenhots of
     * high-dpi devices will be twice as large or even larger.
     *
     * Defaults to `"css"`.
     */
    scale?: 'css' | 'device';

    /**
     * An acceptable perceived color difference in the [YIQ color space](https://en.wikipedia.org/wiki/YIQ) between the same
     * pixel in compared images, between zero (strict) and one (lax), default is configurable with `TestConfig.expect`.
     * Defaults to `0.2`.
     */
    threshold?: number;

    /**
     * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the page has the given title.
   *
   * ```js
   * await expect(page).toHaveTitle(/.*checkout/);
   * ```
   *
   * @param titleOrRegExp Expected title or RegExp.
   * @param options
   */
  toHaveTitle(
    titleOrRegExp: string | RegExp,
    options?: {
      /**
       * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
       */
      timeout?: number;
    }
  ): Promise<void>;

  /**
   * Ensures the page is navigated to the given URL.
   *
   * ```js
   * await expect(page).toHaveURL(/.*checkout/);
   * ```
   *
   * @param urlOrRegExp Expected URL string or RegExp.
   * @param options
   */
  toHaveURL(
    urlOrRegExp: string | RegExp,
    options?: {
      /**
       * Time to retry the assertion for. Defaults to `timeout` in `TestConfig.expect`.
       */
      timeout?: number;
    }
  ): Promise<void>;
}

interface APIResponseAssertions {
  /**
   * Makes the assertion check for the opposite condition. For example, this code tests that the response status is not
   * successful:
   *
   * ```js
   * await expect(response).not.toBeOK();
   * ```
   *
   */
  not: Matchers<any>;

  /**
   * Ensures the response status code is within `200..299` range.
   *
   * ```js
   * await expect(response).toBeOK();
   * ```
   *
   */
  toBeOK(): Promise<void>;
}
