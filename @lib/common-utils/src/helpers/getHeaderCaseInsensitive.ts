export const getHeaderCaseInsensitive = (
  headers: Record<string, string | undefined> | undefined,
  headerName: string
): string | undefined => {
  if (!headers) return undefined;
  const lower = headerName.toLowerCase();
  const key = Object.keys(headers).find(k => k.toLowerCase() === lower);
  return key ? headers[key] : undefined;
};
