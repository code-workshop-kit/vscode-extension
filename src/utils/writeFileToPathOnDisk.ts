import path from 'path';
import fs from 'fs';
import { TextEncoder } from 'util';
import vscode, { Uri, workspace } from 'vscode';

export async function writeFileToPathOnDisk(toPath: Uri, fileContent: string, override: boolean) {
  const toPathDir = path.dirname(toPath.path);
  const toPathDirUri = Uri.file(toPathDir);

  if (!fs.existsSync(toPathDir)) {
    await workspace.fs.createDirectory(toPathDirUri);
  }

  if (!fs.existsSync(toPath.path) || override) {
    await workspace.fs.writeFile(toPath, new TextEncoder().encode(fileContent));
  }
}
