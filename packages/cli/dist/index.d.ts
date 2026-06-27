#!/usr/bin/env node
import { Severity, Finding } from '@nohardtext/domain';
import { ReportSummary } from '@nohardtext/report-engine';

interface NoHardTextConfig {
    ignore?: string[];
    failOn?: Severity;
    componentTextProps?: string[];
}
interface ScanOutput {
    schemaVersion: "1.0";
    tool: {
        name: "NoHardText";
        version: string;
    };
    scannedFiles: number;
    findings: Finding[];
    summary: ReportSummary;
    ci: {
        enabled: boolean;
        failOn?: Severity;
        passed: boolean;
    };
}
interface CliOptions {
    json: boolean;
    failOn?: Severity;
    outputPath?: string;
}
interface ScanOutputOptions {
    failOn?: Severity;
}
declare function getCliBanner(): string;
declare function loadConfig(cwd?: string): NoHardTextConfig;
declare function getIgnoredDirectories(config?: NoHardTextConfig): Set<string>;
declare function shouldSkipDirectory(directoryName: string, ignoredDirectories?: Set<string>): boolean;
declare function shouldFail(findings: Finding[], failOn?: Severity): boolean;
declare function runRulesList(): string;
declare function createScanOutput(targetPath: string, cwd?: string, config?: NoHardTextConfig, options?: ScanOutputOptions): ScanOutput;
declare function formatScanOutput(output: ScanOutput, options?: CliOptions): string;
declare function runScan(targetPath: string, cwd?: string, options?: CliOptions, config?: NoHardTextConfig): string;
declare function runScanJson(targetPath: string, cwd?: string, config?: NoHardTextConfig, options?: ScanOutputOptions): string;
declare function runCli(args?: string[]): Promise<void>;

export { type CliOptions, type NoHardTextConfig, type ScanOutput, type ScanOutputOptions, createScanOutput, formatScanOutput, getCliBanner, getIgnoredDirectories, loadConfig, runCli, runRulesList, runScan, runScanJson, shouldFail, shouldSkipDirectory };
