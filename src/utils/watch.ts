import * as ts from 'typescript';

import { noop, defaultOptions } from '../constants';

export const createEmptyWatchProgram = ({ onFileChanged }: { onFileChanged: (fileName: string, eventKind: ts.FileWatcherEventKind) => Promise<void> }) => {
  const rootFiles: string[] = [];
  const options = defaultOptions;

  // these two report callback is not required
  const reportDiagnostic = noop;
  const reportWatchStatus = noop;

  const host = ts.createWatchCompilerHost(
    rootFiles,
    options,
    ts.sys,
    ts.createEmitAndSemanticDiagnosticsBuilderProgram,
    reportDiagnostic,
    reportWatchStatus,
  ) as any;

  // host's default `afterProgramCreate` will emit files, instead of doing nothing
  host.afterProgramCreate = noop;

  // intercept file changed event and get the incremental parsing result
  const originalHostWatchFile = host.watchFile;
  host.watchFile = (path: string, callback: ts.FileWatcherCallback, pollingInterval?: number, options?: ts.CompilerOptions) => {
    return originalHostWatchFile(path, async (fileName: string, eventKind: ts.FileWatcherEventKind) => {
      callback(fileName, eventKind);
      await onFileChanged(fileName, eventKind);
    }, pollingInterval, options);
  };

  const watchProgram = ts.createWatchProgram(host);
  return watchProgram;
};

