// src/index.ts
function runRules(rules, context) {
  return rules.flatMap((rule) => rule.run(context));
}
export {
  runRules
};
