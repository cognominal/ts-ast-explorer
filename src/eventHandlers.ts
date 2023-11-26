import { treeview, astProvider, branchview, branchProvider } from './extension'
import * as vscode from 'vscode';
import { ASTItem } from './treeviewAST';
import { compile } from './utils';
import { BranchItem } from './branchviewAST';
import * as ts from 'typescript';



export function initEventHandlers() {
    treeview.onDidChangeSelection(onChangeTreeviewSelection)
    branchview.onDidChangeSelection(onChangeBranchviewSelection)
    vscode.window.onDidChangeActiveTextEditor(onChangeEditor);
    vscode.window.onDidChangeTextEditorSelection(onChangeEditorSelection)

    onChangeEditor(vscode.window.activeTextEditor)


}


export function onChangeTreeviewSelection(e: vscode.TreeViewSelectionChangeEvent<ASTItem>): void {
    let astItem = e.selection[0]
    console.log("astitem " + astItem)
    if (astItem) {
        let node = astItem.astNode
        let start = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart())
        let startPosition = new vscode.Position(start.line, start.character)
        let end = node.getSourceFile().getLineAndCharacterOfPosition(node.getEnd())
        let endPosition = new vscode.Position(end.line, end.character)
        let selection = new vscode.Selection(startPosition, endPosition)
        let editor = vscode.window.activeTextEditor
        if (editor) {
            try {
                editor.selection = selection
                editor.revealRange(selection)

            } catch (error) {
                console.error('Error setting selection:', error)
            }

            // if (editor) {
            //     editor.selection = selection
            //     editor.revealRange(selection)
            // }
        }
    }
}
export function onChangeBranchviewSelection(e: vscode.TreeViewSelectionChangeEvent<BranchItem>): void {
}

export function onChangeEditor(editor: vscode.TextEditor | undefined): void {
    if (editor) {
        let languageId = editor.document.languageId;
        console.log(`Active editor changed to: ${editor.document.fileName} with languageId: ${languageId}`);

        // Compile the source code to AST and refresh the providers
        let ast = compile(editor)
        astProvider.refresh(ast)
        branchProvider.refresh(ast)
    }
}

let nrCalls = 0 // detect infinite recursion
export function onChangeEditorSelection(e: vscode.TextEditorSelectionChangeEvent): void {
    if (nrCalls > 100) {
        debugger
    }
    // if (e.textEditor === vscode.window.activeTextEditor) {
    const range: vscode.Range = e.selections[0]
    // Compile the source code to AST
    let ast = compile(e.textEditor)
    if (!ast) {
        return
    }
    const rootItem = astProvider.refresh(ast)
    let deepestItem = deepesItemInRange(rootItem, range)
    if (!deepestItem) {
        return
    }
    treeview.reveal(deepestItem, { select: true, focus: true, expand: true });
    return
}

// find the deepest items that contains the range
function deepesItemInRange(item: ASTItem, range: vscode.Range): ASTItem | null {
    let kids = astProvider.getChildren(item);

    if (!astProvider || !kids) {
        return null;
    }
    let deepestItem;
    let foundItem: ASTItem | undefined = item;
    let iteration = 0;
    do {
        deepestItem = foundItem;
        if (iteration === 0) { // already have the kids
            kids = astProvider.getChildren(item);
        }
        if (!kids) {
            foundItem = undefined;
        } else {
            foundItem = (kids as ASTItem[]).find((child) => {
                return itemInRange(child, range)
            });
        }
        iteration++;
    } while (foundItem);
    return deepestItem;
}

function setSelectionFromItem(item: ASTItem) {
    let node = item.astNode
    let range = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart())
    let position = new vscode.Position(range.line, range.character)
    let selection = new vscode.Selection(position, position)
    let editor = vscode.window.activeTextEditor
    if (editor) {
        editor.selection = selection
        editor.revealRange(selection)
    }
}

function itemInRange(item: ASTItem, range: vscode.Range): boolean {
    let node: ts.Node = item.astNode;
    let sourceFile = node.getSourceFile();

    let start = ts.getLineAndCharacterOfPosition(sourceFile, node.getStart());
    let end = ts.getLineAndCharacterOfPosition(sourceFile, node.getEnd());

    const itemRange = new vscode.Range(
        start.line,
        start.character,
        end.line,
        end.character
    );
    return itemRange.contains(range);
}