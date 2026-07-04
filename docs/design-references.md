# Trading Simulator — Design References (UX Pattern Reference)

> Status: research input for P1/MVP screen design. Companion to `docs/design-decisions.md` (visual SSOT) and `docs/design-tokens.md` (token SSOT). Positioning: **fun-first, 100% fictional-company, fake-money stock GAME**, premium-dark fintech mood, KR up=red/down=blue default. This doc catalogs how real brokerage/trading apps solve the same screens, then synthesizes concrete adopt/avoid guidance for OUR direction.

---

## 0. Legal frame (read first)

- **Referencing UX patterns, conventions, and information architecture is standard practice and not copyrightable.** "Show most-traded and gainers/losers as ranked tabs", "put a persistent Buy/Sell bar at the bottom of the stock detail", "swipe-up to confirm an order", "count-up animated portfolio value" are *ideas/conventions* we may freely adopt.
- **Do NOT copy:** logos, brand names, brand color identities, icon sets, illustrations, copywriting, screenshots, or the exact visual identity / trade dress of any referenced app. Do not pixel-match a competitor's screen.
- **We express every adopted pattern in OUR own identity:** premium-dark-fintech palette, our tokens (`docs/design-tokens.md`), our fictional-company universe, KR-default up/down semantics, and our own layout/typography. Adopt the *skeleton*, not the *skin*.
- All companies/tickers in our app are fictional; nothing here implies affiliation with or endorsement by any referenced brokerage.

---

## 1. Per-app quick notes

### Korea

**토스증권 (Toss Securities)** — the reference for minimal, beginner-first MTS. Highest user-rated UX among KR securities apps (OpenSurvey 2024: 73.2 vs. avg 66.7). Strengths: lowered the barrier to "online-shopping level", plain-language labels, fast launch, low visual density with focus on information delivery. Stock detail shows current price / change % / after-market up top, big bottom Buy button, tabbed info (가치·재무·성장·배당·회사 / 뉴스 / 공시 / 커뮤니티). Signature social layers: **per-stock community/discussion** and **following other investors + seeing their trades**. Screener ("주식 골라보기") and real-time discovery lists. Adopt the calm density + one-clear-primary-action model.

**미래에셋 M-STOCK** — largest KR user base (~3.6M MAU). Rated high on security/trust, middling on usability. Full-featured, denser than Toss. Reference for "serious" data density done for a mass audience; avoid its steeper learning curve for our onboarding.

**키움 영웅문S# (Kiwoom)** — the power-user incumbent (~3.4M MAU). Function-rich but UI is hard for beginners. Reference for what NOT to do in MVP: HTS-derived density, high control count. Keep this as the "expert mode" antipattern for our fun-first game.

**NH나무 (Namu, NH투자증권)** — 2nd-best rated KR UX (68.4). Deliberately de-emphasizes parent "NH" brand to feel modern/differentiated ("나무" = tree/growth). Strong on usability/design, weaker on community/benefits. Reference for a clean modern reskin of a traditional broker.

**삼성증권 mPOP, KB증권 마블(M-able), 한국투자** — mass-market incumbents (~2.6–2.8M MAU each). Feature-complete, more conservative visual language, HTS lineage in denser screens. Useful as convention baselines (order book, 호가창, ranking screens) rather than UX inspiration.

**카카오페이증권 (Kakao Pay Securities)** — the game-y/casual end of KR. Fractional (소수점) investing from ₩1,000, **간편주문** (just enter qty + amount), **주식 모으기** (recurring/accumulate), **잔돈 투자** (round-up spare change into funds), **시세감지주문** (price-triggered). Reference for playful, low-stakes, habit-forming micro-interactions — closest KR cousin to our fun-first framing.

### International

**Robinhood** — the canonical minimal US trader. Two-screen mental model: dashboard + stock detail; everything is purposeful interactive "blocks"/cards. Recently split the single **Trade** button into explicit **Buy / Sell / (Options)** buttons with dynamic bid/ask coloring (Buy = filled, Sell = outlined). Order ticket: enter **dollar OR share amount** (fractional, ≥$1), review screen, **swipe up to submit**. Portfolio: interactive value graph with timeframe toggles (1D/1W/1M/…), odometer/count-up micro-interactions. Critiqued for: no custom chart date range, no asset-allocation/diversification view. Best single reference for our order + portfolio screens.

**Webull** — the "power tool". Dense Markets overview: indices, advance/decline, sentiment, **top gainers & losers**, most-popular lists, heatmaps, calendars, news; deep charting (60+ indicators), paper trading, Replay/backtest. Reference for rich rankings/discovery IA — but its density is a beginner hazard; we borrow the *taxonomy of lists*, not the density.

