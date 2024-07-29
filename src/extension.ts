import * as vscode from 'vscode';
import { initTreeview,  ASTItem, ASTProvider } from './treeviewAST';
// import { initBranchview,  BranchItem, BranchProvider } from './branchviewAST';
import { channelName } from './constants';
import { decorateChannel } from './utils/decorateOutputChannel';
import { initEventHandlers } from './eventHandlers';
// import { TreeViewManager } from './treeViewManager';

// I have two possible strategies and I want to support both of them
// 1/ allocate everything in the extension.ts file
// 2/ allocate in the files and call a call a init for each of them
//
// The second one is more modular but for a small extension it is unnecessary
// but it may hide dependencies if any

export let updateASTOnSaveOnlyConfigOption: boolean;
export let treeview: vscode.TreeView<ASTItem> 
export let astProvider: ASTProvider 
// export let branchview: vscode.TreeView<BranchItem> 
// export let branchProvider: BranchProvider 


export function activate(context: vscode.ExtensionContext) {
  let config = vscode.workspace.getConfiguration('ts-ast-explorer');
  updateASTOnSaveOnlyConfigOption = config.get('updateASTOnSaveOnly', true);
  // ({ branchview, branchProvider } = initBranchview(context));
  ({ treeview, astProvider } = initTreeview(context));
  initEventHandlers()
  const channel = vscode.window.createOutputChannel(channelName)
  const { log, error, outputNewline } = decorateChannel(channel);
  log(`Extension activated`);

  // const treeViewManager = new TreeViewManager({
  //   log,
  //   error,
  // });



}

// This method is called when your extension is deactivated
export function deactivate() { }
