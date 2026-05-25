/** Backend expects: motorcycle | equipment | component */
export function normalizeProductCategory(category) {
  if (!category) return null;
  const c = String(category).toLowerCase();
  if (c === 'motorcycles' || c === 'motorcycle' || c === 'product') return 'motorcycle';
  if (c === 'equipment' || c === 'equipments') return 'equipment';
  if (c === 'components' || c === 'component' || c === 'accessories') return 'component';
  return c.endsWith('s') ? c.slice(0, -1) : c;
}
