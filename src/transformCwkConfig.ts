import { transformSync } from '@babel/core';
import BabelTypes from '@babel/types';
import { Visitor, NodePath } from '@babel/traverse';
import fs from 'fs';
import vscode, { Uri } from 'vscode';
import { TextDecoder, TextEncoder } from 'util';

export interface PluginOptions {
  opts?: {
    target?: string;
    runtime?: string;
    participant: string;
  };
  file: {
    path: NodePath;
  };
}

export interface Babel {
  types: typeof BabelTypes;
}

const addParticipantVisitor = (
  t: typeof BabelTypes,
  path: BabelTypes.ArrayExpression,
  participant: string,
) => {
  path.elements.push(t.stringLiteral(participant));
  path.elements.sort((a, b) => {
    if (a?.type === 'StringLiteral' && b?.type === 'StringLiteral') {
      if (a.value < b.value) {
        return -1;
      } else if (a.value > b.value) {
        return 1;
      }
    }
    return 0;
  });
};

const addParticipantWithBabel = (babel: Babel): { visitor: Visitor<PluginOptions> } => {
  const t = babel.types;
  return {
    visitor: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ObjectProperty(path, state) {
        if (!state.opts || !state.opts.participant) {
          return;
        }
        const participant = state.opts.participant;

        if (
          path.node.key.type === 'Identifier' &&
          path.node.key.name === 'participants' &&
          path.node.value.type === 'ArrayExpression'
        ) {
          const participantAlreadyExists = path.node.value.elements.find((elem) => {
            if (elem === null || elem.type !== 'StringLiteral') {
              return false;
            }
            return elem.value === participant;
          });

          if (participantAlreadyExists === undefined) {
            addParticipantVisitor(t, path.node.value, participant);
          }
        }
      },
    },
  };
};

export const addParticipantCwkConfig = async (participant: string, file: Uri) => {
  if (fs.existsSync(file.path)) {
    const cfgCodeAsUInt8Array = await vscode.workspace.fs.readFile(file);
    const cfgCode = new TextDecoder('utf-8').decode(cfgCodeAsUInt8Array);

    const newCfg = transformSync(cfgCode, {
      plugins: [[addParticipantWithBabel, { participant }]],
    });

    if (newCfg && newCfg.code && newCfg.code !== cfgCode) {
      const newCfgAsUInt8Array = new TextEncoder().encode(newCfg.code);
      await vscode.workspace.fs.writeFile(file, newCfgAsUInt8Array);
      return true;
    }
  }
  return false;
};
