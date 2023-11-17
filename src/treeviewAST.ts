import * as vscode from 'vscode';
import ts from 'typescript';

let f = ts.factory
let block: ts.Block = f.createBlock([f.createExpressionStatement(f.createNumericLiteral(1))]);


vscode.window.onDidChangeTextEditorSelection(e => {
    if (e.textEditor === vscode.window.activeTextEditor) {
        const position = e.selections[0].active;
        console.log(`Cursor moved to line ${position.line + 1}`);
    }
});

// let treeView = vscode.window.createTreeView('yourTreeViewId', {
//     treeDataProvider: yourTreeDataProvider
// });

// let itemToSelect = yourTreeDataProvider.getTreeItem(yourDesiredNode);

// treeView.reveal(itemToSelect, { select: true, focus: true });

function getFlags(flags: ts.NodeFlags): string {
    let sflags: string[] = [];
    for (let enumMember in ts.NodeFlags) {
        let isValueProperty = parseInt(enumMember, 10) >= 0;
        if (isValueProperty) {
            let enumValue = Number(enumMember);
            if ((flags & enumValue) !== 0) {
                console.log(ts.NodeFlags[enumValue]);
            }
        }
    }
    return sflags.join(', ')
}


function explain(key: string, val: any): string {
    switch (key) {
        case 'kind':
            return `${key}: ${ts.SyntaxKind[val]}`

        default:
            return `${key}: ${val}`

    }
}

export class ASTProvider implements vscode.TreeDataProvider<ASTItem> {
    onDidChangeTreeData?: vscode.Event<ASTItem | null | undefined> | undefined;
    getTreeItem(element: ASTItem): vscode.TreeItem {
        return element;
    }
    getChildren(element?: ASTItem | undefined): vscode.ProviderResult<ASTItem[]> {
        function handleKey(key: string, element: ASTItem) {
            let val = element.astNode![key];
            let str = typeof val === 'object' ? key : explain(key, val);
            let collapsible = vscode.TreeItemCollapsibleState.None
            if (typeof val === 'object') { collapsible = vscode.TreeItemCollapsibleState.Expanded }
            let item = new ASTItem(str, collapsible, val);
            children.push(item)
        }

        element = element || new ASTItem('root', vscode.TreeItemCollapsibleState.Expanded, block);
        let children: ASTItem[] = [];
        if (element.astNode!['kind']) {
            handleKey('kind', element) // add the kind first
        }
        for (const key in element.astNode) {
            let val = element.astNode[key];

            if (val === undefined || ['pos', 'end', 'kind'].includes(key)) {
                continue
            } // skip undefined values and some keys to avoid clutter
            handleKey(key, element)
        }
        return children
    }
    // getParent?(element: ASTItem): vscode.ProviderResult<ASTItem> {
    //     throw new Error('Method not implemented.');
    // }
}
export class ASTItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None,
        public readonly astNode: { [key: string]: any } | null = null
    ) {
        super(label, collapsibleState);
    }
}