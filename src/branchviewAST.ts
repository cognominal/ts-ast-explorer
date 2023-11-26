import ts from "typescript";
import * as vscode from 'vscode';
import { getEnumBitFlags, EnumType } from './utils';


export function initBranchview(context: vscode.ExtensionContext) {
    const branchProvider = new BranchProvider();
    let branchview = vscode.window.createTreeView('ASTBranchview', { treeDataProvider: branchProvider });
    return { branchview, branchProvider }
}

// We use a treeview in a non-standard way to display a branch of the AST
// sarting from a given node which is the root of the tree

export class BranchProvider implements vscode.TreeDataProvider<BranchItem> {
    private onDidChangeTreeDataEmitter: vscode.EventEmitter<BranchItem | undefined | null | void> = new vscode.EventEmitter<BranchItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<BranchItem | undefined | null | void> = this.onDidChangeTreeDataEmitter.event;


    refresh(root: BranchItem | ts.Node): BranchItem {
        this.root = root instanceof BranchItem ? root : new BranchItem('root', root, vscode.TreeItemCollapsibleState.Expanded, undefined, true)
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
        let children: BranchItem[] = [];
        if (!this.root) { return [] }
        if (element === undefined) {   // root of the treeview
            let children: BranchItem[] = [];
            children.push(this.root)
            return children

        }
        if (element.isRoot) {  
            let branch: BranchItem[] = []
            let node = element.content as ts.Node
            do {
                let item = new BranchItem(
                    node.kind.toString(), node, vscode.TreeItemCollapsibleState.Expanded, element)
                branch.push(item)
                node = node.parent
            } while (node)
            return branch
        }


        const node = element.content as ts.Node
        if (node['kind']) {
            handleKey('kind', node) // add the kind first
        }
        for (const key in node) {
            if (node.hasOwnProperty(key)) {
                let val = node[key as keyof ts.Node]; // Add type assertion to keyof ts.Node
                if (val === undefined || ['pos', 'end', 'kind'].includes(key)
                    || typeof val === 'object' && val === null) {
                    continue
                } // skip undefined values and some keys to avoid clutter
                let branchItem = handleKey(key, node)
                children.push(branchItem)
                return children
            }
        }
    }

    getParent?(element: BranchItem): vscode.ProviderResult<BranchItem> {
        return element.parent;
    }

}

// display a ts.Node as a BranchItem
function handleKey(key: string, node: ts.Node): BranchItem {
    let val = node[key as keyof ts.Node];
    let str = typeof val === 'object' ? key : stringifyItem(key, val);
    let collapsible = vscode.TreeItemCollapsibleState.None
    if (typeof val === 'object') { collapsible = vscode.TreeItemCollapsibleState.None }
    //    return new BranchItem(str, val, collapsible);
    return new BranchItem(str)

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


export class BranchItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly content: null | ts.Node = null,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None,
        public readonly parent: BranchItem | undefined = undefined,
        public readonly isRoot: boolean = false // root of the tree view, not of the ast
    ) {
        super(label, collapsibleState);
    }
}