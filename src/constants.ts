
export const command = {
    // package.json#contributes.commands[].command
    focusAst: 'ast.focus',
  };
  
  // package.json#contributes.view.explorer[].id
  export const treeViewId = 'ast';
  
  
  // tsconfig.json: default configuration
  export const defaultOptions = {
    allowJs: true,
  };
  
  export const expandingLevel = 3;  // VSCode convention: TreeView maximum expanding level = 3
  export const delay = 100;  // retry delay time (ms)
  export const retry = 30 * 1000 / delay;  // retry times to wait TreeView loaded (30s)
  
  export const channelName = 'AST TypeScript AST';
  
  export const logPrefix = 'Info >> ';
  export const errorPrefix = 'Error >> ';
  
  // empty function
  export const noop = () => { };
  