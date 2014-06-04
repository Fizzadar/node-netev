#!/bin/bash

VERSION=`cat package.json | grep -oEi '[0-9]+.[0-9]+.[0-9]+'`

echo "# node-netev"
echo "# Releasing: v$VERSION"

git tag -a "v$VERSION" -m "v$VERSION"
git push --tags
npm publish

echo "# Done!"