# code-workshop-kit

## 0.2.0

### Minor Changes

- fda370f: Participants that leave, have their folder moved to \_cwk_disconnected. Upon rejoining, it is moved back to the original place so no code is lost. CWK itself will ignore \_cwk_disconnected as a participant so it is hidden from the workshop.

## 0.1.1

### Patch Changes

- 71b8c0e: Use vscode.workspace.fs for creating / writing to files to mitigate desync issues. Don't count session end as a participant-join event.

## 0.1.0

### Minor Changes

- 355226d: Peers joining the Live Share session are now automatically added to the cwk.config.js. Additionally, it will automatically scaffold files for them to get started.

## 0.0.1

### Patch Changes

- First release of code-workshop-kit extension. Takes the user session id from live share and adds the user to the cwk.config.js
