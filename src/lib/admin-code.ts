/** Constant-time comparison of the entered admin code with the expected one. */
export function isValidAdminCode(input: string, expected: string | undefined): boolean {
  if (!expected) return false;
  const a = String(input ?? "").trim();
  let diff = a.length ^ expected.length;
  for (let i = 0; i < Math.max(a.length, expected.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (expected.charCodeAt(i) || 0);
  }
  return diff === 0;
}
