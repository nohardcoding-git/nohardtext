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
    generatedAt: string;
    scannedFiles: number;
    files: string[];
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
    githubAnnotations?: boolean;
}
interface ScanOutputOptions {
    failOn?: Severity;
}
declare function getCliBanner(): string;
declare function getCliVersion(): string;
declare function formatVersionOutput(): string;
declare function formatHelpOutput(): string;
declare function loadConfig(cwd?: string): NoHardTextConfig;
declare function getIgnoredDirectories(config?: NoHardTextConfig): Set<string>;
declare function shouldSkipDirectory(directoryName: string, ignoredDirectories?: Set<string>): boolean;
declare function shouldFail(findings: Finding[], failOn?: Severity): boolean;
declare function runRulesList(): string;
declare function createScanOutput(targetPath: string, cwd?: string, config?: NoHardTextConfig, options?: ScanOutputOptions): ScanOutput;
declare function formatScanOutput(output: ScanOutput, options?: CliOptions): string;
declare function formatGithubAnnotationOutput(output: ScanOutput): string;
declare function runScan(targetPath: string, cwd?: string, options?: CliOptions, config?: NoHardTextConfig): string;
declare function runScanJson(targetPath: string, cwd?: string, config?: NoHardTextConfig, options?: ScanOutputOptions): string;
declare function runCli(args?: string[]): Promise<void>;

export { type CliOptions, type NoHardTextConfig, type ScanOutput, type ScanOutputOptions, createScanOutput, formatGithubAnnotationOutput, formatHelpOutput, formatScanOutput, formatVersionOutput, getCliBanner, getCliVersion, getIgnoredDirectories, loadConfig, runCli, runRulesList, runScan, runScanJson, shouldFail, shouldSkipDirectory };
