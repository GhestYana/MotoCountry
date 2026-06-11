/**
 * Нормалізує поле image:
 * - якщо вже масив JS — повертає перший елемент
 * - якщо рядок у форматі PostgreSQL array literal "{url1,url2}" — парсить і повертає перший
 * - якщо звичайний рядок — повертає як є
 * - null/undefined — повертає null
 */
function normalizeImage(image) {
  if (!image) return null;
  if (Array.isArray(image)) return image[0] || null;
  if (typeof image === 'string') {
    const trimmed = image.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      // PostgreSQL array literal: {url1,url2,...}
      const inner = trimmed.slice(1, -1);
      // Split by comma but respect quoted strings
      const parts = inner.match(/(?:[^,"]+|"[^"]*")+/g) || [];
      const first = parts[0]?.replace(/^"|"$/g, '').trim();
      return first || null;
    }
    // TEXT колонка с несколькими URL через запятую
    if (trimmed.includes(',')) {
      return trimmed.split(',')[0].trim() || null;
    }
    return trimmed || null;
  }
  return null;
}

/**
 * Повертає всі зображення як масив рядків
 */
function normalizeImages(image) {
  if (!image) return [];
  if (Array.isArray(image)) return image.filter(Boolean);
  if (typeof image === 'string') {
    const trimmed = image.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const inner = trimmed.slice(1, -1);
      const parts = inner.match(/(?:[^,"]+|"[^"]*")+/g) || [];
      return parts.map(p => p.replace(/^"|"$/g, '').trim()).filter(Boolean);
    }
    // TEXT колонка с несколькими URL через запятую
    if (trimmed.includes(',')) {
      return trimmed.split(',').map(p => p.trim()).filter(Boolean);
    }
    return trimmed ? [trimmed] : [];
  }
  return [];
}

module.exports = { normalizeImage, normalizeImages };
