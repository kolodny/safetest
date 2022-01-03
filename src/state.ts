import { BrowserContext } from 'playwright';
import { SafePage } from './safepage';
import { RenderOptions } from './get-page';

declare module 'playwright' {
  interface BrowserContext {
    pages(): SafePage[];
  }
}

export interface State {
  tests: Record<string, () => void>;
  currentSuitePlusTest: string;
  __filename: string;
  retryMap: Record<string, number>;
  activeTest?: string;
  options: RenderOptions;
  isGlobalSetupTeardownRegistered: boolean;
  debugging: Set<string>;
  passedTests: Set<string>;
  /**
   * Tests run way faster if we keep the window alive. Note: Only do this when not
   * in video mode else the video memory wreaks havoc.
   */
  browserContextInstance?: BrowserContext & {
    headless?: boolean;
  };
  /**
   * When a test is being run we need to track which element to render, this is only useful for
   * the browser side of things
   */
  browserState?: {
    retryAttempt: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderContainer: { __type: 'renderContainer'; value: any };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderElement: { __type: 'renderElement'; value: any };
  };
  renderers: {
    react?: typeof import('react-dom');
    svelte?: typeof import('svelte');
    vue?: typeof import('vue');
  };
}

export const state: State = {
  renderers: {},
  tests: {},
  retryMap: {},
  options: {},
  currentSuitePlusTest: '',
  __filename: '',
  isGlobalSetupTeardownRegistered: false,
  debugging: new Set(),
  passedTests: new Set(),
};
