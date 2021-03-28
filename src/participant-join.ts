import path from 'path';
import { writeFileToPathOnDisk } from '@open-wc/create/dist/core.js';
import { copyTemplates } from 'code-workshop-kit';

import { addParticipantCwkConfig } from './transformCwkConfig';

export async function handleParticipantJoin(
  user: string,
  filePath: string,
  templateData: { [key: string]: unknown },
) {
  // Add the user to the participants prop of cwk.config.js if they are not in there yet
  const hasAdded = addParticipantCwkConfig(user, filePath);

  // If a new user was added, scaffold files for them
  if (hasAdded) {
    const files = await copyTemplates(
      `${path.dirname(filePath)}/template/**`,
      `${path.dirname(filePath)}/participants/${user}`,
      {
        participantName: user,
        ...templateData,
      },
    );

    files.forEach((file) => {
      writeFileToPathOnDisk(file.toPath, file.processed, {
        override: false,
        ask: false,
      });
    });
  }
}
