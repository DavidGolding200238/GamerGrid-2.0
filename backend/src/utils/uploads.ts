export const toRelativeUploadPath = (value?: string | null): string | null => {
  if (!value) {
    return value ?? null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const absoluteMatch = trimmed.match(/^https?:\/\/[^/]+(\/uploads\/.*)$/i);
  if (absoluteMatch?.[1]) {
    return absoluteMatch[1];
  }

  if (trimmed.startsWith("/uploads/")) {
    return trimmed;
  }

  if (trimmed.startsWith("uploads/")) {
    return `/${trimmed}`;
  }

  return trimmed;
};

export const normalizeUploadFields = <T extends Record<string, any>>(entity: T, fields: string[]): T => {
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(entity, field)) {
      const key = field as keyof T;
      const value = entity[key];
      if (typeof value === "string" || value === null || value === undefined) {
        entity[key] = (toRelativeUploadPath(value) ?? value) as T[typeof key];
      }
    }
  }
  return entity;
};

export const normalizeUploadCollection = <T extends Record<string, any>>(items: T[], fields: string[]): T[] => {
  for (const item of items) {
    normalizeUploadFields(item, fields);
  }
  return items;
};
