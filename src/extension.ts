import * as vscode from 'vscode';
import { initTreeview } from './treeviewAST';

// I have two possible strategies and I want to support both of them
// 1/ allocate everything in the extension.ts file
// 2/ allocate in the files and call a call a init for each of them
//
// The second one is more modular but for a small extension it is unnecessary
// but it may hide dependencies if any

export let updateASTOnSaveOnlyConfigOption: boolean;


export function activate(context: vscode.ExtensionContext) {
	initTreeview(context)
    let config = vscode.workspace.getConfiguration('ts-ast-explorer');
    updateASTOnSaveOnlyConfigOption = config.get('updateASTOnSaveOnly', true);


}

// This method is called when your extension is deactivated
export function deactivate() {}
