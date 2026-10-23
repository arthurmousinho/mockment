/** Combines model-specific search filters without replacing other constraints. */
export function buildSearchFilter<TFilter>(
  search: string | undefined,
  filters: readonly ((term: string) => TFilter)[],
): { OR?: TFilter[] } {
  const term = search?.trim();
  if (!term || filters.length === 0) return {};

  return { OR: filters.map((filter) => filter(term)) };
}
