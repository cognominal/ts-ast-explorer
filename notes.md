# random developper notes

trying to import piecemeal for vscode-ast.
I discover the diff between "ES2020" and "es6" in tsconfig.json.
So I need to correct the imported stuff.

ES2020 ask to initialize class properties.

## Examining [vscode-ast](https://github.com/thzt/vscode-ast) for ideas

it is built around ts watcher(s) like WatchOfFilesAndCompilerOptions

I note the treeview is not always displayed.
It seems created on demand.
I discover OutputChannel that is proper to the treeview provider.
Why not the extension. Better than console.log.

I put in ./utils stuff that is not specific to the projects and
could be reused in other extensions.
Not worth creating a separate package though.

constant.ts
moved to src/constants.ts because specic to the extension
Also a good place for localizable strings.
now what about a src/global.ts. What is global to the extension?

## idioms

Scalable way to assign scoped variables to object member.
But does not work with "target": "ES2020" in tsconfig.json, was
"es6"in vscode-ast.

```ts
    // set other properties in the instance
    Object.assign(this, {
      sourceFile,
      node,
    });
```

```ts
    // set other properties in the instance
    Object.assign(this, {
      sourceFile,
      node,
    });
```

can be ./treeview.ts or ./treeview/index.ts

```ts
import TreeViewManager from './treeview';
``````

# refactor

`extension.ts` contains the global variable and calls the UI setting code that sets these
variables. Eventually it calls the event handlers that are in `eventhandlers.ts