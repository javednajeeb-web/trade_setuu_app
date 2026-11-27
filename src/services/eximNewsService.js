// src/services/eximNewsService.js

import {
  NEWSDATA_API_KEY,
  FINLIGHT_API_KEY,
  EXIMJUNCTION_API_KEY,
  EXIM_NEWS_ENDPOINT,
  FINLIGHT_ARTICLES_ENDPOINT,
  EXIMJUNCTION_BASE_URL,
  DEFAULT_EXIM_QUERY,
  FREE_EXIM_RSS_FEEDS,
} from './eximNewsConfig';

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
let cachedArticles = null;
let lastFetchedAt = 0;

export const FALLBACK_EXIM_NEWS = [
  {
    id: 'fallback-1',
    title: 'APEDA facilitates first export of frozen vegetables from Farrukhabad to Qatar',
    summary:
      'Agricultural and processed food export corridors continue expanding across Gulf destinations with cold-chain and compliance focus.',
    source: 'Food Processing Bazaar',
    publishedAt: 'Recent',
    categoryTag: 'Export',
    countryTag: 'India',
    url: 'https://www.foodprocessingbazaar.com/news/apeda-facilitates-first-export-of-frozen-vegetables-from-farrukhabad-to-qatar/',
    isFallback: true,
  },
  {
    id: 'fallback-2',
    title: 'Container shipping, customs duty & port turnaround updates for EXIM shippers',
    summary:
      'Exporters and freight forwarders are tracking port turnaround, customs documentation accuracy, and vessel schedules.',
    source: 'Trade SETUU Desk',
    publishedAt: 'Indicative',
    categoryTag: 'Shipping',
    countryTag: 'Global',
    url: '',
    isFallback: true,
  },
];

function isPlaceholderKey(val, prefix) {
  return !val || val.startsWith('PASTE_YOUR_') || val.trim() === '';
}

function classifyArticle(article, defaultCountry = 'Global') {
  const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();

  let categoryTag = 'Trade';
  if (
    text.includes('customs') ||
    text.includes('duty') ||
    text.includes('tariff') ||
    text.includes('regulation') ||
    text.includes('dgft') ||
    text.includes('cbic')
  ) {
    categoryTag = 'Customs';
  } else if (
    text.includes('shipping') ||
    text.includes('freight') ||
    text.includes('port') ||
    text.includes('vessel') ||
    text.includes('cargo')
  ) {
    categoryTag = 'Shipping';
  } else if (text.includes('import')) {
    categoryTag = 'Import';
  } else if (text.includes('export')) {
    categoryTag = 'Export';
  }

  const countryTag =
    text.includes('india') ||
    text.includes('apeda') ||
    text.includes('dgft') ||
    text.includes('cbic') ||
    text.includes('jnpt')
      ? 'India'
      : defaultCountry;

  return { categoryTag, countryTag };
}

function decodeXmlEntities(str = '') {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function parseRssItems(xmlText, feedMeta) {
  const items = [];
  const itemRegex = /<(?:item|entry)\b[^>]*>([\s\S]*?)<\/(?:item|entry)>/gi;
  let match;
  let index = 0;

  while ((match = itemRegex.exec(xmlText)) !== null && index < 8) {
    const block = match[1];

    const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const descMatch =
      block.match(/<description[^>]*>([\s\S]*?)<\/description>/i) ||
      block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i);
    const pubMatch =
      block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) ||
      block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i);
    const linkMatch =
      block.match(/<link[^>]*>([^<]+)<\/link>/i) ||
      block.match(/<link[^>]*href=["']([^"']+)["']/i);

    const title = decodeXmlEntities(titleMatch?.[1] || '');
    const summary = decodeXmlEntities(descMatch?.[1] || '');
    const url = (linkMatch?.[1] || '').trim();
    const publishedAt = decodeXmlEntities(pubMatch?.[1] || 'RSS Feed');

    if (title) {
      const { categoryTag, countryTag } = classifyArticle(
        { title, description: summary },
        feedMeta.countryTag || 'Global'
      );
      items.push({
        id: `rss-${feedMeta.name}-${index}-${title.slice(0, 16)}`,
        title,
        summary: summary || 'Tap Read More to view full trade update.',
        source: feedMeta.name,
        publishedAt,
        categoryTag,
        countryTag,
        url,
        isFallback: false,
      });
      index += 1;
    }
  }

  return items;
}

async function fetchFromNewsData(query) {
  if (isPlaceholderKey(NEWSDATA_API_KEY)) {
    return { articles: [], error: null };
  }

  const params = new URLSearchParams({
    apikey: NEWSDATA_API_KEY,
    q: query || DEFAULT_EXIM_QUERY,
    language: 'en',
    category: 'business',
    removeduplicate: '1',
  });

  const response = await fetch(`${EXIM_NEWS_ENDPOINT}?${params.toString()}`);
  const data = await response.json();

  if (!response.ok || data?.status !== 'success' || !Array.isArray(data?.results)) {
    return {
      articles: [],
      error: data?.results?.message || 'NewsData fetch failed',
    };
  }

  const articles = data.results.map((item, idx) => {
    const { categoryTag, countryTag } = classifyArticle(item, 'Global');
    return {
      id: item.article_id || `nd-${idx}`,
      title: item.title || 'Untitled Trade Update',
      summary: item.description || 'Open article for full details.',
      source: item.source_id || 'NewsData.io',
      publishedAt: item.pubDate || 'Latest',
      categoryTag,
      countryTag,
      url: item.link || '',
      isFallback: false,
    };
  });

  return { articles, error: null };
}

