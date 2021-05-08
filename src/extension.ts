import vscode, { Uri, workspace, window } from 'vscode';
import { getApi, LiveShare, Peer } from 'vsls';
import _esmRequire from 'esm';

import { handleParticipantJoin, handleParticipantLeave } from './participant-join';

function getCwkTemplateData(file: Uri) {
  const esmRequire = _esmRequire(module);
  const importedCwkConfig = esmRequire(file.path);
  return importedCwkConfig.default.templateData || {};
}

function participantNameFromPeer(peer: Peer) {
  return peer.user?.displayName ?? peer.user?.userName ?? `${peer.peerNumber}`;
}

function setup(vsls: LiveShare, file: Uri) {
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

  // When participants joins/leaves the session
  vsls.onDidChangePeers(async (e) => {
    const addedPeers = e.added;
    const removedPeers = e.removed;
    const templateData = getCwkTemplateData(file);

    const participantHandlers: Promise<void>[] = [];
    addedPeers.forEach((peer) => {
      const participant = participantNameFromPeer(peer);
      participantHandlers.push(handleParticipantJoin(participant, file, templateData));
    });
    removedPeers.forEach((peer) => {
      const participant = participantNameFromPeer(peer);
      participantHandlers.push(handleParticipantLeave(participant, file));
    });
    await Promise.all(participantHandlers);
  });
}

export async function activate() {
  const vsls = await getApi();
  if (!vsls) {
    window.showInformationMessage('Error: vsls not installed');
    return;
  }

  const files = await workspace.findFiles('**/cwk.config.js');
  if (files.length) {
    setup(vsls, files[0]);
  } else {
    window.showInformationMessage('Could not find cwk.config.js');
  }

  // TODO: provide some easy ways to turn the extension on/off
}

// this method is called when your extension is deactivated
export function deactivate() {}
