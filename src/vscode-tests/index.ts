import * as vscode from 'vscode';
import * as assert from 'assert';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Test ast.focus command', async () => {
    const result = await vscode.commands.executeCommand('ast.focus');
    assert.ok(result, 'ast.focus command failed');
  });

  test('Test ast.folding command', async () => {
    const result = await vscode.commands.executeCommand('ast.folding');
    assert.ok(result, 'ast.folding command failed');
  });
});