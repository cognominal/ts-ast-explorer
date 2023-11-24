import * as vscode from 'vscode';
import ts from 'typescript';
import { getEnumBitFlags, EnumType } from './utils';
import { compile } from './utils';
import { onChangeEditor, onChangeEditorSelection, onChangeTreeviewSelection } from './eventHandlers';

// let f = ts.factory
// let block: ts.Block = f.createBlock([f.createExpressionStatement(f.createNumericLiteral(1))]);

// let code = ` let a =1`

// // Compile the source code to AST
// let ast = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

// // TODO: Use the AST for further processing



export function initTreeview(context: vscode.ExtensionContext) {
    const astProvider = new ASTProvider();
    let treeview = vscode.window.createTreeView('ASTTreeview', { treeDataProvider: astProvider });
    return { treeview, astProvider }


}
// let treeView = vscode.window.createTreeView('yourTreeViewId', {
//     treeDataProvider: yourTreeDataProvider
// });

// let itemToSelect = yourTreeDataProvider.getTreeItem(yourDesiredNode);

// treeView.reveal(itemToSelect, { select: true, focus: true });



export class ASTProvider implements vscode.TreeDataProvider<ASTItem> {
    // onDidChangeTreeData: vscode.Event<ASTItem | null | undefined> | undefined 
    private onDidChangeTreeDataEmitter: vscode.EventEmitter<ASTItem | undefined | null | void> = new vscode.EventEmitter<ASTItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ASTItem | undefined | null | void> = this.onDidChangeTreeDataEmitter.event;

    // set root from an AStItem or ts.Node, refresh the tree, and returns its root
    refresh(root: ASTItem| ts.Node ): ASTItem {
        this.root = root instanceof ASTItem ? root : new ASTItem('root', root, vscode.TreeItemCollapsibleState.Expanded)  
        this.onDidChangeTreeDataEmitter.fire()
        return this.root;
    }

    constructor(
        public root: ASTItem | null = null
    ) {
        this.onDidChangeTreeData = new vscode.EventEmitter<ASTItem | null | undefined>().event
    }
    getTreeItem(element: ASTItem): vscode.TreeItem {
        return element;
    }
    getChildren(element?: ASTItem | undefined): vscode.ProviderResult<ASTItem[]> {
        if (!this.root ) { return [] }
        if (!element) {
            element = this.root
        }
        const items = element.astNode.getChildren().map((node) => new ASTItem(ts.SyntaxKind[node.kind], node, vscode.TreeItemCollapsibleState.Expanded))
        console.log(items)
        return items;
    }

    // _getChildren(element?: ASTItem | undefined): vscode.ProviderResult<ASTItem[]> {
    // //     function handleKey(key: string, element: ASTItem) {
    //         let val = element.astNode[key as keyof ts.Node];
    //         let str = typeof val === 'object' ? key : stringifyItem(key, val);
    //         let collapsible = vscode.TreeItemCollapsibleState.None
    //         if (typeof val === 'object') { collapsible = vscode.TreeItemCollapsibleState.Expanded }
    //         let item = new ASTItem(str, collapsible, val);
    //         children.push(item)
    //     }

    //     if (!this.root) { return [] }
    //     element = element || new ASTItem('root', vscode.TreeItemCollapsibleState.Expanded, this.root);
    //     let children: ASTItem[] = [];
    //     if (element.astNode!['kind']) {
    //         handleKey('kind', element) // add the kind first
    //     }
    //     for (const key in element.astNode) {
    //         if (element.astNode.hasOwnProperty(key)) {
    //             let val = element.astNode[key as keyof ts.Node]; // Add type assertion to keyof ts.Node
    //             if (val === undefined || ['pos', 'end', 'kind'].includes(key)) {
    //                 continue
    //             } // skip undefined values and some keys to avoid clutter
    //             handleKey(key, element)
    //         }
    //     }
    //     return children
    // }
    // getParent?(element: ASTItem): vscode.ProviderResult<ASTItem> {
    //     throw new Error('Method not implemented.');
    // }
}
export class ASTItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly astNode: ts.Node,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None,
    ) {
        super(label, collapsibleState);
    }
}