**Public.com** — social investing done *responsibly*. Feed prioritizes **discussion over performance leaderboards** (intentionally does NOT rank top performers, to avoid glorifying trades / implying advice). Safety Labels at point of decision; culture hashtags **#ShareYourLosses**, **#MyFirstInvestment** to normalize losses and welcome beginners. DAU/MAU hit ~50% at peak. Reference for community that lowers intimidation without becoming a gambling scoreboard.

**Trading 212** — commission-free, fractional, **Pies** (automated basket investing). Fast, friendly base; some users find deeper UX rough. Reference for fractional + basket/auto-invest patterns.

**eToro** — the social/copy-trade reference. **CopyTrader** discovery: profile cards with avatar + headline stat (e.g. "105.02% Return (2Y)"), transparent track record, "Copy Discover" search/filter across millions of investors, predefined ranked lists. Flow: select investor → COPY → allocate amount (min $200, $1/position). Community feed for discussing strategies; Popular Investor Program pays copied traders. Reference for leaderboards + copy/follow mechanics — with heavy caution around real-money/gambling framing we must NOT reproduce.

**Coinbase (stocks)** — "slick and simple" buy flow: ~100-word plain-English company blurb + key stats + links, funneling straight to a single Buy/Sell button. Reference for a friction-light detail→buy funnel.

**Cash App Investing** — "seamless, nothing confusing or stressful for new investors"; curated universe (excludes penny/microcap/leveraged) for a safer beginner surface. Reference for a deliberately narrowed, safe, low-anxiety catalog.

**thinkorswim / Interactive Brokers** — the pro extreme. IBKR exposes 90+ order types/algos; thinkorswim is chart-first with thinkScript. Power features live on desktop; mobile is stripped down. Reference mainly as an **antipattern** for our MVP — the ceiling of complexity we deliberately avoid; keep any "advanced" surface strictly opt-in and out of the first-run path.

**Fidelity / Schwab** — established full-service incumbents; trustworthy, dense, conservative. Convention baselines for orders/positions terminology, not inspiration for a fun game.

---

## 2. Per-screen pattern synthesis (for OUR screens)

Each screen: the common pattern → concrete **Adopt** / **Avoid** for our fun-first + premium-dark direction. All color references use our semantic tokens `colorUp`/`colorDown` (KR default: up=red, down=blue), never hardcoded hex.

### 2.1 Market list (the hero — "living market")

Common pattern: scrollable ticker rows (name/logo · price · signed change % with arrow), often with a top strip of indices/movers, tabs or filters.

**Adopt**
- Row = fictional issuer name + short blurb, current price, **signed % + arrow** (never color-only — A11Y rule), and a compact sparkline.
- Persistent, always-on **state feedback**: tabular-nums count-up to new price, brief up/down color pulse on tick, sparkline tween (per `design-tokens.md` motion.marketPulse / sparklineTween). This is what makes an event-less 5 minutes feel alive.
- A top "breaking/속보" ticker strip + market-pulse entry, matching `design-decisions.md` §3 hero composition.
- Toss-level calm density: one primary read per row, generous spacing, no chart junk.

**Avoid**
- Webull/HTS-style wall of metrics per row. No 호가창-level density on the hero.
- Flashing faster than ~3×/sec or screen shake (reduced-motion must collapse to instant).
- Green/red hardcoding — resolve through `colorUp`/`colorDown` so the KR/western toggle works.

### 2.2 Stock detail + chart

Common pattern (Toss/Robinhood/Coinbase): big price + change up top, interactive chart with timeframe toggles, tabbed info sections, persistent bottom Buy/Sell.

**Adopt**
- Header: large price, signed change (value + %) with arrow, mini after-hours/next-tick state.
- **Skia** chart with timeframe segmented control (1D/1W/1M/1Y/ALL); touch scrub shows crosshair + value; tween between updates. (Ref: living-market + Robinhood interactive graph.)
- Coinbase-style **~100-word plain-language "what is this company"** blurb (our fictional lore) + a few key stats — friction-light funnel toward the order action.
- Tabbed sections (Overview / Chart / Community / About) like Toss, but MVP can ship Overview + Community only.
- **Persistent bottom action bar** with explicit **Buy** (filled `colorUp`) and **Sell** (outlined `colorDown`) — adopt Robinhood's split-button clarity; buttons carry live price.

**Avoid**
- Robinhood's criticized gaps: don't strand users without at least default timeframes; keep the chart legible.
- thinkorswim indicator overload. No 60+ indicators in MVP; advanced tooling is opt-in only.
- Dropdown-hidden Buy/Sell ambiguity — keep actions explicit and always visible.

### 2.3 Order ticket (buy/sell)

