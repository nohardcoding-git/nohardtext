#!/usr/bin/env node
import { Severity, Finding } from '@nohardtext/domain';
import { ReportSummary } from '@nohardtext/report-engine';

interface NoHardTextConfig {
    ignore?: string[];
    failOn?: Severity;
    componentTextProps?: string[];
}
interface ScanOutput {
    scannedFiles: number;
    findings: Finding[];
    summary: ReportSummary;
}
interface CliOptions {
    json: boolean;
    failOn?: Severity;
}
declare function getCliBanner(): string;
declare function loadConfig(cwd?: string): NoHardTextConfig;
declare function getIgnoredDirectories(config?: NoHardTextConfig): Set<string>;
declare function shouldSkipDirectory(directoryName: string, ignoredDirectories?: Set<string>): boolean;
declare function shouldFail(findings: Finding[], failOn?: Severity): boolean;
declare function runRulesList(): string;
declare function createScanOutput(targetPath: string, cwd?: string, config?: NoHardTextConfig): ScanOutput;
declare function formatScanOutput(output: ScanOutput, options?: CliOptions): string;
declare function runScan(targetPath: string, cwd?: string, options?: CliOptions, config?: NoHardTextConfig): string;
declare function runScanJson(targetPath: string, cwd?: string, config?: NoHardTextConfig): string;
declare function runCli(args?: string[]): Promise<void>;

export { type CliOptions, type NoHardTextConfig, type ScanOutput, createScanOutput, formatScanOutput, getCliBanner, getIgnoredDirectories, loadConfig, runCli, runRulesList, runScan, runScanJson, shouldFail, shouldSkipDirectory };
