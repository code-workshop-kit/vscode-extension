import path from 'path';
import fs from 'fs';
import { TextEncoder } from 'util';
import vscode, { Uri } from 'vscode';

export async function writeFileToPathOnDisk(toPath: Uri, fileContent: string, override: boolean) {
  const toPathDir = path.dirname(toPath.path);
  const toPathDirUri = Uri.file(toPathDir);

  if (!fs.existsSync(toPathDir)) {
    await vscode.workspace.fs.createDirectory(toPathDirUri);
  }

  if (!fs.existsSync(toPath.path) || override) {
    await vscode.workspace.fs.writeFile(toPath, new TextEncoder().encode(fileContent));
  }
}
