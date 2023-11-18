import * as vscode from 'vscode';
import ts from 'typescript';

let f = ts.factory
let block: ts.Block = f.createBlock([f.createExpressionStatement(f.createNumericLiteral(1))]);


export function initTreeview(context: vscode.ExtensionContext) {
    const astProvider = new ASTProvider();
    let disposable = vscode.window.registerTreeDataProvider('ASTTreeview', astProvider);


    vscode.window.onDidChangeTextEditorSelection(function (e) {
        if (e.textEditor === vscode.window.activeTextEditor) {
            const position = e.selections[0].active;
            console.log(`Cursor moved to line ${position.line + 1}`);
            let source = e.textEditor.document.getText();

            // Compile the source code to AST
            let ast = ts.createSourceFile('temp.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

            // TODO: Use the AST for further processing

            // Refresh the tree view provider
            if (astProvider) {
                astProvider.refresh(ast);
            }
        }
    });

}

// let treeView = vscode.window.createTreeView('yourTreeViewId', {
//     treeDataProvider: yourTreeDataProvider
// });

// let itemToSelect = yourTreeDataProvider.getTreeItem(yourDesiredNode);

// treeView.reveal(itemToSelect, { select: true, focus: true });


function countPowersOfTwo(n : number) {
    let result = 0 ;
    for (let i = 0;; i++) {
        let power = Math.pow(2, i);
        if (power > n) {break;}
        if (n & power) {result++}
    }
    return result;
}


function sortFlags(enum_: { [key: string]: string }) : string[] {
    let powerArrays: string[][] = [];
    for (let enumMember in enum_) {
        let val = enum_[enumMember];
        let n = Number(val);
        let powers = countPowersOfTwo(n);
        if (powerArrays[powers] === undefined) { // create the array if it doesn't exist, no Perl autovivifying, bummer
            powerArrays[powers] = [];
        }
        powerArrays[powers].push(enumMember);
    }
    return powerArrays.reverse().flat();
}

// Handle fake bitenums like ts.NodeFlags. Note the AwaitUsing = 6 which should not be reported as Const | Using
// So we sort the flags on the number of powers of two they contain and consume first the ones with the most powers of 
// two. Or maybe AwaitUsing should _also_ be reported as Await | Using ?

// enum NodeFlags {
//     None = 0,
//     Let = 1,
//     Const = 2,
//     Using = 4,
//     AwaitUsing = 6,
//     NestedNamespace = 8,
//     Synthesized = 16,
//     Namespace = 32,
//     ...
// }


interface BitEnumInfo  { 
    enum_: { [key: string]: string },
    sortedFlags: string[]
}
let knownBitEnums : BitEnumInfo[]


export function getEnumBitFlags(flags: number, enum_: { [key: string]: string }): string {
    // insteead of calculating at each time we  ache the sorted flags for each bitenum.
    // The cost is we have to keep track of the bitenums we have seen and search them lineraly
    let sortedFlags: string[];
    let foundEnum = false;
    for (let bitEnumInfo of knownBitEnums) {
        if (bitEnumInfo.enum_ === enum_) {
            sortedFlags = bitEnumInfo.sortedFlags;
            break;
        }
    }
    if (!foundEnum) {
        sortedFlags = sortFlags(enum_);
        knownBitEnums.push({enum_, sortedFlags});
    }
    let recognizedFlags: string[] = [];
    for (let enumMember in sortFlags) {
        let val : number  = Number(enum_[enumMember]);

        if ((flags & Number(val)) !== 0) {
            flags 
            recognizedFlags.push(enumMember);
        }
    }
    return recognizedFlags.join(' ');
}



function stringifyItem(key: string, val: any): string {
    switch (key) {
        case 'kind':
            return `${key}: ${ts.SyntaxKind[val]}`;
        case 'flags':
            return `${key}: ${getEnumBitFlags(val, ts.NodeFlags as unknown as { [key: string]: string })}`;

        default:
            return `${key}: ${val}`;

    }
}

export class ASTProvider implements vscode.TreeDataProvider<ASTItem> {
    // onDidChangeTreeData: vscode.Event<ASTItem | null | undefined> | undefined 
    private _onDidChangeTreeData: vscode.EventEmitter<ASTItem | undefined | null | void> = new vscode.EventEmitter<ASTItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ASTItem | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(root: ts.Node): void {
        this.root = root
        this._onDidChangeTreeData.fire();
    }

    constructor(
        public root: ts.Node | null = null
    ) {
        this.onDidChangeTreeData = new vscode.EventEmitter<ASTItem | null | undefined>().event
    }
    getTreeItem(element: ASTItem): vscode.TreeItem {
        return element;
    }
    getChildren(element?: ASTItem | undefined): vscode.ProviderResult<ASTItem[]> {
        function handleKey(key: string, element: ASTItem) {
            let val = element.astNode![key];
            let str = typeof val === 'object' ? key : stringifyItem(key, val);
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