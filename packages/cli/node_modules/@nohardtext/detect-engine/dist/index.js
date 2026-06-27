// src/index.ts
import { runRules } from "@nohardtext/rule-engine";

// src/rules/string-attribute.ts
import { collectJsxAttributeStringValues } from "@nohardtext/parser";

// src/rules/text-utils.ts
var LETTER_PATTERN = /\p{L}/u;
var URL_OR_EMAIL_PATTERN = /^(https?:\/\/|mailto:|www\.|\S+@\S+\.\S+)/iu;
var VERSION_TOKEN_PATTERN = /^v?\d+(?:[._-]\d+)*$/iu;
var TECHNICAL_TOKEN_WITH_DIGIT_PATTERN = /^[a-z]+[a-z\d._-]*\d[a-z\d._-]*$/iu;
function normalizeUserFacingText(value) {
  return value.replace(/\s+/g, " ").trim();
}
function isProbablyLocalizableText(value) {
  const text = normalizeUserFacingText(value);
  if (!text) {
    return false;
  }
  if (URL_OR_EMAIL_PATTERN.test(text)) {
    return false;
  }
  if (!LETTER_PATTERN.test(text)) {
    return false;
  }
  if (VERSION_TOKEN_PATTERN.test(text)) {
    return false;
  }
  if (TECHNICAL_TOKEN_WITH_DIGIT_PATTERN.test(text)) {
    return false;
  }
  return true;
}

// src/rules/string-attribute.ts
function isCustomComponentElement(elementName) {
  if (!elementName) {
    return false;
  }
  return /^[A-Z]/.test(elementName);
}
function detectStringAttribute(filePath, sourceText, config) {
  return collectJsxAttributeStringValues(sourceText, [config.attributeName]).filter((node) => isProbablyLocalizableText(node.value)).filter(
    (node) => config.customComponentsOnly ? isCustomComponentElement(node.elementName) : true
  ).map((node, index) => ({
    id: `${filePath}:${config.ruleId}:${node.startLine}:${node.startColumn}:${index}`,
    ruleId: config.ruleId,
    severity: config.severity ?? "high",
    category: config.category ?? "localization",
    message: `${config.messagePrefix}: "${node.value}"`,
    explanation: config.explanation,
    location: {
      filePath,
      startLine: node.startLine,
      startColumn: node.startColumn,
      endLine: node.endLine,
      endColumn: node.endColumn
    },
    fixable: true,
    suggestions: [
      {
        message: config.suggestion
      }
    ]
  }));
}

// src/rules/alt.ts
function detectAltAttributeText(filePath, sourceText) {
  return detectStringAttribute(filePath, sourceText, {
    attributeName: "alt",
    ruleId: "NHT1005",
    messagePrefix: "Hardcoded alt attribute found",
    explanation: "User-facing image alt text should be moved to localization files.",
    suggestion: "Extract this alt text to a localization key.",
    category: "accessibility"
  });
}

// src/rules/aria-label.ts
function detectAriaLabelText(filePath, sourceText) {
  return detectStringAttribute(filePath, sourceText, {
    attributeName: "aria-label",
    ruleId: "NHT1004",
    messagePrefix: "Hardcoded aria-label found",
    explanation: "User-facing accessibility labels should be moved to localization files.",
    suggestion: "Extract this aria-label to a localization key.",
    category: "accessibility"
  });
}

// src/rules/jsx-text.ts
import {
  collectJsxExpressionStringValues,
  collectJsxTextNodes
} from "@nohardtext/parser";
function createJsxTextFinding(filePath, node, index) {
  return {
    id: `${filePath}:NHT1001:${node.startLine}:${node.startColumn}:${index}`,
    ruleId: "NHT1001",
    severity: "high",
    category: "localization",
    message: `Hardcoded JSX text found: "${node.text}"`,
    explanation: "User-facing JSX text should be moved to localization files.",
    location: {
      filePath,
      startLine: node.startLine,
      startColumn: node.startColumn,
      endLine: node.endLine,
      endColumn: node.endColumn
    },
    fixable: true,
    suggestions: [
      {
        message: "Replace the text with a localized translation key."
      }
    ]
  };
}
function detectJsxText(filePath, sourceText) {
  const textNodes = collectJsxTextNodes(sourceText).map((node) => ({
    text: node.text,
    startLine: node.startLine,
    startColumn: node.startColumn,
    endLine: node.endLine,
    endColumn: node.endColumn
  }));
  const expressionStringNodes = collectJsxExpressionStringValues(sourceText).map((node) => ({
    text: node.value,
    startLine: node.startLine,
    startColumn: node.startColumn,
    endLine: node.endLine,
    endColumn: node.endColumn
  }));
  return [...textNodes, ...expressionStringNodes].filter((node) => isProbablyLocalizableText(node.text)).map((node, index) => createJsxTextFinding(filePath, node, index));
}

