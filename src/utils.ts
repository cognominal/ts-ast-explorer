import * as ts from 'typescript';
import * as vscode from 'vscode';


export function nrOfBits(n : number) {
    let result = 0 ;
    for (let i = 0;; i++) {
        let power = Math.pow(2, i);
        if (power > n) {break;}
        if (n & power) {result++}
    }
    return result;
}

// I have not seen that documented anywhere 
// And I can't see how it works when values associated with the keys are not numbers
//  hum: https://stackoverflow.com`/questions/21293063/how-to-programmatically-enumerate-an-enum-type
export type EnumType = { [key: string|number]: string|number }
// we filter it so in effect it is 
export type FilteredEnumType = { [key: string]: number }

export type CuratedEnum = { sortedEnumSymbols:string[], zeroName: string }

export function curateEnum(enum_: EnumType): CuratedEnum {
    let powerArrays: string[][] = [];
    let zeroName = '0'
    for (let key in enum_) {
        if (key === '0') {
            zeroName = enum_[key] as string;
            continue;
        }
        let num = Number(enum_[key]);
        if (isNaN(num)) {
            continue;
        } // skip the string keys
        let bits = nrOfBits(num);
        if (powerArrays[bits] === undefined) { // create the array if it doesn't exist, no Perl autovivifying, bummer
            powerArrays[bits] = [];
        }
        powerArrays[bits].push(key);
    }
    powerArrays.shift(); 
    let sorted = powerArrays.reverse().flat();
    return {sortedEnumSymbols: sorted, zeroName};
}

// Handle fake bitenums like ts.NodeFlags. Note the AwaitUsing = 6 
// which should not be reported as Const | Using
// So we sort the flags on the number of powers of two they contain and 
//consume first the ones with the most powers of 
// two. Or maybe AwaitUsing should _also_ be reported as Await | Using ?

// enum NodeFlags {
//     None = 0,
//     Let = 1,
//     Const = 2,
//     Using = 4,
//     AwaitUsing = 6,
//     ...
// }


interface BitEnumInfo  { 
    enum_: EnumType,
    curatedEnum: CuratedEnum
}
let knownBitEnums : BitEnumInfo[] = []


export function getEnumBitFlags(flags: number, enum_: EnumType): string {
    // insteead of calculating at each time we  ache the sorted flags for each bitenum.
    // The cost is we have to keep track of the bitenums we have seen and search them lineraly
    let curatedEnum : CuratedEnum = { zeroName: '0', sortedEnumSymbols: []}
    let foundEnum = false;
    // search cache of bitenums
    for (let bitEnumInfo of knownBitEnums) {
        if (bitEnumInfo.enum_ === enum_) {
            curatedEnum = bitEnumInfo.curatedEnum;
            break;
        }
    }
    // if not in cache, calculate and add to cache
    if (!foundEnum) {
        curatedEnum = curateEnum(enum_);
        knownBitEnums.push({enum_, curatedEnum});
    }
    let recognizedFlags: string[] = [];
    for (let enumMember of curatedEnum.sortedEnumSymbols) {
        let val : number  = Number(enum_[enumMember]);

        if ((flags & val) === val) {
            flags ^= val;
            recognizedFlags.push(enumMember);
        }
    }
    if (recognizedFlags.length === 0) {
        return curatedEnum.zeroName;
    } else {
    return recognizedFlags.join(' ');
    }
}

type SupportedLangs = {
    [key: string]: ts.ScriptKind;
}
const supportedLangs : SupportedLangs = {
    "typescript": ts.ScriptKind.TS,
    "typescriptreact": ts.ScriptKind.TSX,
    "javascript": ts.ScriptKind.JS,
    "javascriptreact": ts.ScriptKind.JSX,
    "json": ts.ScriptKind.JSON,
    // "external": ts.ScriptKind.External
}

function isSupportedLang(lang: string): boolean {
    return lang in supportedLangs;
}

export function compile(editor: vscode.TextEditor): ts.SourceFile {
    const code = editor.document.getText();
        
    let filetype = getFileType();
    let scriptKind: ts.ScriptKind = ts.ScriptKind.External;
    if (typeof filetype === 'string' && isSupportedLang(filetype)) {
        scriptKind = supportedLangs[filetype];
    }

    let ast = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true, scriptKind);
    return ast;
}
function getFileType(): string | undefined {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        const document = activeEditor.document;
        const id = document.languageId;
        console.log('getFileType ' + id)
        return id;
    }
    return undefined;
}
