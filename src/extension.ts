import { workspace, window, commands, ExtensionContext } from 'vscode';

import { setupLiveShare } from './live-share';
import { syncCodeStatus, desyncCodeStatus, setupCodeStatusSessionChange } from './codeStatus';

export async function activate(context: ExtensionContext) {
  const files = await workspace.findFiles('**/cwk.config.js');
  await setupCodeStatusSessionChange(context);
  if (files.length) {
    setupLiveShare(files[0]);
  } else {
    window.showInformationMessage('Could not find cwk.config.js');
  }

  const syncDisposable = commands.registerCommand(
    'code-workshop-kit-extension.syncCodeStatus',
    async () => {
      await syncCodeStatus(context);
    },
  );

  const desyncDisposable = commands.registerCommand(
    'code-workshop-kit-extension.desyncCodeStatus',
    async () => {
      await desyncCodeStatus(context);
    },
  );

  context.subscriptions.push(syncDisposable);
  context.subscriptions.push(desyncDisposable);

  // TODO: provide some easy ways to turn the extension on/off
}

// this method is called when your extension is deactivated
export function deactivate() {}
