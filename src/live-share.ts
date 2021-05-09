import { Uri, window, extensions, Disposable } from 'vscode';
import { getApi, Peer } from 'vsls';
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

export async function setupLiveShare(file: Uri) {
  const vsls = await getApi();
  if (!vsls) {
    window.showInformationMessage('Error: vsls not installed');
    return;
  }

  // When the host starts the session
  vsls.onDidChangeSession(async (e) => {
    if (e.session && e.session.id) {
      const templateData = getCwkTemplateData(file);
      const participant =
        e.session.user?.displayName ?? e.session.user?.userName ?? `${e.session.peerNumber}`;
      await handleParticipantJoin(participant, file, templateData);
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
