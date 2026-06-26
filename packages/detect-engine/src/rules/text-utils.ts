const LETTER_PATTERN = /\p{L}/u;
const URL_OR_EMAIL_PATTERN = /^(https?:\/\/|mailto:|www\.|\S+@\S+\.\S+)/iu;
const VERSION_TOKEN_PATTERN = /^v?\d+(?:[._-]\d+)*$/iu;
const TECHNICAL_TOKEN_WITH_DIGIT_PATTERN = /^[a-z]+[a-z\d._-]*\d[a-z\d._-]*$/iu;

export function normalizeUserFacingText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function isProbablyLocalizableText(value: string): boolean {
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
