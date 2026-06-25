import { describe, expect, it } from 'vitest';
import { runRules, type Rule } from './index';

describe('@nohardtext/rule-engine', () => {
  it('runs rules and returns findings', () => {
    const rule: Rule = {
      id: 'NHT1001',
      name: 'JSX Text',
      run: () => [
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
          suggestions: [{ message: 'Extract to translation key.' }]
        }
      ]
    };

    const findings = runRules([rule], {
      filePath: 'src/App.tsx',
      sourceText: '<h1>Welcome</h1>'
    });

    expect(findings).toHaveLength(1);
    expect(findings[0]?.ruleId).toBe('NHT1001');
  });
});
