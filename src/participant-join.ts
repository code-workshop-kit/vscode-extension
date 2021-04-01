import path from 'path';
import { writeFileToPathOnDisk } from './utils/writeFileToPathOnDisk';
import { copyTemplates } from 'code-workshop-kit';

import { addParticipantCwkConfig } from './transformCwkConfig';
import { Uri } from 'vscode';

export async function handleParticipantJoin(
  user: string,
  file: Uri,
  templateData: { [key: string]: unknown },
) {
  // Add the user to the participants prop of cwk.config.js if they are not in there yet
  const hasAdded = await addParticipantCwkConfig(user, file);

  // If a new user was added, scaffold files for them
  if (hasAdded) {
    const copiedFiles = await copyTemplates(
      `${path.dirname(file.path)}/template/**`,
      `${path.dirname(file.path)}/participants/${user}`,
      {
        participantName: user,
        ...templateData,
      },
    );

    copiedFiles.forEach((copiedFile) => {
      writeFileToPathOnDisk(Uri.file(copiedFile.toPath), copiedFile.processed, false);
    });
  }
}
