import { copyTemplates } from 'code-workshop-kit';
import { Uri, workspace } from 'vscode';
import path from 'path';
import { promises as fs } from 'fs';
import { changeParticipantCwkConfig } from './transformCwkConfig';
import { writeFileToPathOnDisk } from './utils/writeFileToPathOnDisk';

async function createMissingDisconnectedFolder(file: Uri) {
  const disconnectedFolderUri = Uri.file(
    `${path.dirname(file.path)}/participants/_cwk_disconnected`,
  );
  try {
    await fs.access(`${path.dirname(file.path)}/participants/_cwk_disconnected/`);
  } catch (e) {
    await workspace.fs.createDirectory(disconnectedFolderUri);
  }
  return disconnectedFolderUri;
}

export async function handleParticipantLeave(user: string, file: Uri) {
  // Remove the user from the participants prop of cwk.config.js
  const hasRemoved = await changeParticipantCwkConfig(user, file, false);

  // If a user was removed, move their folder to _cwk_disconnected
  if (hasRemoved) {
    await createMissingDisconnectedFolder(file);
    const participantFolderUri = Uri.file(`${path.dirname(file.path)}/participants/${user}`);
    await workspace.fs.copy(
      participantFolderUri,
      Uri.file(`${path.dirname(file.path)}/participants/_cwk_disconnected/${user}`),
      { overwrite: true },
    );
    await workspace.fs.delete(participantFolderUri, { recursive: true });
  }
}

export async function handleParticipantJoin(
  user: string,
  file: Uri,
  templateData: { [key: string]: unknown },
) {
  // Add the user to the participants prop of cwk.config.js if they are not in there yet
  const hasAdded = await changeParticipantCwkConfig(user, file);

  // If a new user was added, scaffold files for them or move them back from _cwk_disconnected if they reconnected.
  if (hasAdded) {
    try {
      await fs.access(`${path.dirname(file.path)}/participants/_cwk_disconnected/${user}`);
      const participantFolderUri = Uri.file(`${path.dirname(file.path)}/participants/${user}`);
      const disconnectedParticipantFolderUri = Uri.file(
        `${path.dirname(file.path)}/participants/_cwk_disconnected/${user}`,
      );
      await workspace.fs.copy(disconnectedParticipantFolderUri, participantFolderUri, {
        overwrite: true,
      });
      await workspace.fs.delete(disconnectedParticipantFolderUri, { recursive: true });
    } catch (e) {
      const copiedFiles = await copyTemplates(
        `${path.dirname(file.path)}/template/**`,
        `${path.dirname(file.path)}/participants/${user}`,
        {
          participantName: user,
          ...templateData,
        },
      );
      const copiedFilesPromises: Promise<void>[] = [];
      copiedFiles.forEach((copiedFile) => {
        copiedFilesPromises.push(
          writeFileToPathOnDisk(Uri.file(copiedFile.toPath), copiedFile.processed, false),
        );
      });
      await Promise.all(copiedFilesPromises);
    }
  }
}
