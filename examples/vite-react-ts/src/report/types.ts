import { type MergedResults } from 'safetest';

export { type MergedResults };

export type File = MergedResults['testResults'][number];

export type Result = File['assertionResults'][number];

export type Status = Result['status'];

export type Test = Result & { id: string; parent: Suite };

export type Suite = {
  name: string;
  id: string;
  suites: Record<string, Suite>;
  tests: Record<string, Test>;
  parent?: Suite;
};
export type ArtifactType = keyof NonNullable<Result['artifacts']>;
