/** Maps a lean Mongo document to the API shape: `_id` → `id`, dates → ISO strings. */
export function toResponse<T extends Record<string, unknown>>(doc: T & { _id: unknown }) {
  const { _id, createdAt, updatedAt, publishedAt, ...rest } = doc as Record<string, unknown>;
  return {
    ...rest,
    id: String(_id),
    updatedAt: toIso(updatedAt) ?? new Date(0).toISOString(),
    ...(publishedAt ? { publishedAt: toIso(publishedAt) } : {}),
    ...(createdAt ? { createdAt: toIso(createdAt) } : {}),
  };
}

function toIso(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return undefined;
}
