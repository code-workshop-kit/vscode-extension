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
  // When the host starts the session
  vsls.onDidChangeSession(async (e) => {
    // truesy check on id because it is null when session ends and host leaves
    if (e.session && e.session.id) {
      const templateData = getCwkTemplateData(file);
      const participant =
        e.session.user?.displayName ?? e.session.user?.userName ?? `${e.session.peerNumber}`;
      handleParticipantJoin(participant, file, templateData);
    }
  });

  // When participants join the session
  vsls.onDidChangePeers(async (e) => {
    const peers = e.added;
    peers.forEach((peer) => {
      const templateData = getCwkTemplateData(file);
      const participant = peer.user?.displayName ?? peer.user?.userName ?? `${peer.peerNumber}`;
      handleParticipantJoin(participant, file, templateData);
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