async function fetchFromFinlight(query) {
  if (isPlaceholderKey(FINLIGHT_API_KEY)) {
    return { articles: [], error: null };
  }

  const response = await fetch(FINLIGHT_ARTICLES_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-API-Key': FINLIGHT_API_KEY,
    },
    body: JSON.stringify({
      query: query || DEFAULT_EXIM_QUERY,
      pageSize: 15,
    }),
  });

  const data = await response.json();
  const list = Array.isArray(data?.articles) ? data.articles : [];

  if (!response.ok || list.length === 0) {
    return {
      articles: [],
      error: data?.message || 'Finlight fetch failed',
    };
  }

  const articles = list.map((item, idx) => {
    const { categoryTag, countryTag } = classifyArticle(
      { title: item.title, description: item.summary || item.description },
      'Global'
    );
    return {
      id: item.id || `fl-${idx}-${(item.title || '').slice(0, 12)}`,
      title: item.title || 'Untitled Trade Update',
      summary: item.summary || item.description || 'Open article for full details.',
      source: item.source || 'Finlight',
      publishedAt: item.publishDate || 'Latest',
      categoryTag,
      countryTag,
      url: item.link || item.url || '',
      isFallback: false,
    };
  });

  return { articles, error: null };
}

async function fetchFromRssFeeds() {
  const results = await Promise.allSettled(
    FREE_EXIM_RSS_FEEDS.map(async (feed) => {
      const response = await fetch(feed.url);
      if (!response.ok) return [];
      const xmlText = await response.text();
      return parseRssItems(xmlText, feed);
    })
  );

  const merged = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      merged.push(...r.value);
    }
  }
  return merged;
}

/**
 * Helper ready for EximJunction TradeDataAPI using X-API-Key header.
 * Pass a specific endpoint path (e.g. '/api/v1/...') once chosen from EximJunction docs.
 */
export async function fetchEximJunctionData(path = '', queryParams = {}) {
  if (isPlaceholderKey(EXIMJUNCTION_API_KEY) || !path) {
    return { data: null, error: 'EximJunction API key or endpoint path not set.' };
  }

  const qs = new URLSearchParams(queryParams).toString();
  const fullUrl = `${EXIMJUNCTION_BASE_URL}${path.startsWith('/') ? path : `/${path}`}${
    qs ? `?${qs}` : ''
  }`;

  const response = await fetch(fullUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'X-API-Key': EXIMJUNCTION_API_KEY,
    },
  });

  const data = await response.json();
  return { data, error: response.ok ? null : data?.message || 'EximJunction request failed' };
}

function dedupeArticles(list = []) {
  const seen = new Set();
  return list.filter((item) => {
    const key = (item.title || '').trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchEximNews({ forceRefresh = false, query = DEFAULT_EXIM_QUERY } = {}) {
  const now = Date.now();
  if (!forceRefresh && cachedArticles && now - lastFetchedAt < CACHE_TTL_MS) {
    return {
      articles: cachedArticles,
      fromCache: true,
      liveError: null,
    };
  }

  let combined = [];
  const errors = [];

  // 1. Primary: NewsData.io
  try {
    const ndRes = await fetchFromNewsData(query);
    if (ndRes.articles.length > 0) {
      combined.push(...ndRes.articles);
    } else if (ndRes.error) {
      errors.push(ndRes.error);
    }
  } catch (e) {
    errors.push('NewsData network error');
  }

  // 2. Secondary: Finlight
  try {
    const flRes = await fetchFromFinlight(query);
    if (flRes.articles.length > 0) {
      combined.push(...flRes.articles);
    } else if (flRes.error) {
      errors.push(flRes.error);
    }
  } catch (e) {
    errors.push('Finlight network error');
  }

  // 3. Free RSS Feeds (unlimited, no key needed)
  try {
    const rssArticles = await fetchFromRssFeeds();
    if (rssArticles.length > 0) {
      combined.push(...rssArticles);
    }
  } catch (e) {
    // RSS optional fallback
  }

  combined = dedupeArticles(combined);

  if (combined.length > 0) {
    cachedArticles = combined;
    lastFetchedAt = now;
    return {
      articles: combined,
      fromCache: false,
      liveError: null,
    };
  }

  return {
    articles: cachedArticles || FALLBACK_EXIM_NEWS,
    fromCache: Boolean(cachedArticles),
    liveError:
      errors.length > 0
        ? `${errors[0]} — showing available EXIM items.`
        : 'Add API keys in eximNewsConfig.js or connect internet for live EXIM news.',
  };
}
