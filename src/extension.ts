import * as vscode from 'vscode';
import { getApi } from 'vsls';
import { addParticipantCwkConfig } from './transformCwkConfig';

export async function activate() {
  const vsls = await getApi();
  if (!vsls) {
    // TODO: throw something because vsls is not installed, maybe a notification?
    return;
  }

  const files = await vscode.workspace.findFiles('**/cwk.config.js');
  if (files.length) {
    vsls.onDidChangeSession(async (e) => {
      // TODO: Get permission to access e.session.user and use their userName
      const participant = e.session.user?.userName ?? `${e.session.peerNumber}`;
      addParticipantCwkConfig(participant, files[0].path);
    });
  }

  // TODO: provide some easy ways to turn the extension on/off
}

// this method is called when your extension is deactivated
export function deactivate() {}
