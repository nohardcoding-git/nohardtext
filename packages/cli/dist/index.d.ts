#!/usr/bin/env node
import { Severity, Finding } from '@nohardtext/domain';
import { ReportSummary } from '@nohardtext/report-engine';

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
declare function shouldSkipDirectory(directoryName: string): boolean;
declare function shouldFail(findings: Finding[], failOn?: Severity): boolean;
declare function runRulesList(): string;
declare function createScanOutput(targetPath: string, cwd?: string): ScanOutput;
declare function runScan(targetPath: string, cwd?: string, options?: CliOptions): string;
declare function runScanJson(targetPath: string, cwd?: string): string;
declare function runCli(args?: string[]): Promise<void>;

export { type CliOptions, type ScanOutput, createScanOutput, getCliBanner, runCli, runRulesList, runScan, runScanJson, shouldFail, shouldSkipDirectory };
