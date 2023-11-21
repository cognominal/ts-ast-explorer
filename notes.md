# random developper notes

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

Scalable way to assign scoped variables to object member/

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
