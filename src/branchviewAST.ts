import ts from "typescript";
import * as vscode from 'vscode';
import { getEnumBitFlags, EnumType } from './utils';


export function initBranchview(context: vscode.ExtensionContext) {
    const branchProvider = new BranchProvider();
    let branchview = vscode.window.createTreeView('ASTBranchview', { treeDataProvider: branchProvider });
    // treeview.onDidChangeSelection(onChangeTreeviewSelection)
    // vscode.window.onDidChangeActiveTextEditor(onChangeEditor);
    // vscode.window.onDidChangeTextEditorSelection(onChangeEditorSelection)
    // onChangeEditor(vscode.window.activeTextEditor)
    return { branchview, branchProvider}
}



export class BranchProvider implements vscode.TreeDataProvider<BranchItem> {
    private onDidChangeTreeDataEmitter: vscode.EventEmitter<BranchItem | undefined | null | void> = new vscode.EventEmitter<BranchItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<BranchItem | undefined | null | void> = this.onDidChangeTreeDataEmitter.event;


    refresh(root: BranchItem| ts.Node): BranchItem {
        this.root = root instanceof BranchItem ? root : new BranchItem('root', root, vscode.TreeItemCollapsibleState.Expanded)
        this.onDidChangeTreeDataEmitter.fire();
        return this.root;
    }

    constructor(
        public root: BranchItem | null = null
    ) {
        this.onDidChangeTreeData = new vscode.EventEmitter<BranchItem | null | undefined>().event
    }
    getTreeItem(element: BranchItem): vscode.TreeItem {
        return element;
    }
    // for now, get the root node and display it
    // Eventually we want to display the current node as per the selection

    getChildren(element?: BranchItem | undefined): vscode.ProviderResult<BranchItem[]> {
        function handleKey(key: string, node: ts.Node): BranchItem {
            let val = node[key as keyof ts.Node];
            let str = typeof val === 'object' ? key : stringifyItem(key, val);
            let collapsible = vscode.TreeItemCollapsibleState.None
            if (typeof val === 'object') { collapsible = vscode.TreeItemCollapsibleState.Expanded }
            return new BranchItem(str, val, collapsible);

        }
        function stringifyItem(key: string, val: any): string {
            let t: EnumType = ts.NodeFlags
            switch (key) {
                case 'kind':
                    return `${key}: ${ts.SyntaxKind[val]}`;
                case 'flags':
                    return `${key}: ${getEnumBitFlags(val, t)}`;

                default:
                    return `${key}: ${val}`;

            }
        }

        let children: BranchItem[] = [];
        if (!this.root) { return [] }
        if (element) {
            const content = element.content
            const node = element.content as ts.Node
            if (node['kind']) {
                handleKey('kind', node) // add the kind first
            }
            for (const key in node) {
                if (node.hasOwnProperty(key)) {
                    let val = node[key as keyof ts.Node]; // Add type assertion to keyof ts.Node
                    if (val === undefined || ['pos', 'end', 'kind'].includes(key)) {
                        continue
                    } // skip undefined values and some keys to avoid clutter
                    let branchItem = handleKey(key, node)
                    children.push(branchItem)
                }
            }

        } else {
            let children: BranchItem[] = [];
            children.push(this.root)
            return children

        }
        return children
    }

    getParent?(element: BranchItem): vscode.ProviderResult<BranchItem> {
        throw new Error('Method not implemented.');
    }

}

export class BranchItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly content: any,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None,
    ) {
        super(label, collapsibleState);
    }
}