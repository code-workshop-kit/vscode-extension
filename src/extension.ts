import vscode from 'vscode';
import { getApi, LiveShare } from 'vsls';
import _esmRequire from 'esm';

import { handleParticipantJoin } from './participant-join';

function getCwkTemplateData(file: vscode.Uri) {
  const esmRequire = _esmRequire(module);
  const importedCwkConfig = esmRequire(file.path);
  return importedCwkConfig.default.templateData || {};
}

function setup(vsls: LiveShare, file: vscode.Uri) {
  const templateData = getCwkTemplateData(file);

  // When the host starts the session
  vsls.onDidChangeSession(async (e) => {
    if (e.session) {
      const participant =
        e.session.user?.displayName ?? e.session.user?.userName ?? `${e.session.peerNumber}`;
      handleParticipantJoin(participant, file.path, templateData);
    }
  });

  // When participants join the session
  vsls.onDidChangePeers(async (e) => {
    const peers = e.added;
    peers.forEach((peer) => {
      const participant = peer.user?.displayName ?? peer.user?.userName ?? `${peer.peerNumber}`;
      handleParticipantJoin(participant, file.path, templateData);
    });
  });
}

export async function activate() {
  const vsls = await getApi();
  if (!vsls) {
    vscode.window.showInformationMessage('Error: vsls not installed');
    return;
  }

  const files = await vscode.workspace.findFiles('**/cwk.config.js');
  if (files.length) {
    setup(vsls, files[0]);
  } else {
    vscode.window.showInformationMessage('Could not find cwk.config.js');
  }

  // TODO: provide some easy ways to turn the extension on/off
}

// this method is called when your extension is deactivated
export function deactivate() {}
