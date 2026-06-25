import { describe, expect, it } from 'vitest';
import { createReportSummary } from './index';

describe('@nohardtext/report-engine', () => {
  it('creates a summary and health score', () => {
    const summary = createReportSummary({
      findings: [
        {
          id: 'finding-1',
          ruleId: 'NHT1001',
          severity: 'high',
          category: 'localization',
          message: 'Hardcoded text found.',
          explanation: 'Move user-facing text to localization files.',
          location: {
            filePath: 'src/App.tsx',
            startLine: 1,
            startColumn: 1,
            endLine: 1,
            endColumn: 10
          },
          fixable: true,
          suggestions: []
        }
      ]
    });

    expect(summary.totalFindings).toBe(1);
    expect(summary.high).toBe(1);
    expect(summary.healthScore.score).toBe(88);
    expect(summary.healthScore.grade).toBe('A');
  });
});
