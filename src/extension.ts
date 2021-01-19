import * as vscode from 'vscode';
import { getApi } from 'vsls';
import * as fs from 'fs';

export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "code-workshop-kit" is now active!');

  const vsls = await getApi();

  if (!vsls) {
    // TODO: throw something because vsls is not installed, maybe a notification?
    return;
  }

  const files = await vscode.workspace.findFiles('**/cwk.config.js');
  if (files.length) {
    console.log('Found your cwk.config.js! Contents:');
    console.log(fs.readFileSync(files[0].path, 'utf8'));
  }

  let disposable = vscode.commands.registerCommand('cwk.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from code-workshop-kit!');
  });
  context.subscriptions.push(disposable);

  vsls.onDidChangeSession(async (e) => {
    // TODO: Get permission to access e.session.user and use their userName
    console.log(`${e.session.peerNumber} joined the session!`);

    // TODO: Use babel transform to add the user to the list of participants if they are not yet in the list
    // @babel/core is already installed
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}
