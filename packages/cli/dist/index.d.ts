#!/usr/bin/env node
declare function getCliBanner(): string;
declare function runScan(targetPath: string, cwd?: string): string;
declare function runCli(args?: string[]): Promise<void>;

export { getCliBanner, runCli, runScan };
