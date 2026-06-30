export function requireFields<T extends object>(obj: T, keys: readonly (keyof T)[]): void {
  const missing = keys.filter((key) => !obj[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required frontmatter: ${missing.map(String).join(', ')}`);
  }
}

export function toIsoDatetime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return date.toISOString();
}
