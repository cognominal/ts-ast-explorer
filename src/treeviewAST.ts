import * as vscode from 'vscode';
import ts from 'typescript';
import { getEnumBitFlags } from './utils';

export function initTreeview(context: vscode.ExtensionContext) {
    const astProvider = new ASTProvider();
    let treeview = vscode.window.createTreeView('ASTTreeview', { treeDataProvider: astProvider });
    return { treeview, astProvider }


}


export class ASTProvider implements vscode.TreeDataProvider<ASTItem> {
    // onDidChangeTreeData: vscode.Event<ASTItem | null | undefined> | undefined 
    private onDidChangeTreeDataEmitter: vscode.EventEmitter<ASTItem | undefined | null | void> = new vscode.EventEmitter<ASTItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ASTItem | undefined | null | void> = this.onDidChangeTreeDataEmitter.event;

    // set root from an AStItem or ts.Node, refresh the tree, and returns its root
    refresh(root: ASTItem | ts.Node): ASTItem {
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
        if (!this.root) { return [] }
        if (!element) {
            element = this.root
        }
        const items = element.astNode.getChildren().map((node) => {
            const kind = ts.SyntaxKind[node.kind]
            const isKeyword = kind.match(/Keyword|Assignment/)
            const shortKind : string = isKeyword ? '' : kind 
            const collapse = node.getChildCount() > 0 ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None
            const item = new ASTItem(shortKind, node, collapse, element);
            item.description = ''
            const flags = node.flags
            const tokenNode = kind.match(/keyword|token|identifier|literal/i);

            if (flags !== 0) {
                item.description = '(' + getEnumBitFlags(node.flags, ts.NodeFlags) + ') ' + flags + ' '
            }
            if (tokenNode) {
                item.description += node.getText();
            }
            return item
        })
        // console.log(items)
        return items;
    }

    getParent(element: ASTItem): vscode.ProviderResult<ASTItem> {
        return element.parent;
    }
}
export class ASTItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly astNode: ts.Node,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None,
        public readonly parent: ASTItem | null = null
    ) {
        super(label, collapsibleState);
    }


    toStr() {
    `${this.label}`
    }

    itemRange() : vscode.Range{
        let node: ts.Node = this.astNode;
        let sourceFile = node.getSourceFile();
    
        let start = ts.getLineAndCharacterOfPosition(sourceFile, node.getStart());
        let end = ts.getLineAndCharacterOfPosition(sourceFile, node.getEnd());
    
        return new vscode.Range(
            start.line,
            start.character,
            end.line,
            end.character
        );
    
    }
    
    itemInRange(range: vscode.Range): boolean {
        return this.itemRange().contains(range);
    }


}