/**
 * Production API Endpoints for NAI PULSE OS
 * Deploy to Vercel's /api directory
 * 
 * Usage:
 *   - /api/weather
 *   - /api/headlines
 *   - /api/breaking
 *   - /api/matatu
 *   - /api/stocks
 *   - /api/football
 *   - /api/verify-claim
 */

import {
  fetchWeatherProduction,
  fetchHeadlinesProduction,
  fetchBreakingNewsProduction,
  fetchMatutuStatusProduction,
  fetchNSEStocksProduction,
  fetchFootballScoresProduction,
  verifyClaimProduction,
  detectMoodWithAI,
  getCacheStats,
  clearCache,
} from '../src/productionDataFetchers.js';

// ============ MIDDLEWARE ============

function withCORS(handler) {
  return async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    try {
      return await handler(req, res);
    } catch (error) {
      console.error(`[${req.url}] Error:`, error);
      res.status(500).json({
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  };
}

function withRateLimit(handler, maxRequests = 100, windowMs = 3600000) {
  const clients = {};

  return async (req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();

    if (!clients[clientIp]) {
      clients[clientIp] = { count: 0, resetTime: now + windowMs };
    }

    const client = clients[clientIp];
    if (now > client.resetTime) {
      client.count = 0;
      client.resetTime = now + windowMs;
    }

    if (client.count >= maxRequests) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((client.resetTime - now) / 1000),
      });
      return;
    }

    client.count++;
    return await handler(req, res);
  };
}

// ============ WEATHER ============

export const weather = withRateLimit(
  withCORS(async (req, res) => {
    const data = await fetchWeatherProduction();

    if (!data) {
      return res.status(503).json({
        error: 'Weather service unavailable',
        fallback: {
          temp: 22,
          condition: 'Partly cloudy',
          humidity: 68,
          wind: 14,
          aqi: 'Good',
        },
      });
    }

    res.setHeader('Cache-Control', 'public, max-age=600');
    res.status(200).json(data);
  })
);

// ============ HEADLINES ============

export const headlines = withRateLimit(
  withCORS(async (req, res) => {
    const data = await fetchHeadlinesProduction();

    res.setHeader('Cache-Control', 'public, max-age=1800');
    res.status(200).json({
      headlines: data || [],
      timestamp: new Date().toISOString(),
      source: 'production',
    });
  })
);

// ============ BREAKING NEWS ============

export const breaking = withRateLimit(
  withCORS(async (req, res) => {
    const data = await fetchBreakingNewsProduction();

    res.setHeader('Cache-Control', 'public, max-age=120');
    res.status(200).json({
      breaking: data || [],
      timestamp: new Date().toISOString(),
      source: 'production',
    });
  })
);

// ============ MATATU STATUS ============

export const matatu = withRateLimit(
  withCORS(async (req, res) => {
    const data = await fetchMatutuStatusProduction();

    res.setHeader('Cache-Control', 'public, max-age=120');
    res.status(200).json({
      routes: data || [],
      timestamp: new Date().toISOString(),
      source: 'production',
    });
  })
);

// ============ NSE STOCKS ============

export const stocks = withRateLimit(
  withCORS(async (req, res) => {
    const data = await fetchNSEStocksProduction();

    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(200).json({
      stocks: data || [],
      timestamp: new Date().toISOString(),
      source: 'production',
    });
  })
);

// ============ FOOTBALL SCORES ============

export const football = withRateLimit(
  withCORS(async (req, res) => {
    const data = await fetchFootballScoresProduction();

    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(200).json({
      matches: data || [],
      timestamp: new Date().toISOString(),
      source: 'production',
    });
  })
);

// ============ TRUTH VERIFICATION ============

export const verify = withRateLimit(
  withCORS(async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { claim } = req.body;

    if (!claim || typeof claim !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid claim' });
    }

    if (claim.length > 1000) {
      return res.status(400).json({ error: 'Claim too long (max 1000 chars)' });
    }

    const result = await verifyClaimProduction(claim);

    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).json({
      claim,
      result: result || {
        verdict: 'UNVERIFIED',
        confidence: 0,
        summary: 'Unable to verify claim at this time',
      },
      timestamp: new Date().toISOString(),
      source: 'production',
    });
  }),
  50 // Stricter rate limit for POST
);

// ============ MOOD DETECTION (AI) ============

export const mood = withRateLimit(
  withCORS(async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid text' });
    }

    const result = await detectMoodWithAI(text);

    res.status(200).json({
      text,
      result: result || { mood: 'neutral', energy: 50 },
      timestamp: new Date().toISOString(),
      source: 'production',
    });
  }),
  50
);

// ============ HEALTH CHECK ============

export const health = withCORS(async (req, res) => {
  const stats = getCacheStats();

  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    cache: stats,
    timestamp: new Date().toISOString(),
  });
});

// ============ CACHE MANAGEMENT (Admin only) ============

export const cacheControl = withCORS(async (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');

  if (token !== process.env.VITE_ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { action, type } = req.query;

  if (action === 'clear') {
    clearCache(type || null);
    res.status(200).json({
      message: `Cache cleared (type: ${type || 'all'})`,
      timestamp: new Date().toISOString(),
    });
  } else if (action === 'stats') {
    res.status(200).json(getCacheStats());
  } else {
    res.status(400).json({ error: 'Unknown action' });
  }
});

// ============ BATCH ENDPOINT (Fetch multiple data types) ============

export const batch = withRateLimit(
  withCORS(async (req, res) => {
    const { types } = req.query;

    if (!types) {
      return res.status(400).json({
        error: 'Missing types parameter',
        example: '?types=weather,headlines,stocks',
      });
    }

    const requestedTypes = types.split(',').filter(Boolean);
    const results = {};

    // Parallel fetch
    const promises = requestedTypes.map(async (type) => {
      try {
        let data;
        switch (type) {
          case 'weather':
            data = await fetchWeatherProduction();
            break;
          case 'headlines':
            data = await fetchHeadlinesProduction();
            break;
          case 'breaking':
            data = await fetchBreakingNewsProduction();
            break;
          case 'matatu':
            data = await fetchMatutuStatusProduction();
            break;
          case 'stocks':
            data = await fetchNSEStocksProduction();
            break;
          case 'football':
            data = await fetchFootballScoresProduction();
            break;
          default:
            data = null;
        }
        results[type] = { data, success: !!data };
      } catch (error) {
        results[type] = { error: error.message, success: false };
      }
    });

    await Promise.all(promises);

    res.setHeader('Cache-Control', 'public, max-age=600');
    res.status(200).json({
      results,
      timestamp: new Date().toISOString(),
    });
  }),
  200 // Batch requests are more resource-intensive
);
