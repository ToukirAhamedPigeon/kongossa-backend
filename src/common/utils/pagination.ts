export function paginate(total: number, page: number, perPage: number) {
  const totalPages = Math.ceil(total / perPage);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    page,
    perPage,
    total,
    totalPages,
    hasNext,
    hasPrev,
  };
}