Common pattern: choose Buy/Sell → enter qty or amount → review → confirm (Robinhood swipe-up; Kakao 간편주문 qty+amount).

**Adopt**
- Dual input mode: **shares OR cash amount** (Robinhood/Trading 212), supports fractional feel; big numeric keypad, live "≈ N shares / ≈ $X" conversion.
- Kakao **간편주문** simplicity: for MVP market orders, "enter amount → confirm" is the whole flow.
- Explicit **review step** showing est. price, qty, cost, resulting cash — then a deliberate confirm gesture (**swipe-up-to-submit** or a firm CTA) to prevent fat-finger.
- Haptics per token map: order-accepted = light, **fill = success-impact**; use as *state feedback, not P&L celebration* (design-decisions §4 / NOT-R4).
- Buy = filled `colorUp`, Sell = outlined `colorDown`, consistent with detail screen.

**Avoid**
- IBKR/thinkorswim order-type sprawl. MVP = market order first; limit/stop are later and progressively disclosed.
- Real-money urgency/pressure framing. This is a game — keep it playful and pressure-free.
- Celebratory confetti/fanfare on fill or realized P&L — reserve celebration for P&L-independent achievements (badges/levels/streaks) per NOT-R4.

### 2.4 Portfolio / positions & P&L

Common pattern (Robinhood): hero equity value + graph with timeframe toggles; positions list with per-holding P&L.

**Adopt**
- Hero **total equity** in `display` type, **count-up (tabular-nums)** to the new value; portfolio value graph with timeframe toggles.
- Per-position row: qty, avg cost, current value, **unrealized P&L (signed value + %, arrow, colorUp/Down)**.
- Clear split of **realized vs unrealized** and cash — backed by our integer-cents ledger (Phase 0). Show the equity identity plainly.
- Odometer/count-up micro-interaction on value changes = "alive" feedback, not celebration.

**Avoid**
- Robinhood's criticized omission: DO include a simple **allocation/holdings breakdown** (even a basic bar/donut of positions) to avoid the diversification blind spot.
- Turning P&L into a dopamine slot machine — no success-notification haptic or confetti on realized gains (NOT-R4).

### 2.5 Rankings / discovery (market-pulse: 거래대금 / 거래량 / 급등락 / 인기)

Common pattern (Webull movers, KR MTS ranking screens, Toss discovery): tabbed ranked lists — most-traded (거래대금), volume (거래량), top gainers/losers (급등/급락), popular/인기.

**Adopt**
- Segmented tabs over one ranked list surface: **거래대금 · 거래량 · 급등 · 급락 · 인기** (matches living-market MKT-27 market-pulse). Each row = rank #, issuer, price, signed change, and the ranking metric (turnover/volume) as secondary.
- Toss "주식 골라보기"-style light **screener/discovery** entry as a browsable, game-y "explore the market" surface — a natural home-screen hero companion.
- Rank-change indicators (▲2 / ▼1) with count-up for a living leaderboard feel.

**Avoid**
- Webull's everything-at-once density. Progressive: MVP ships the core 3–4 tabs, not heatmaps + calendars + yield curves.
- Framing rankings as "hot tips to chase" — present as discovery/market-color, consistent with a game, not signals/advice.

### 2.6 Watchlist

Common pattern: user-curated list mirroring market-list rows; quick add/remove (star/heart) from detail.

**Adopt**
- One-tap **add-to-watchlist** (star) on market rows and detail header; watchlist reuses the market-list row component + always-on state feedback.
- Optional reorder; empty state that invites adding first tickers (ties into onboarding).

**Avoid**
- Multiple complex watchlist groups/columns (Webull desktop style) in MVP — one simple list is enough.

### 2.7 Onboarding (30s to first buy)

Common pattern: minimal signup friction (Cash App/Coinbase/Toss), guided first trade, curated safe catalog.

