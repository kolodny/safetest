import { Page } from 'playwright';
import { Deferred } from './defer';

type Callback = (page: Page) => Promise<void>;
type TestInfo = {
  testName: string | undefined;
  testPath: string;
  retryAttempt: number | undefined;
};
export interface Hooks {
  /** Stuff to do before navigating the page to the element to test */
  beforeNavigate: Callback[];
  /** Stuff to do before rendering the element to test */
  beforeRender: Array<(page: Page, info: TestInfo) => Promise<void>>;
  /** Stuff to do before closing the page, like saving the video or coverage info */
  beforeClose: Callback[];
  /** Stuff to do in the afterEach */
  afterTest: Callback[];
}
export interface SafePage extends Page {
  /** Internal properties used by safetest */
  _safetest_internal: {
    pageIndex: number;
    started: number;
    coverageDir?: string;
    videoDir?: string;
    failureScreenshotDir?: string;
    hooks: Hooks;
    /** Magic value to serialize and deserialize functions over the __page_channel__ */
    fnPrefix: string;
    renderIsReadyDeferred?: Deferred;
    safeTestExposed: boolean;
    pendingBridge: Deferred;
    /** Initial newPage() call is ready */
    pageSetupPromise?: Promise<void>;
    pauseAtEveryStep?: boolean;
  };
}
