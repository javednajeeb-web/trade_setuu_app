const translationCache = new Map();

export async function translateText(text, targetLang = 'en') {
  const cleanText = (text || '').trim();
  if (!cleanText) return '';

  const cacheKey = `${targetLang}::${cleanText}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    const url =
      `https://translate.googleapis.com/translate_a/single` +
      `?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(cleanText)}`;

    const response = await fetch(url);
    const data = await response.json();

    const translated = Array.isArray(data?.[0])
      ? data[0].map((part) => part?.[0] || '').join('')
      : '';

    if (translated) {
      translationCache.set(cacheKey, translated);
      return translated;
    }
    return cleanText;
  } catch (err) {
    return cleanText;
  
  }
}