**Adopt**
- Our spec: **guest, no-signup, ~30s to a coached first market buy** (p1-scope first-playable). Micro-disclaimer banner + birth-year age gate only; no full-disclaimer wall.
- **Coachmark-guided first buy**: highlight a suggested fictional stock → 간편주문 (amount → confirm) → immediate ledger-consistent feedback → **first badge/XP** (celebration is allowed here — it's a P&L-independent achievement).
- Cash App-style **narrowed, safe starter set** of fictional stocks so first-run isn't overwhelming.
- Coinbase-style plain-language nudge copy that funnels to the buy button.

**Avoid**
- thinkorswim/IBKR-style intimidating first run (account setup, dense config).
- Any signup wall or heavy KYC before the first fun moment — the game must be reachable in seconds.

### 2.8 Social / leaderboard

Common pattern: eToro copy/leaderboard (performance-ranked) vs. Public discussion-first feed (deliberately not performance-ranked).

**Adopt**
- **Public.com's responsible framing** as our north star: community that discusses and welcomes beginners over a raw money scoreboard. Culture hooks like **#MyFirstInvestment** (celebrate newcomers) and **#ShareYourLosses** (normalize losses) fit fun-first without glorifying gambling.
- Toss-style **per-stock community** thread + **follow other players / see their (fictional) trades** as a light social layer.
- For leaderboards, lean on our **game achievements** (levels, badges, streaks, good-judgment, collection/도감 sets, contest/ghost primitives from p1-scope) rather than pure P&L rankings — celebration attaches to skill/achievement, not returns (NOT-R4).
- eToro's transparent **profile cards** (avatar + a headline stat + track record) are a good card template — but our headline stat should favor achievement/consistency over raw return %.

**Avoid**
- eToro-style **real-money copy-trading, prize pools, entry fees, rake** — explicitly P1-deferred / out of scope; do not build copy-*money* mechanics.
- P&L-glorifying "top earner" leaderboards that turn the game into a gambling scoreboard (Public deliberately avoids this; so do we).
- Full public social graph / feed at scale — deferred per p1-scope; MVP keeps social light and local/async.

---

## 3. Keep our own identity

We adopt *patterns*, not *skins*. Every screen above must render in **our** premium-dark-fintech identity: deep-charcoal surfaces (`neutral.950/850`), restrained motion, blue accent, and **KR-default up=red / down=blue** via `colorUp`/`colorDown` tokens — never a competitor's palette, logo, iconography, or copy. Our differentiators are non-negotiable: **100% fictional companies**, a **deterministic simulated market**, **fake money**, and **game feel through micro-interactions + achievement celebration (never P&L celebration)**. When a reference conflicts with fun-first + NOT-R4, our design decisions win. The goal is a market that *feels alive and premium and fun*, expressed entirely in our own tokens.

---

## 4. Sources

Korea
- Toss Invest (official): https://www.tossinvest.com/ · Screener: https://www.tossinvest.com/screener
- 토스증권 — 나무위키: https://namu.wiki/w/%ED%86%A0%EC%8A%A4%EC%A6%9D%EA%B6%8C
- OpenSurvey — KR securities app UX comparison: https://blog.opensurvey.co.kr/article/ux-finance-app-3/
- 토스증권 UX/UI 분석 (Brunch, PlusX): https://brunch.co.kr/@plusx/71
- KR MTS ranking / 거래대금·거래량·급등락 screens (KRX 거래상위): https://data.krx.co.kr/contents/MMC/RANK/rank/MMCRANK006.cmd
- 랭킹연구소 — KR securities app MAU ranking: https://www.newsspace.kr/news/article.html?no=12372
- 카카오페이증권 — 나무위키: https://namu.wiki/w/%EC%B9%B4%EC%B9%B4%EC%98%A4%ED%8E%98%EC%9D%B4%EC%A6%9D%EA%B6%8C
- 카카오페이증권 (official): https://kakaopaysec.com/

International
- Robinhood iOS design critique (Pratt IXD): https://ixd.prattsi.org/2025/02/design-critique-robinhood-ios-app/
- Robinhood — how to buy a stock (order flow / swipe-up / dollar vs share): https://robinhood.com/us/en/support/articles/buying-a-stock/
- Robinhood — fractional shares: https://robinhood.com/us/en/support/articles/fractional-shares/
- Robinhood on Google Design (Material): https://design.google/library/robinhood-investing-material
- Webull vs Robinhood (StockBrokers.com): https://www.stockbrokers.com/compare/robinhood-vs-webull
- Public.com community/content case study (Mint Studios): https://www.mintcopywritingstudios.com/blog/public-community-content-case-study
- eToro CopyTrader (official): https://www.etoro.com/copytrader/
- eToro Discover People: https://www.etoro.com/discover/people
- Coinbase stock trading review (NerdWallet): https://www.nerdwallet.com/investing/news/coinbase-stock-trading
- Cash App Investing review (NerdWallet): https://www.nerdwallet.com/investing/reviews/cash-app-investing
- Trading 212 (Google Play listing): https://play.google.com/store/apps/details?id=com.avuscapital.trading212
- Interactive Brokers vs thinkorswim (order-ticket complexity): https://www.financialtechwiz.com/post/interactive-brokers-vs-thinkorswim/
- Fintech UX trends 2025 (Design Studio): https://www.designstudiouiux.com/blog/fintech-ux-design-trends/

> Note: Sources are cited for UX *patterns and conventions* only. No brand assets, screenshots, or visual identities are reproduced in our app.
