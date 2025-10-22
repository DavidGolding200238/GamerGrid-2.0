export const API_BASE: string = import.meta.env.VITE_API_BASE ?? '/api';

export const apiUrl = (path: string) =>
  `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

export const imgSrc = (u?: string | null): string | undefined => {
  if (!u) return undefined;
  const trimmed = u.trim();
  if (!trimmed) return undefined;
  const absoluteMatch = trimmed.match(/^https?:\/\/[^/]+(\/uploads\/.*)$/i);
  if (absoluteMatch?.[1]) {
    return absoluteMatch[1];
  }
  if (trimmed.startsWith('/uploads/')) {
    return trimmed;
  }
  if (trimmed.startsWith('uploads/')) {
    return `/${trimmed}`;
  }
  return trimmed;
};
