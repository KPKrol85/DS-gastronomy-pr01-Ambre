const normalize = (value) =>
  (value || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export function matchesCategory(categories, filter) {
  const normalizedFilter = normalize(filter);
  const tokens = normalize(categories).split(/[\s,]+/).filter(Boolean);
  return normalizedFilter === "" || normalizedFilter === "all" || tokens.includes(normalizedFilter);
}
