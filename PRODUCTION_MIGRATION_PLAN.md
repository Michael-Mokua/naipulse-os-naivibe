# NAI PULSE OS - Production Migration Checklist

## Current Status
- ✅ GROQ API key configured
- ✅ Open-Meteo weather endpoint live and working
- ✅ Web scraping framework in place (allorigins.win proxy)
- ✅ Production data fetchers module created
- ✅ Caching & rate limiting infrastructure
- ⏳ Sanity CMS setup needed
- ⏳ External APIs integrated
- ⏳ Error monitoring & logging
- ⏳ Database for historical data
- ⏳ Authentication & authorization

---

## PHASE 1: Core Infrastructure (Week 1)

### 1.1 Sanity CMS Setup
**Purpose:** Central hub for headlines, breaking news, verification data, and user-generated content
**Actions:**
- [ ] Create Sanity project at https://www.sanity.io
- [ ] Define schemas:
  - `headline` (title, tag, source, link, publishedAt, body)
  - `breaking` (message, priority, timestamp, verified)
  - `verification` (claim, verdict, confidence, summary, sources, context)
  - `matatu_route` (num, name, status, color, realTimeUpdate)
  - `nse_stock` (symbol, price, change, up, timestamp)
- [ ] Set up roles: editor, fact-checker, system-admin
- [ ] Update `.env.production` with project ID and dataset

**Estimated Cost:** Free tier (50K API calls/month) or $15/mo for higher volume

### 1.2 NSE (Nairobi Securities Exchange) Data
**Status:** NSE doesn't expose free public API; multiple options:
**Option A (Recommended):** Partner with NSE for API access
- Contact: https://www.nse.or.ke/
- Cost: ~$500-1000/month
- Benefit: Real-time, official, no scraping

**Option B (Scraping):**
- Scrape https://www.nse.or.ke/live-trading/ via allorigins.win
- Use GROQ to parse HTML table into structured data
- Cost: Free, but rate-limited and fragile

