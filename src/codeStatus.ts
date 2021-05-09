import { getApi } from 'vsls';
import { Disposable, window, extensions, ExtensionContext } from 'vscode';

let codeStatusDisposable: Disposable | null;

async function _syncCodeStatus() {
  const extension = extensions.getExtension('lostintangent.codestatus');
  if (extension) {
    if (!extension.isActive) {
      await extension.activate();
    }

    if (!codeStatusDisposable) {
      codeStatusDisposable = await extension.exports.updateStatus({
        emoji: '📘',
        message: `Hosting a workshop with code-workshop-kit`,
        limitedAvailability: true,
      });
    }
  }
}

export async function setupCodeStatusSessionChange(context: ExtensionContext) {
  const vsls = await getApi();
  if (!vsls) {
    window.showInformationMessage('Error: vsls not installed');
    return;
  }

  vsls.onDidChangeSession(async (e) => {
    if (e.session && e.session.id) {
      if (context.globalState.get('syncGithubStatus')) {
        await _syncCodeStatus();
      }
    } else if (codeStatusDisposable) {
      // reset github status on session end
      codeStatusDisposable.dispose();
      codeStatusDisposable = null;
    }
  });
}

export async function syncCodeStatus(context: ExtensionContext) {
  window.showInformationMessage('Syncing to GitHub status..');
  context.globalState.update('syncGithubStatus', true);

  const vsls = await getApi();
  if (!vsls) {
    window.showInformationMessage('Error: vsls not installed');
    return;
  }

  if (vsls.session.id && context.globalState.get('syncGithubStatus')) {
    await _syncCodeStatus();
  }

  window.showInformationMessage('Syncing to GitHub done!');
}

export async function desyncCodeStatus(context: ExtensionContext) {
  window.showInformationMessage('Removing sync to GitHub status..');
  context.globalState.update('syncGithubStatus', false);

  if (codeStatusDisposable) {
    codeStatusDisposable.dispose();
    codeStatusDisposable = null;
  }

  window.showInformationMessage('GitHub sync removed!');
}