// src/rules/placeholder.ts
function detectPlaceholderText(filePath, sourceText) {
  return detectStringAttribute(filePath, sourceText, {
    attributeName: "placeholder",
    ruleId: "NHT1002",
    messagePrefix: "Hardcoded placeholder found",
    explanation: "User-facing placeholder text should be moved to localization files.",
    suggestion: "Extract this placeholder to a localization key."
  });
}

// src/rules/title.ts
function detectTitleAttributeText(filePath, sourceText) {
  return detectStringAttribute(filePath, sourceText, {
    attributeName: "title",
    ruleId: "NHT1003",
    messagePrefix: "Hardcoded title attribute found",
    explanation: "User-facing title attributes should be moved to localization files.",
    suggestion: "Extract this title attribute to a localization key."
  });
}

// src/rules/custom-component-prop.ts
var COMPONENT_TEXT_PROPS = [
  "label",
  "description",
  "helperText",
  "emptyText",
  "confirmText",
  "cancelText",
  "submitText",
  "closeText",
  "primaryText",
  "secondaryText"
];
function detectCustomComponentPropText(filePath, sourceText) {
  return COMPONENT_TEXT_PROPS.flatMap(
    (attributeName) => detectStringAttribute(filePath, sourceText, {
      attributeName,
      ruleId: "NHT1006",
      messagePrefix: `Hardcoded component prop "${attributeName}" found`,
      explanation: "User-facing component prop text should be moved to localization files.",
      suggestion: "Move this component prop text to a localization key.",
      category: "localization",
      severity: "high",
      customComponentsOnly: true
    })
  );
}

// src/rules/registry.ts
var builtInRules = [
  {
    metadata: {
      id: "NHT1001",
      name: "JSX Text",
      category: "localization",
      severity: "high",
      description: "Detects hardcoded user-facing text inside JSX nodes.",
      fixable: true
    },
    detect: detectJsxText
  },
  {
    metadata: {
      id: "NHT1002",
      name: "Placeholder Attribute",
      category: "localization",
      severity: "high",
      description: "Detects hardcoded placeholder attribute values.",
      fixable: true
    },
    detect: detectPlaceholderText
  },
  {
    metadata: {
      id: "NHT1003",
      name: "Title Attribute",
      category: "localization",
      severity: "high",
      description: "Detects hardcoded title attribute values.",
      fixable: true
    },
    detect: detectTitleAttributeText
  },
  {
    metadata: {
      id: "NHT1004",
      name: "ARIA Label",
      category: "accessibility",
      severity: "high",
      description: "Detects hardcoded aria-label attribute values.",
      fixable: true
    },
    detect: detectAriaLabelText
  },
  {
    metadata: {
      id: "NHT1005",
      name: "Alt Attribute",
      category: "accessibility",
      severity: "high",
      description: "Detects hardcoded image alt attribute values.",
      fixable: true
    },
    detect: detectAltAttributeText
  },
  {
    metadata: {
      id: "NHT1006",
      name: "Component Text Prop",
      category: "localization",
      severity: "high",
      description: "Detects hardcoded user-facing text passed through common component props.",
      fixable: true
    },
    detect: detectCustomComponentPropText
  }
];
var builtInRuleDetectors = builtInRules.map((rule) => rule.detect);
function getBuiltInRuleMetadata() {
  return builtInRules.map((rule) => rule.metadata);
}

// src/index.ts
function sortFindingsByLocation(findings) {
  return [...findings].sort((left, right) => {
    const filePathOrder = left.location.filePath.localeCompare(
      right.location.filePath
    );
    if (filePathOrder !== 0) {
      return filePathOrder;
    }
    if (left.location.startLine !== right.location.startLine) {
      return left.location.startLine - right.location.startLine;
    }
    if (left.location.startColumn !== right.location.startColumn) {
      return left.location.startColumn - right.location.startColumn;
    }
    return left.ruleId.localeCompare(right.ruleId);
  });
}
function detect(input) {
  const ruleFindings = input.rules ? runRules(input.rules, {
    filePath: input.filePath,
    sourceText: input.sourceText
  }) : [];
  const builtInFindings = builtInRules.flatMap(
    (rule) => rule.detect(input.filePath, input.sourceText)
  );
  return {
    filePath: input.filePath,
    findings: sortFindingsByLocation([...ruleFindings, ...builtInFindings])
  };
}
export {
  detect,
  detectAltAttributeText,
  detectAriaLabelText,
  detectCustomComponentPropText,
  detectJsxText,
  detectPlaceholderText,
  detectTitleAttributeText,
  getBuiltInRuleMetadata,
  sortFindingsByLocation
};
