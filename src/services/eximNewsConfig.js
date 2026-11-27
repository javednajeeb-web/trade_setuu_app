// src/services/eximNewsConfig.js

export const NEWSDATA_API_KEY = 'pub_81fb90b86ff841ab923295eb0f5726a3';
export const FINLIGHT_API_KEY = 'sk_1a669d63a58c664a4fc7a6a9d493b8a14c58732a8cba12244a69e6c139b09d8f';
export const EXIMJUNCTION_API_KEY = 'tdk_-vRnRCXCfgzlXyvP-Cc26LONtNVg99bFlPtzDgTk0tc';

export const EXIM_NEWS_ENDPOINT = 'https://newsdata.io/api/1/latest';
export const FINLIGHT_ARTICLES_ENDPOINT = 'https://api.finlight.me/v1/articles';
export const EXIMJUNCTION_BASE_URL = 'https://eximjunction.com';

export const DEFAULT_EXIM_QUERY =
  'export OR import OR "customs duty" OR shipping OR freight';

// 100% Free RSS Feeds (No API key required)
export const FREE_EXIM_RSS_FEEDS = [
  {
    name: 'Google News EXIM',
    url: 'https://news.google.com/rss/search?q=India+export+import+DGFT+customs+duty&hl=en-IN&gl=IN&ceid=IN:en',
    countryTag: 'India',
  },
  {
    name: 'Global Trade Magazine',
    url: 'https://www.globaltrademag.com/feed/',
    countryTag: 'Global',
  },
  {
    name: 'The Loadstar',
    url: 'https://theloadstar.com/feed/',
    countryTag: 'Global',
  },
  {
    name: 'Supply Chain Dive',
    url: 'https://www.supplychaindive.com/feeds/news/',
    countryTag: 'Global',
  },
  {
    name: 'FreightWaves',
    url: 'https://www.freightwaves.com/feed',
    countryTag: 'Global',
  },
];
