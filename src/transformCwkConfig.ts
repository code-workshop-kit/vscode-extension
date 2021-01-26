import { transformSync } from '@babel/core';
import * as BabelTypes from '@babel/types';
import { Visitor, NodePath } from '@babel/traverse';
import * as fs from 'fs';

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

export const addParticipantCwkConfig = (participant: string, cwkPath: string) => {
  if (fs.existsSync(cwkPath)) {
    const cfgCode = fs.readFileSync(cwkPath, 'utf8');

    const newCfg = transformSync(cfgCode, {
      plugins: [[addParticipantWithBabel, { participant }]],
    });

    if (newCfg) {
      fs.writeFileSync(cwkPath, newCfg.code);
    }
  }
};