**Option C (Third-party):**
- Use Finnhub (https://finnhub.io) — covers KCB, SCOM, EQTY
- Cost: $9.99/month for basic
- Benefit: Free tier available; stable API

**Actions:**
- [ ] Choose NSE data source (recommend: NSE API partnership)
- [ ] Integrate chosen API into `productionDataFetchers.js`
- [ ] Add unit tests for stock price parsing
- [ ] Set cache TTL to 5 minutes (market updates frequently)

---

## PHASE 2: Real-Time Data Streams (Week 2)

### 2.1 Matatu & Traffic Status
**Current:** Development placeholder data only

**Real-time Options:**
- **Option A:** Partner with UTAWALA (Matatu tracking network)
  - https://utawala.co.ke
  - Cost: ~$1000-2000/month
  - Benefit: Real matatu GPS tracking, driver feedback

- **Option B:** Use Google Maps API
  - Routes embedded in app
  - Cost: $7-12 per 1000 requests ($500-2000/month at scale)
  - Benefit: Authoritative traffic data

- **Option C:** TomTom Traffic API
  - Cost: Enterprise pricing (~$2000+/month)
  - Benefit: Highest accuracy for Nairobi

- **Option D:** Community-powered (Waze-like)
  - Build crowdsourced traffic layer
  - Cost: Infrastructure + moderation ($500-1000/month)
  - Benefit: Grassroots; Nairobi-native

**Actions:**
- [ ] Evaluate traffic APIs (recommend: Google Maps for MVP)
- [ ] Implement route-to-coords mapping
- [ ] Set cache TTL to 2 minutes (traffic changes fast)
- [ ] Add fallback to TomTom if primary fails

### 2.2 Football Scores (Live)
**Current:** Development placeholder data; can use ESPN/Sleeper

**Real Options:**
- **Option A:** ESPN API (unofficial via web scraping)
  - Cost: Free
  - Benefit: Comprehensive KPL, EPL, UCL data

- **Option B:** Sleeper API
  - Cost: Free
  - Benefit: Live odds, player stats

- **Option C:** API-Football (RapidAPI)
  - Cost: $5-25/month
  - Benefit: Official, full coverage

**Actions:**
- [ ] Add ESPN scraping or Sleeper API integration
- [ ] Parse KPL (Kenya Premier League) scores in real-time
- [ ] Cache for 5-10 minutes
- [ ] Add league filter (KPL priority, then EPL/UCL)

---

## PHASE 3: News & Content (Week 2-3)

### 3.1 Headlines from Real Sources
**Current:** Scrape via allorigins.win; structured via GROQ

**Real Options:**
- **Option A:** NewsAPI.org
  - Cost: Free tier (100 requests/day), $15+/month for higher
  - Benefit: Aggregates Nairobi news (Standard Media, Nation, The Star)
  - Integration: Easy REST API

- **Option B:** Sanity + Manual Editor Input
  - Cost: Included (Sanity CMS)
  - Benefit: Editorial control, quality
  - Process: Editors manually curate

- **Option C:** RSS Feed Aggregation
  - Standard Media: https://www.standardmedia.co.ke/rss
  - Nation: https://nation.africa/rss
  - The Star: https://www.the-star.co.ke/rss
  - Cost: Free
  - Benefit: Low-latency, official
  - Challenge: CORS issues; need backend proxy

**Recommended:** NewsAPI.org + Sanity hybrid
- NewsAPI fetches automatically every 30 min
- Sanity editors can pin/feature important stories
- GROQ filters stories by tag + relevance

**Actions:**
- [ ] Sign up for NewsAPI.org
- [ ] Create `/api/headlines` backend endpoint
- [ ] Integrate GROQ to categorize stories (Transport, Business, Tech, etc.)
- [ ] Add story deduplication (avoid duplicates across sources)
- [ ] Set cache TTL to 30 minutes

### 3.2 Breaking News
**Current:** Development placeholder data only

**Real Options:**
- **Option A:** Twitter/X API + Nairobi local accounts
  - Cost: $100+/month (Enterprise API)
  - Benefit: Real-time, crowdsourced
  - Challenge: Moderation, misinformation

- **Option B:** Sanity + Push Notification System
  - Cost: Included + push service ($50-200/month, e.g., Firebase)
  - Benefit: Verified breaking news only
  - Process: Admins publish breaking alert

- **Option C:** Aggregated news alerts via NewsAPI
  - Cost: Included in NewsAPI plan
  - Benefit: Automated, reliable sources
  - Challenge: Slight delay vs. real-time

**Recommended:** Sanity + Firebase Push Notifications
- Admins publish breaking news in Sanity
- Firebase Cloud Messaging (FCM) sends push to users
- Falls back to web socket or polling for web app

**Actions:**
- [ ] Set up Firebase project
- [ ] Create `/api/breaking-news` endpoint
- [ ] Implement web push subscription
- [ ] Add admin panel for breaking news publishing
- [ ] Set cache TTL to 2 minutes (highest priority)

---

## PHASE 4: Truth Verification & Fact-Checking (Week 3-4)

### 4.1 Fact-Check Database
**Current:** Simulated; needs real backing

**Real Options:**
- **Option A:** Factly.in API
  - Cost: Free tier available; contact for enterprise
  - Benefit: India-based, covers Africa fact-checks
  - Integration: REST API

- **Option B:** PolitiFact/FactCheck.org APIs
  - Cost: Free (public data)
  - Benefit: High credibility
  - Challenge: Mostly US-focused

- **Option C:** Build Sanity-backed fact DB
  - Cost: Included (Sanity)
  - Benefit: Curated, Nairobi-specific
  - Process: Trained fact-checkers verify & publish

- **Option D:** LLM-powered (GROQ) + Web Search
  - Use GROQ to search web, aggregate sources, synthesize verdict
  - Cost: GROQ API usage ($0.10-1 per 1M tokens)
  - Benefit: Scalable, real-time
  - Challenge: May hallucinate; requires monitoring

**Recommended:** Hybrid approach
1. Check Sanity fact DB first (curated, high-confidence)
2. Fall back to GROQ web search synthesis
3. Cache verdicts for 24 hours
4. Require human review for publication

**Actions:**
- [ ] Design Sanity `verification` schema
- [ ] Create fact-checker role in Sanity
- [ ] Implement GROQ fact-search integration
- [ ] Add confidence scoring (0-100)
- [ ] Set cache TTL to 86400 seconds (24 hours)
- [ ] Add manual review workflow

---

## PHASE 5: Infrastructure & DevOps (Week 4-5)

### 5.1 Backend Server
**Current:** Frontend-only; needs API layer for scraping + caching

**Options:**
- **Option A:** Vercel (Recommended for speed)
  - Cost: Free tier or $20+/month
  - Benefit: Serverless, built for Next.js/React
  - Integration: Create `/api/` endpoints

- **Option B:** Node.js + Express on DigitalOcean/Heroku
  - Cost: $5-15/month
  - Benefit: Full control
  - Challenge: Requires DevOps knowledge

- **Option C:** Firebase Cloud Functions
  - Cost: Free tier; $0.40 per 1M invocations
  - Benefit: Serverless, auto-scaling
  - Integration: Easy Firestore integration

**Recommended:** Vercel for MVP
- Deploy backend API alongside frontend
- Environment variables in Vercel dashboard
- Automatic cron jobs for data refresh

**Actions:**
- [ ] Create `/api/weather` endpoint
- [ ] Create `/api/headlines` endpoint
- [ ] Create `/api/breaking-news` endpoint
- [ ] Create `/api/matatu-status` endpoint
- [ ] Create `/api/truth-verify` endpoint
- [ ] Set up Vercel deployment
- [ ] Add API rate limiting (100 requests/min per IP)

### 5.2 Database (Redis for Caching + PostgreSQL for History)
**Current:** In-memory cache only (lost on reload)

**Options:**
- **Option A:** Vercel KV (Redis) + Supabase (PostgreSQL)
  - Cost: Free tier or $20+/month
  - Benefit: Fully managed, simple setup
  - Integration: SDK provided

- **Option B:** Firebase Realtime DB
  - Cost: Free tier; $1 per 1GB stored
  - Benefit: Real-time sync, no SQL needed
  - Challenge: Not ideal for historical analytics

- **Option C:** MongoDB Atlas + Redis Cloud
  - Cost: $5-15/month
  - Benefit: Flexible schema, popular
  - Challenge: More DevOps overhead

**Recommended:** Supabase (PostgreSQL) + Vercel KV
- Store historical data in Supabase (weather, stocks, articles)
- Use Vercel KV for session cache (headlines, breaking news)
- Retention: 90 days in DB, 1 hour in cache

**Actions:**
- [ ] Set up Supabase project
- [ ] Create tables: `weather_history`, `stock_history`, `articles`, `truth_checks`
- [ ] Set up Vercel KV for cache
- [ ] Implement `cacheToDatabase()` job (runs hourly)
- [ ] Add data retention policy

### 5.3 Monitoring & Logging
**Current:** Browser console logs only

**Recommended Stack:**
- **Option A:** Sentry + Datadog
  - Cost: $29+/month
  - Benefit: Error tracking + performance monitoring
  
- **Option B:** LogRocket + Mixpanel
  - Cost: $99+/month
  - Benefit: Session replay + user analytics
  
- **Option C:** Open-source: Grafana + Prometheus
  - Cost: Hosting only (~$10-20/month)
  - Benefit: Full control, no vendor lock-in

**Recommended:** Sentry (for errors) + Simple logging to Supabase
- Log errors to Sentry for alerting
- Log data fetch events to Supabase for analytics
- Set up Slack notifications for critical errors

**Actions:**
- [ ] Create Sentry project
- [ ] Add Sentry SDK to React app
- [ ] Create logging table in Supabase
- [ ] Add error boundary component
- [ ] Set up Slack webhook for alerts

---

## PHASE 6: Testing & QA (Week 5-6)

### 6.1 Unit Tests
- [ ] Test weather fetcher with simulated API response
- [ ] Test stock parser with sample HTML
- [ ] Test headline scraper
- [ ] Test GROQ parsing logic
- [ ] Test cache TTL expiration

### 6.2 Integration Tests
- [ ] Test end-to-end data flow (API → Cache → UI)
- [ ] Test fallback logic (primary API down → secondary)
- [ ] Test rate limiting
- [ ] Test data validation & sanitization

### 6.3 Load Testing
- [ ] Simulate 1000 concurrent users
- [ ] Test cache hit rate
- [ ] Monitor API response times
- [ ] Test database connection pooling

**Tools:**
- Jest (unit tests)
- Cypress/Playwright (e2e tests)
- k6 (load testing)

---

## PHASE 7: Security & Compliance (Week 6-7)

### 7.1 Data Privacy
- [ ] GDPR compliance (user data handling)
- [ ] CCPA compliance (if US users)
- [ ] Data retention policy
- [ ] Encryption for sensitive data

### 7.2 API Security
- [ ] API key rotation policy
- [ ] Rate limiting per IP + per user
- [ ] CORS configuration
- [ ] Input sanitization (prevent XSS/SQL injection)
- [ ] HTTPS only

### 7.3 Third-party Audit
- [ ] Audit NSE API terms
- [ ] Audit NewsAPI terms
- [ ] Audit Sanity terms
- [ ] Ensure credit/attribution

**Actions:**
- [ ] Add security headers (HSTS, CSP)
- [ ] Implement request signing for sensitive endpoints
- [ ] Add API versioning
- [ ] Document API schema (OpenAPI/Swagger)

---

## PHASE 8: Launch & Optimization (Week 7-8)

### 8.1 Performance Optimization
- [ ] Image optimization (Nairobi street photos)
- [ ] Code splitting & lazy loading
- [ ] Service Worker for offline support
- [ ] CDN for static assets (Cloudflare)

### 8.2 Analytics & Monitoring
- [ ] Track user engagement (Plausible/Fathom)
- [ ] Monitor API latency
- [ ] Monitor cache hit rate
- [ ] Monitor error rates by data source

### 8.3 Production Readiness
- [ ] DNS setup (custom domain)
- [ ] SSL certificate (auto via Vercel)
- [ ] Email alerts for failures
- [ ] Runbook for incident response
- [ ] Backup & disaster recovery plan

---

## COST ESTIMATE (Monthly)

| Service | Cost | Purpose |
|---------|------|---------|
| Sanity CMS | $15-99 | Headless CMS for content |
| NSE API | $500-1000 | Stock market data |
| NewsAPI | $15-30 | News aggregation |
| Google Maps API | $500-2000 | Traffic/matatu routes |
| GROQ API | $0-50 | LLM parsing & verification |
| Vercel (hosting) | $20-50 | Backend API |
| Supabase (DB) | $25-100 | PostgreSQL + auth |
| Vercel KV (cache) | $10-50 | Redis caching |
| Firebase (push) | $0-100 | Push notifications |
| Sentry (monitoring) | $29-100 | Error tracking |
| Cloudflare (CDN) | $0-20 | Static asset delivery |
| **TOTAL** | **~$1200-3500/month** | **Full production stack** |

**MVP Option (Lower Cost):**
- Skip NSE API → use scraping ($0)
- Skip Google Maps → use GROQ synthesis ($0)
- Skip Firebase → use web sockets ($0)
- **Total:** ~$100-200/month

---

## IMPLEMENTATION PRIORITY (MVP → Full Production)

### MVP (Weeks 1-2)
1. ✅ Live weather (open-meteo)
2. ✅ Web scraping + GROQ parsing
3. ✅ Sanity CMS for headlines
4. [ ] Basic caching
5. [ ] Simple API (Vercel)

### Phase 2 (Weeks 3-4)
1. [ ] NewsAPI integration
2. [ ] Database (Supabase)
3. [ ] Rate limiting
4. [ ] Error monitoring (Sentry)

### Phase 3 (Weeks 5-6)
1. [ ] NSE stocks API
2. [ ] Google Maps traffic
3. [ ] Fact-check database
4. [ ] Push notifications

### Phase 4 (Week 7+)
1. [ ] Load testing
2. [ ] Security audit
3. [ ] Performance optimization
4. [ ] Public launch

---

## Quick Start: Deploy to Production Today

```bash
# 1. Update .env.production
cp .env.production.example .env.production
# Fill in all API keys and config

# 2. Deploy to Vercel
npm install -g vercel
vercel --prod

# 3. Set environment variables in Vercel dashboard
# (nsure all secrets are marked as "Sensitive")

# 4. Test endpoints
curl https://your-app.vercel.app/api/weather
curl https://your-app.vercel.app/api/headlines

# 5. Set up scheduled jobs (optional, for data refresh)
# Use Vercel Cron with https://vercel.com/docs/cron-jobs
```

---

## Questions for Product Team

1. **Budget:** What's the monthly budget for external APIs & services?
2. **Traffic:** Expected monthly active users?
3. **Data Accuracy:** Can we use web scraping, or must we partner with official APIs?
4. **Coverage:** Focus on Nairobi only, or expand to Kenya-wide?
5. **Fact-Checking:** Manual review by humans, or AI-powered with user voting?
6. **Mobile:** Native app (iOS/Android) needed, or web-only for MVP?

