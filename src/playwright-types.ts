import { Locator } from 'playwright-core';

export type Matchers<T> = LocatorAssertions &
  PageAssertions &
  APIResponseAssertions &
  jest.JestMatchers<T> & {
    not: Matchers<any>
  };

interface LocatorAssertions {
  /**
   * Ensures that [Locator](https://playwright.dev/docs/api/class-locator) points to an element that is
   * [connected](https://developer.mozilla.org/en-US/docs/Web/API/Node/isConnected) to a Document or a ShadowRoot.
   *
   * **Usage**
   *
   * ```js
   * await expect(page.getByText('Hidden text')).toBeAttached();
   * ```
   *
   * @param options
   */
  toBeAttached(options?: {
    attached?: boolean;

    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator](https://playwright.dev/docs/api/class-locator) points to a checked input.
   *
   * **Usage**
   *
   * ```js
   * const locator = page.getByLabel('Subscribe to newsletter');
   * await expect(locator).toBeChecked();
   * ```
   *
   * @param options
   */
  toBeChecked(options?: {
    /**
     * Provides state to assert for. Asserts for input to be checked by default. This option can't be used when
     * [`indeterminate`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-checked-option-indeterminate)
     * is set to true.
     */
    checked?: boolean;

    /**
     * Asserts that the element is in the indeterminate (mixed) state. Only supported for checkboxes and radio buttons.
     * This option can't be true when
     * [`checked`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-checked-option-checked)
     * is provided.
     */
    indeterminate?: boolean;

    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator](https://playwright.dev/docs/api/class-locator) points to a disabled element. Element is
   * disabled if it has "disabled" attribute or is disabled via
   * ['aria-disabled'](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-disabled). Note
   * that only native control elements such as HTML `button`, `input`, `select`, `textarea`, `option`, `optgroup` can be
   * disabled by setting "disabled" attribute. "disabled" attribute on other elements is ignored by the browser.
   *
   * **Usage**
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
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator](https://playwright.dev/docs/api/class-locator) points to an editable element.
   *
   * **Usage**
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
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator](https://playwright.dev/docs/api/class-locator) points to an empty editable element or to a
   * DOM node that has no text.
   *
   * **Usage**
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
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator](https://playwright.dev/docs/api/class-locator) points to an enabled element.
   *
   * **Usage**
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
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator](https://playwright.dev/docs/api/class-locator) points to a focused DOM node.
   *
   * **Usage**
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
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures that [Locator](https://playwright.dev/docs/api/class-locator) either does not resolve to any DOM node, or
   * resolves to a [non-visible](https://playwright.dev/docs/actionability#visible) one.
   *
   * **Usage**
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
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator](https://playwright.dev/docs/api/class-locator) points to an element that intersects viewport,
   * according to the
   * [intersection observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).
   *
   * **Usage**
   *
   * ```js
   * const locator = page.getByRole('button');
   * // Make sure at least some part of element intersects viewport.
   * await expect(locator).toBeInViewport();
   * // Make sure element is fully outside of viewport.
   * await expect(locator).not.toBeInViewport();
   * // Make sure that at least half of the element intersects viewport.
   * await expect(locator).toBeInViewport({ ratio: 0.5 });
   * ```
   *
   * @param options
   */
  toBeInViewport(options?: {
    /**
     * The minimal ratio of the element to intersect viewport. If equals to `0`, then element should intersect viewport at
     * any positive ratio. Defaults to `0`.
     */
    ratio?: number;

    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures that [Locator](https://playwright.dev/docs/api/class-locator) points to an attached and
   * [visible](https://playwright.dev/docs/actionability#visible) DOM node.
   *
   * To check that at least one element from the list is visible, use
   * [locator.first()](https://playwright.dev/docs/api/class-locator#locator-first).
   *
   * **Usage**
   *
   * ```js
   * // A specific element is visible.
   * await expect(page.getByText('Welcome')).toBeVisible();
   *
   * // At least one item in the list is visible.
   * await expect(page.getByTestId('todo-item').first()).toBeVisible();
   *
   * // At least one of the two elements is visible, possibly both.
   * await expect(
   *     page.getByRole('button', { name: 'Sign in' })
   *         .or(page.getByRole('button', { name: 'Sign up' }))
   *         .first()
   * ).toBeVisible();
   * ```
   *
   * @param options
   */
  toBeVisible(options?: {
    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;

    visible?: boolean;
  }): Promise<void>;

  /**
   * Ensures the [Locator](https://playwright.dev/docs/api/class-locator) points to an element that contains the given
   * text. All nested elements will be considered when computing the text content of the element. You can use regular
   * expressions for the value as well.
   *
   * **Details**
   *
   * When `expected` parameter is a string, Playwright will normalize whitespaces and line breaks both in the actual
   * text and in the expected string before matching. When regular expression is used, the actual text is matched as is.
   *
   * **Usage**
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
  toContainText(expected: string|RegExp|ReadonlyArray<string|RegExp>, options?: {
    /**
     * Whether to perform case-insensitive match.
     * [`ignoreCase`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-contain-text-option-ignore-case)
     * option takes precedence over the corresponding regular expression flag if specified.
     */
    ignoreCase?: boolean;

    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;

    /**
     * Whether to use `element.innerText` instead of `element.textContent` when retrieving DOM node text.
     */
    useInnerText?: boolean;
  }): Promise<void>;

  /**
   * Ensures the [Locator](https://playwright.dev/docs/api/class-locator) points to an element with a given
   * [accessible description](https://w3c.github.io/accname/#dfn-accessible-description).
   *
   * **Usage**
   *
   * ```js
   * const locator = page.getByTestId('save-button');
   * await expect(locator).toHaveAccessibleDescription('Save results to disk');
   * ```
   *
   * @param description Expected accessible description.
   * @param options
   */
  toHaveAccessibleDescription(description: string|RegExp, options?: {
    /**
     * Whether to perform case-insensitive match.
     * [`ignoreCase`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-accessible-description-option-ignore-case)
     * option takes precedence over the corresponding regular expression flag if specified.
     */
    ignoreCase?: boolean;

    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator](https://playwright.dev/docs/api/class-locator) points to an element with a given
   * [aria errormessage](https://w3c.github.io/aria/#aria-errormessage).
   *
   * **Usage**
   *
   * ```js
   * const locator = page.getByTestId('username-input');
   * await expect(locator).toHaveAccessibleErrorMessage('Username is required.');
   * ```
   *
   * @param errorMessage Expected accessible error message.
   * @param options
   */
  toHaveAccessibleErrorMessage(errorMessage: string|RegExp, options?: {
    /**
     * Whether to perform case-insensitive match.
     * [`ignoreCase`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-accessible-error-message-option-ignore-case)
     * option takes precedence over the corresponding regular expression flag if specified.
     */
    ignoreCase?: boolean;

    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator](https://playwright.dev/docs/api/class-locator) points to an element with a given
   * [accessible name](https://w3c.github.io/accname/#dfn-accessible-name).
   *
   * **Usage**
   *
   * ```js
   * const locator = page.getByTestId('save-button');
   * await expect(locator).toHaveAccessibleName('Save to disk');
   * ```
   *
   * @param name Expected accessible name.
   * @param options
   */
  toHaveAccessibleName(name: string|RegExp, options?: {
    /**
     * Whether to perform case-insensitive match.
     * [`ignoreCase`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-accessible-name-option-ignore-case)
     * option takes precedence over the corresponding regular expression flag if specified.
     */
    ignoreCase?: boolean;

    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator](https://playwright.dev/docs/api/class-locator) points to an element with given attribute.
   *
   * **Usage**
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
  toHaveAttribute(name: string, value: string|RegExp, options?: {
    /**
     * Whether to perform case-insensitive match.
     * [`ignoreCase`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-attribute-option-ignore-case)
     * option takes precedence over the corresponding regular expression flag if specified.
     */
    ignoreCase?: boolean;

    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator](https://playwright.dev/docs/api/class-locator) points to an element with given attribute. The
   * method will assert attribute presence.
   *
   * ```js
   * const locator = page.locator('input');
   * // Assert attribute existence.
   * await expect(locator).toHaveAttribute('disabled');
   * await expect(locator).not.toHaveAttribute('open');
   * ```
   *
   * @param name Attribute name.
   * @param options
   */
  toHaveAttribute(name: string, options?: {
    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator](https://playwright.dev/docs/api/class-locator) points to an element with given CSS classes.
   * When a string is provided, it must fully match the element's `class` attribute. To match individual classes or
   * perform partial matches, use a regular expression:
   *
   * **Usage**
   *
   * ```html
   * <div class='middle selected row' id='component'></div>
   * ```
   *
   * ```js
   * const locator = page.locator('#component');
   * await expect(locator).toHaveClass('middle selected row');
   * await expect(locator).toHaveClass(/(^|\s)selected(\s|$)/);
   * ```
   *
   * When an array is passed, the method asserts that the list of elements located matches the corresponding list of
   * expected class values. Each element's class attribute is matched against the corresponding string or regular
   * expression in the array:
   *
   * ```js
   * const locator = page.locator('list > .component');
   * await expect(locator).toHaveClass(['component', 'component selected', 'component']);
   * ```
   *
   * @param expected Expected class or RegExp or a list of those.
   * @param options
   */
  toHaveClass(expected: string|RegExp|ReadonlyArray<string|RegExp>, options?: {
    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator](https://playwright.dev/docs/api/class-locator) resolves to an exact number of DOM nodes.
   *
   * **Usage**
   *
   * ```js
   * const list = page.locator('list > .component');
   * await expect(list).toHaveCount(3);
   * ```
   *
   * @param count Expected count.
   * @param options
   */
  toHaveCount(count: number, options?: {
    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator](https://playwright.dev/docs/api/class-locator) resolves to an element with the given computed
   * CSS style.
   *
   * **Usage**
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
  toHaveCSS(name: string, value: string|RegExp, options?: {
    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator](https://playwright.dev/docs/api/class-locator) points to an element with the given DOM Node
   * ID.
   *
   * **Usage**
   *
   * ```js
   * const locator = page.getByRole('textbox');
   * await expect(locator).toHaveId('lastname');
   * ```
   *
   * @param id Element id.
   * @param options
   */
  toHaveId(id: string|RegExp, options?: {
    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator](https://playwright.dev/docs/api/class-locator) points to an element with given JavaScript
   * property. Note that this property can be of a primitive type as well as a plain serializable JavaScript object.
   *
   * **Usage**
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
  toHaveJSProperty(name: string, value: any, options?: {
    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator](https://playwright.dev/docs/api/class-locator) points to an element with a given
   * [ARIA role](https://www.w3.org/TR/wai-aria-1.2/#roles).
   *
   * Note that role is matched as a string, disregarding the ARIA role hierarchy. For example, asserting  a superclass
   * role `"checkbox"` on an element with a subclass role `"switch"` will fail.
   *
   * **Usage**
   *
   * ```js
   * const locator = page.getByTestId('save-button');
   * await expect(locator).toHaveRole('button');
   * ```
   *
   * @param role Required aria role.
   * @param options
   */
  toHaveRole(role: "alert"|"alertdialog"|"application"|"article"|"banner"|"blockquote"|"button"|"caption"|"cell"|"checkbox"|"code"|"columnheader"|"combobox"|"complementary"|"contentinfo"|"definition"|"deletion"|"dialog"|"directory"|"document"|"emphasis"|"feed"|"figure"|"form"|"generic"|"grid"|"gridcell"|"group"|"heading"|"img"|"insertion"|"link"|"list"|"listbox"|"listitem"|"log"|"main"|"marquee"|"math"|"meter"|"menu"|"menubar"|"menuitem"|"menuitemcheckbox"|"menuitemradio"|"navigation"|"none"|"note"|"option"|"paragraph"|"presentation"|"progressbar"|"radio"|"radiogroup"|"region"|"row"|"rowgroup"|"rowheader"|"scrollbar"|"search"|"searchbox"|"separator"|"slider"|"spinbutton"|"status"|"strong"|"subscript"|"superscript"|"switch"|"tab"|"table"|"tablist"|"tabpanel"|"term"|"textbox"|"time"|"timer"|"toolbar"|"tooltip"|"tree"|"treegrid"|"treeitem", options?: {
    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * This function will wait until two consecutive locator screenshots yield the same result, and then compare the last
   * screenshot with the expectation.
   *
   * **Usage**
   *
   * ```js
   * const locator = page.getByRole('button');
   * await expect(locator).toHaveScreenshot('image.png');
   * ```
   *
   * Note that screenshot assertions only work with Playwright test runner.
   * @param name Snapshot name.
   * @param options
   */
  toHaveScreenshot(name: string|ReadonlyArray<string>, options?: {
    /**
     * When set to `"disabled"`, stops CSS animations, CSS transitions and Web Animations. Animations get different
     * treatment depending on their duration:
     * - finite animations are fast-forwarded to completion, so they'll fire `transitionend` event.
     * - infinite animations are canceled to initial state, and then played over after the screenshot.
     *
     * Defaults to `"disabled"` that disables animations.
     */
    animations?: "disabled"|"allow";

    /**
     * When set to `"hide"`, screenshot will hide text caret. When set to `"initial"`, text caret behavior will not be
     * changed.  Defaults to `"hide"`.
     */
    caret?: "hide"|"initial";

    /**
     * Specify locators that should be masked when the screenshot is taken. Masked elements will be overlaid with a pink
     * box `#FF00FF` (customized by
     * [`maskColor`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-screenshot-1-option-mask-color))
     * that completely covers its bounding box.
     */
    mask?: Array<Locator>;

    /**
     * Specify the color of the overlay box for masked elements, in
     * [CSS color format](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value). Default color is pink `#FF00FF`.
     */
    maskColor?: string;

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
     * When set to `"css"`, screenshot will have a single pixel per each css pixel on the page. For high-dpi devices, this
     * will keep screenshots small. Using `"device"` option will produce a single pixel per each device pixel, so
     * screenshots of high-dpi devices will be twice as large or even larger.
     *
     * Defaults to `"css"`.
     */
    scale?: "css"|"device";

    /**
     * File name containing the stylesheet to apply while making the screenshot. This is where you can hide dynamic
     * elements, make elements invisible or change their properties to help you creating repeatable screenshots. This
     * stylesheet pierces the Shadow DOM and applies to the inner frames.
     */
    stylePath?: string|Array<string>;

    /**
     * An acceptable perceived color difference in the [YIQ color space](https://en.wikipedia.org/wiki/YIQ) between the
     * same pixel in compared images, between zero (strict) and one (lax), default is configurable with
     * `TestConfig.expect`. Defaults to `0.2`.
     */
    threshold?: number;

    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * This function will wait until two consecutive locator screenshots yield the same result, and then compare the last
   * screenshot with the expectation.
   *
   * **Usage**
   *
   * ```js
   * const locator = page.getByRole('button');
   * await expect(locator).toHaveScreenshot();
   * ```
   *
   * Note that screenshot assertions only work with Playwright test runner.
   * @param options
   */
  toHaveScreenshot(options?: {
    /**
     * When set to `"disabled"`, stops CSS animations, CSS transitions and Web Animations. Animations get different
     * treatment depending on their duration:
     * - finite animations are fast-forwarded to completion, so they'll fire `transitionend` event.
     * - infinite animations are canceled to initial state, and then played over after the screenshot.
     *
     * Defaults to `"disabled"` that disables animations.
     */
    animations?: "disabled"|"allow";

    /**
     * When set to `"hide"`, screenshot will hide text caret. When set to `"initial"`, text caret behavior will not be
     * changed.  Defaults to `"hide"`.
     */
    caret?: "hide"|"initial";

    /**
     * Specify locators that should be masked when the screenshot is taken. Masked elements will be overlaid with a pink
     * box `#FF00FF` (customized by
     * [`maskColor`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-screenshot-2-option-mask-color))
     * that completely covers its bounding box.
     */
    mask?: Array<Locator>;

    /**
     * Specify the color of the overlay box for masked elements, in
     * [CSS color format](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value). Default color is pink `#FF00FF`.
     */
    maskColor?: string;

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
     * When set to `"css"`, screenshot will have a single pixel per each css pixel on the page. For high-dpi devices, this
     * will keep screenshots small. Using `"device"` option will produce a single pixel per each device pixel, so
     * screenshots of high-dpi devices will be twice as large or even larger.
     *
     * Defaults to `"css"`.
     */
    scale?: "css"|"device";

    /**
     * File name containing the stylesheet to apply while making the screenshot. This is where you can hide dynamic
     * elements, make elements invisible or change their properties to help you creating repeatable screenshots. This
     * stylesheet pierces the Shadow DOM and applies to the inner frames.
     */
    stylePath?: string|Array<string>;

    /**
     * An acceptable perceived color difference in the [YIQ color space](https://en.wikipedia.org/wiki/YIQ) between the
     * same pixel in compared images, between zero (strict) and one (lax), default is configurable with
     * `TestConfig.expect`. Defaults to `0.2`.
     */
    threshold?: number;

    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator](https://playwright.dev/docs/api/class-locator) points to an element with the given text. All
   * nested elements will be considered when computing the text content of the element. You can use regular expressions
   * for the value as well.
   *
   * **Details**
   *
   * When `expected` parameter is a string, Playwright will normalize whitespaces and line breaks both in the actual
   * text and in the expected string before matching. When regular expression is used, the actual text is matched as is.
   *
   * **Usage**
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
   * @param expected Expected string or RegExp or a list of those.
   * @param options
   */
  toHaveText(expected: string|RegExp|ReadonlyArray<string|RegExp>, options?: {
    /**
     * Whether to perform case-insensitive match.
     * [`ignoreCase`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-text-option-ignore-case)
     * option takes precedence over the corresponding regular expression flag if specified.
     */
    ignoreCase?: boolean;

    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;

    /**
     * Whether to use `element.innerText` instead of `element.textContent` when retrieving DOM node text.
     */
    useInnerText?: boolean;
  }): Promise<void>;

  /**
   * Ensures the [Locator](https://playwright.dev/docs/api/class-locator) points to an element with the given input
   * value. You can use regular expressions for the value as well.
   *
   * **Usage**
   *
   * ```js
   * const locator = page.locator('input[type=number]');
   * await expect(locator).toHaveValue(/[0-9]/);
   * ```
   *
   * @param value Expected value.
   * @param options
   */
  toHaveValue(value: string|RegExp, options?: {
    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Ensures the [Locator](https://playwright.dev/docs/api/class-locator) points to multi-select/combobox (i.e. a
   * `select` with the `multiple` attribute) and the specified values are selected.
   *
   * **Usage**
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
   * const locator = page.locator('id=favorite-colors');
   * await locator.selectOption(['R', 'G']);
   * await expect(locator).toHaveValues([/R/, /G/]);
   * ```
   *
   * @param values Expected options currently selected.
   * @param options
   */
  toHaveValues(values: ReadonlyArray<string|RegExp>, options?: {
    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Asserts that the target element matches the given [accessibility snapshot](https://playwright.dev/docs/aria-snapshots).
   *
   * **Usage**
   *
   * ```js
   * await page.goto('https://demo.playwright.dev/todomvc/');
   * await expect(page.locator('body')).toMatchAriaSnapshot(`
   *   - heading "todos"
   *   - textbox "What needs to be done?"
   * `);
   * ```
   *
   * @param expected
   * @param options
   */
  toMatchAriaSnapshot(expected: string, options?: {
    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Asserts that the target element matches the given [accessibility snapshot](https://playwright.dev/docs/aria-snapshots).
   *
   * Snapshot is stored in a separate `.yml` file in a location configured by `expect.toMatchAriaSnapshot.pathTemplate`
   * and/or `snapshotPathTemplate` properties in the configuration file.
   *
   * **Usage**
   *
   * ```js
   * await expect(page.locator('body')).toMatchAriaSnapshot();
   * await expect(page.locator('body')).toMatchAriaSnapshot({ name: 'body.yml' });
   * ```
   *
   * @param options
   */
  toMatchAriaSnapshot(options?: {
    /**
     * Name of the snapshot to store in the snapshot folder corresponding to this test. Generates sequential names if not
     * specified.
     */
    name?: string;

    /**
     * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
     */
    timeout?: number;
  }): Promise<void>;

  /**
   * Makes the assertion check for the opposite condition. For example, this code tests that the Locator doesn't contain
   * text `"error"`:
   *
   * ```js
   * await expect(locator).not.toContainText('error');
   * ```
   *
   */
  not: LocatorAssertions;
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
