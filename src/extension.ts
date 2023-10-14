// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { translate } from './papago';

const APP_NAME = 'papago';

function newCommand(command: string) {
  return `${APP_NAME}.${command}`;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const secretStorage = context.secrets;

  const translateCommand = vscode.commands.registerCommand(
    newCommand('translate'),
    commandCallback(async () => {
      const clientId = await getSecret({
        secretStorage: secretStorage,
        key: 'NAVER_CLIENT_ID',
        inputPlaceholder: '네이버 Client Id 등록',
        errorMessage: '네이버 Client Id 를 입력해주세요.',
      });
      const clientSecret = await getSecret({
        secretStorage: secretStorage,
        key: 'NAVER_CLIENT_SECRET',
        inputPlaceholder: '네이버 Client Secret 등록',
        errorMessage: '네이버 Client Secret 를 입력해주세요.',
      });
      const input = await vscode.window.showInputBox({
        placeHolder: '번역할 문구 입력',
      });
      const { data, status } = await translate({
        text: input ?? '',
        clientId: clientId,
        clientSecret: clientSecret,
      });
      const translatedText = data.message?.result?.translatedText;
      if (!translatedText) {
        throw new Error('번역 실패');
      }

      vscode.env.clipboard.writeText(translatedText);
      vscode.window.showInformationMessage('번역 성공');
    })
  );

  const clientIdChangeCommand = vscode.commands.registerCommand(
    newCommand('client-id-change'),
    commandCallback(async () => {
      await changeSecret({
        secretStorage: secretStorage,
        key: 'NAVER_CLIENT_ID',
        inputPlaceholder: '네이버 Client Id 등록',
        errorMessage: '네이버 Client Id 를 입력해주세요.',
      });

      vscode.window.showInformationMessage('네이버 Client Id 변경 성공');
    })
  );

  const clientSecretChangeCommand = vscode.commands.registerCommand(
    newCommand('client-secret-change'),
    commandCallback(async () => {
      await changeSecret({
        secretStorage: secretStorage,
        key: 'NAVER_CLIENT_SECRET',
        inputPlaceholder: '네이버 Client Secret 등록',
        errorMessage: '네이버 Client Secret 를 입력해주세요.',
      });

      vscode.window.showInformationMessage('네이버 Client Secret 변경 성공');
    })
  );

  const clientIdGetCommand = vscode.commands.registerCommand(
    newCommand('client-id-get'),
    commandCallback(async () => {
      const clientId = await getSecret({
        secretStorage: secretStorage,
        key: 'NAVER_CLIENT_ID',
        inputPlaceholder: '네이버 Client Id 등록',
        errorMessage: '네이버 Client Id 를 입력해주세요.',
      });

      vscode.window.showInformationMessage(`네이버 Client Id: ${clientId}`);
    })
  );

  const clientSecretGetCommand = vscode.commands.registerCommand(
    newCommand('client-secret-get'),
    commandCallback(async () => {
      const clientSecret = await getSecret({
        secretStorage: secretStorage,
        key: 'NAVER_CLIENT_SECRET',
        inputPlaceholder: '네이버 Client Secret 등록',
        errorMessage: '네이버 Client Secret 를 입력해주세요.',
      });

      vscode.window.showInformationMessage(
        `네이버 Client Secret: ${clientSecret}`
      );
    })
  );

  context.subscriptions.push(translateCommand);
  context.subscriptions.push(clientIdChangeCommand);
  context.subscriptions.push(clientSecretChangeCommand);
  context.subscriptions.push(clientIdGetCommand);
  context.subscriptions.push(clientSecretGetCommand);
}

function commandCallback(fn: () => void) {
  return async (...args: any[]) => {
    try {
      await fn();
    } catch (error) {
      handleError(error);
    }
  };
}

interface SecretOptions {
  secretStorage: vscode.SecretStorage;
  key: string;
  inputPlaceholder?: string;
  errorMessage?: string;
}

async function getSecret(opts: SecretOptions) {
  let secret = await opts.secretStorage.get(opts.key);
  if (!secret) {
    secret = await changeSecret(opts);
  }

  return secret;
}

async function changeSecret({
  secretStorage,
  key,
  inputPlaceholder,
  errorMessage,
}: SecretOptions) {
  const secretInput = await vscode.window.showInputBox({
    placeHolder: inputPlaceholder || `${key} 등록`,
  });
  if (!secretInput) {
    throw new Error(errorMessage || `${key} 를 입력해주세요.`);
  }

  await secretStorage.store(key, secretInput);

  return secretInput;
}

function handleError(error: unknown) {
  let errorMessage = '문제가 발생했습니다.';
  if (error instanceof Error) {
    errorMessage = error.message;
  }

  vscode.window.showErrorMessage(errorMessage);
}

// This method is called when your extension is deactivated
export function deactivate() {}
