#!/usr/bin/env node
import { Finding } from '@nohardtext/domain';
import { ReportSummary } from '@nohardtext/report-engine';

interface ScanOutput {
    scannedFiles: number;
    findings: Finding[];
    summary: ReportSummary;
}
declare function getCliBanner(): string;
declare function runRulesList(): string;
declare function createScanOutput(targetPath: string, cwd?: string): ScanOutput;
declare function runScan(targetPath: string, cwd?: string): string;
declare function runScanJson(targetPath: string, cwd?: string): string;
declare function runCli(args?: string[]): Promise<void>;

export { type ScanOutput, createScanOutput, getCliBanner, runCli, runRulesList, runScan, runScanJson };
