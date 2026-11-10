export function enumParam<T extends string>(
  value: string | null | undefined,
  allowed: readonly T[],
): T | undefined {
  if (!value) return undefined;
  return (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}

export function textParam(value: string | null | undefined, max = 120): string | undefined {
  const v = value?.trim();
  return v ? v.slice(0, max) : undefined;
}
