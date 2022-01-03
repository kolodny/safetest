import { Page } from 'playwright';
import { Fns } from './types';

type Callback = (page: Page) => Promise<void>;
export interface Hooks {
  /** Stuff to do before navigating the page to the element to test */
  beforeNavigate: Callback[];
  /** Stuff to do before closing the page, like saving the video or coverage info */
  beforeClose: Callback[];
  /** Stuff to do after closing the page, like renaming the saved video file */
  afterClose: Callback[];
  /** Stuff to do in the afterEach */
  afterTest: Callback[];
}
export interface SafePage extends Page {
  /** Internal properties used by safetest */
  _safetest_internal: {
    /** Used to track which test the current tab belongs to, needed for tests that open multiple tabs */
    ownerOfTest: string;
    coverageDir?: string;
    videoDir?: string;
    failureScreenshotDir?: string;
    /** We may monkey patch page methods, here we store the original method */
    originalMethods: Fns<Page>;
    hooks: Hooks;
    /** Magic value to serialize and deserialize functions over the __page_channel__ */
    fnPrefix: string;
    renderIsReadyResolve?: () => void;
  };
}
