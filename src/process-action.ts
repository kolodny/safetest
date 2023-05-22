import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { camelCase } from 'lodash';

import { FormattedTestResults } from '@jest/test-result';
import { ensureDir } from './ensure-dir';

const parsed = Object.fromEntries(
  process.argv
    .map((arg) => arg.match(/(?<=--)([^=]*)(?:=(.*))?/)?.slice(1))
    .map((item) => {
      let value: any = item?.[1];
      if (value === 'false') value = false;
      else if (value === 'true') value = true;
      else if (value === undefined) value = true;
      else if (value === 'undefined') value = undefined;
      else if (!isNaN(parseFloat(value))) value = +value;
      return [camelCase(item?.[0]), value];
    })
    .filter(Boolean)
);

console.log(parsed);
