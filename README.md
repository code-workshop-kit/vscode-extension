# code-workshop-kit

This extension is part of [code-workshop-kit](https://code-workshop-kit.com),
aimed at making the workshop experience smoother by leveraging VS Code
and VS Code Live Share extension.

## Features

- Finds your `cwk.config.js` file, and updates the array of
  participants whenever a new user joins your Live Share session
- Automatically scaffold workshop files for newly joined participants
- Integration with [CodeStatus](https://github.com/lostintangent/codestatus)
  through commands `CWK: Sync GitHub Status` and `CWK: Desync GitHub Status`

Coming soon:

- Once Live Share implements [file access control hook](https://github.com/MicrosoftDocs/live-share/issues/4037),
  opt-in to preventing participants from seeing files from other participants

## Requirements

This extension works in conjunction with [code-workshop-kit](https://www.npmjs.com/package/code-workshop-kit),
so it is advisable to only use it when you use CWK.

## Extension Settings

No settings yet.

## Known Issues

You can't really turn it off easily. Will add that later.

## Release Notes

[See the changelog](./CHANGELOG.md)
