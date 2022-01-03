#!/bin/bash

for VARIABLE in "create-react-app" "vite-react" "vitest" "vite-vue" "mocha" "esbuild" "vite-svelte" "ng-app"
do
  cd "examples/$VARIABLE"
  npm install
	cd ../../
done
