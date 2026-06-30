import type { Finding, RuleMetadata } from "@nohardcoding/nohardtext-domain";
import { normalizeUserFacingText } from "./text-utils";

export const crossFileDuplicateRuleMetadata: RuleMetadata = {
  id: "NHT2001",
  name: "Cross-File Duplicate",
  category: "developer-experience",
  severity: "low",
  description:
    "Detects the same hardcoded text value duplicated across two or more files, with no single source of truth.",
  fixable: true
};

export interface CrossFileDuplicateOptions {
  /** Minimum number of distinct files a value must appear in to be flagged. */
  minOccurrences?: number;
}

const DEFAULT_MIN_OCCURRENCES = 2;

function groupFindingsByNormalizedValue(findings: Finding[]): Map<string, Finding[]> {
  const groups = new Map<string, Finding[]>();

  for (const finding of findings) {
    if (!finding.value) {
      continue;
    }

    const normalized = normalizeUserFacingText(finding.value).toLowerCase();

    if (!normalized) {
      continue;
    }

    const existing = groups.get(normalized);

    if (existing) {
      existing.push(finding);
    } else {
      groups.set(normalized, [finding]);
    }
  }

  return groups;
}

function createCrossFileDuplicateFinding(members: Finding[], index: number): Finding {
  const files = [...new Set(members.map((finding) => finding.location.filePath))].sort();
  const displayValue = members[0]?.value ?? "";
  const primaryLocation = members[0].location;

  return {
    id: `NHT2001:${index}:${primaryLocation.filePath}:${primaryLocation.startLine}`,
    ruleId: crossFileDuplicateRuleMetadata.id,
    severity: crossFileDuplicateRuleMetadata.severity,
    category: crossFileDuplicateRuleMetadata.category,
    message: `Hardcoded text "${displayValue}" is duplicated across ${files.length} files.`,
    explanation:
      "The same hardcoded value appears in multiple files with no single source of truth. " +
      "A future change to one location can silently drift from the others. Consider extracting " +
      "this value to a shared constant or localization key referenced by every usage.",
    location: primaryLocation,
    value: displayValue,
    fixable: true,
    suggestions: [
      {
        message: `Extract this value to one shared location referenced by all ${files.length} files: ${files.join(", ")}.`
      }
    ]
  };
}

/**
 * Detects the same hardcoded value duplicated across two or more files.
 *
 * Unlike the other built-in rules, this does not operate on a single file's
 * source text — it runs as a second pass over findings already produced
 * across the full scanned set, grouping by normalized value. Call this
 * after collecting per-file findings and merge its output into the final
 * findings array before generating the report summary.
 */
export function detectCrossFileDuplicates(
  findings: Finding[],
  options: CrossFileDuplicateOptions = {}
): Finding[] {
  const minOccurrences = options.minOccurrences ?? DEFAULT_MIN_OCCURRENCES;
  const groups = groupFindingsByNormalizedValue(findings);

  const results: Finding[] = [];
  let index = 0;

  for (const members of groups.values()) {
    const distinctFiles = new Set(members.map((finding) => finding.location.filePath));

    if (distinctFiles.size < minOccurrences) {
      continue;
    }

    results.push(createCrossFileDuplicateFinding(members, index));
    index += 1;
  }

  return results;
}
