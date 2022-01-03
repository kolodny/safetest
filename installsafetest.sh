#!/bin/bash

for VARIABLE in "create-react-app" "vite-react" "vitest" "vite-vue" "mocha" "esbuild" "vite-svelte" "ng-app"
do
  cd "examples/$VARIABLE"
  mkdir node_modules/safetest || true
  cp -r ../../{package.json,dist,react,jest,ng,svelte,mocha,vitest,vue3} node_modules/safetest
	cd ../../
done
