import { treeview, astProvider, branchview, branchProvider } from './extension'
import * as vscode from 'vscode';
import { ASTItem } from './treeviewAST';
import { compile, positionToOffset } from './utils';
import { BranchItem } from './branchviewAST';
import * as ts from 'typescript';



export function initEventHandlers() {
    // onChangeEditor(vscode.window.activeTextEditor)
    treeview.onDidChangeSelection(onChangeTreeviewSelection)
    branchview.onDidChangeSelection(onChangeBranchviewSelection)

    vscode.window.onDidChangeActiveTextEditor(onChangeEditor);
    vscode.window.onDidChangeTextEditorSelection(onChangeEditorSelection)
    onChangeEditor(vscode.window.activeTextEditor)


}

export function onChangeTreeviewSelection(e: vscode.TreeViewSelectionChangeEvent<ASTItem>): void {
    let astItem = e.selection[0]
    console.log(astItem)
    if (astItem) {
        let node = astItem.astNode
        let range = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart())
        let position = new vscode.Position(range.line, range.character)
        let selection = new vscode.Selection(position, position)
        let editor = vscode.window.activeTextEditor
        if (editor) {
            editor.selection = selection
            editor.revealRange(selection)
        }
    }
}
export function onChangeBranchviewSelection(e: vscode.TreeViewSelectionChangeEvent<BranchItem>): void {
}

export function onChangeEditor(editor: vscode.TextEditor | undefined): void {
    if (editor) {
        let languageId = editor.document.languageId;
        console.log(`Active editor changed to: ${editor.document.fileName} with languageId: ${languageId}`);

        let source = editor.document.getText();

        // Compile the source code to AST and refresh the providers
        let ast = compile(source)
        astProvider.refresh(ast)
        branchProvider.refresh(ast)
    }
}

export function onChangeEditorSelection(e: vscode.TextEditorSelectionChangeEvent): void {
    // if (e.textEditor === vscode.window.activeTextEditor) {
    const position: vscode.Position = e.selections[0].active;
    console.log(`Cursor moved to line ${position.line + 1}`);
    // Compile the source code to AST
    let ast = compile(e.textEditor)
    if (!ast) {
        return
    }
    const root = astProvider.refresh(ast)
    let offset: number = positionToOffset(e.textEditor.document, position)
    let item = findItem(root, position)
    if (!item) {
        return
    }
    treeview.reveal(item, { select: true, focus: true, expand: true });
    return
    function findItem(item: ASTItem, position: vscode.Position): ASTItem | null {
        if (!inRange(position, item)) {
            return null;
        }

        if (item.astNode.getChildAt(offset)) {
            const kids = astProvider.getChildren(item);
            if (!kids) {
                return null
            }
            for (const child of kids as ASTItem[]) {
                const foundItem = findItem(child, position);
                if (foundItem) {
                    return foundItem;
                }
            }
        }

        return null;
    }
    // test if the postion is in the range of the astNode
    function inRange(position: vscode.Position, astItem: ASTItem) {
        let node = astItem.astNode
        let range = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart())
        let startLine = range.line
        let startCharacter = range.character
        range = node.getSourceFile().getLineAndCharacterOfPosition(node.getEnd())
        let endLine = range.line
        let endCharacter = range.character
        return position.line >= startLine && position.line <= endLine &&
            ((position.line === startLine && position.character >= startCharacter) ||
                (position.line === endLine && position.character <= endCharacter))
    }



    // TODO: Use the AST for further processing

    // Refresh the tree view provider
    if (astProvider) {
        astProvider.refresh(ast);
    }
    // }
}

