## Code Quality & Maintainability

**Overview:** The code is generally clean and readable, following modern JavaScript/TypeScript standards. There are some areas to refactor for maintainability, but nothing blockers. Key observations:

- **Styling and Linting:** A proper ESLint config is present (`.eslintrc.json`). The code mostly adheres to it (consistent semi-colons, quotes, etc.). TypeScript is used, which catches many issues at compile time. Ensure the project’s `tsconfig.json` is strict enough (no unchecked any’s) for robust code. This foundation is good for long-term maintainability.
- **Naming and Clarity:** Variables and functions have clear names (e.g. `handleCreateListing`, `formatPhoneNumber`). This makes the code self-documenting. Some improvements:
  - Use consistent naming conventions for similar things. For instance, the API route for suggestions is `/api/listings/suggestions` but the query param used is `q`. Minor, but naming it consistently with “query” might be clearer.
  - Some functions are quite long (as discussed earlier). Splitting them into smaller ones with clear names can improve readability.
- **DRY (Don’t Repeat Yourself):** There is some duplicated logic that could be refactored:
  - Filter-building logic appears in multiple places (search page, category page, API route). If requirements change (say, adding a new filter), you’d have to update it in 3 places. Consider centralizing common query building in a helper function that all can use, or at least ensure any change is replicated.
  - Image upload is handled in at least two places (listing images and user photo). They perform similar checks and save operations. A shared utility (even just a small function to save a file to disk and return path) would reduce redundancy and bugs. Currently, the two implementations have slight differences (the user photo upload checks file type and names the file with timestamp, while the listing upload uses UUID and doesn’t verify file type). Aligning these would be wise (e.g., always check file type, perhaps reuse the UUID approach for all).
- **SOLID Principles:**
  - *Single Responsibility:* Most files do stick to one purpose (e.g., each API route module handles one endpoint). The heavy listing handlers violate SRP somewhat by doing many things (generate code, save images, create multiple records). Refactoring as mentioned will help.
  - *Open/Closed:* The design is flexible to extension (new routes, new models) without modifying existing code much. For example, adding a new property field is mainly a schema change and minor form changes – the code is not overly rigid.
  - *Liskov, Interface Segregation:* Not too applicable here (more relevant in large OOP codebases).
  - *Dependency Inversion:* The code directly depends on Prisma and Next.js. That’s fine; abstraction could be overkill here. If one ever wanted to swap out Prisma for another ORM, it’d be a significant rewrite (not likely necessary).
- **Comments and Documentation:** Inline comments are sparse, but the code is understandable. The `notes/implementation-guide.md` provides high-level documentation of the project structure and could be kept updated for onboarding new devs. Consider adding function comments for complex logic (e.g., explain what `shouldShowBackLink` does in category page) to ease future maintenance.
- **Testing:** There is no evidence of automated tests. This is a risk for maintainability – changes could introduce bugs that aren’t caught. **Recommendation:** Add at least a few unit tests for critical utilities (like `formatPhoneNumber` in `utils.ts`) and possibly integration tests for API endpoints (using a tool like Jest or Mocha with supertest, and maybe an in-memory SQLite for Prisma or a test Postgres). Start with simple paths like “login with wrong password should return 401” etc. Even a small test suite is better than none, especially as the app grows.
- **Dead Code:** Remove any dead or deprecated code to avoid confusion:
  - The `AuthContext.tsx.tmp` suggests an attempt at a React Context for auth that was not completed. If not used, remove it.
  - Unused imports or variables (if any) – the linter likely catches these.
  - The `.cursor` folder and prompt/workbench notes are not needed in production code.

By cleaning up and refactoring now, you reduce technical debt and make the codebase easier to work with for future developers (or for yourselves after months of not looking at it).

**Severity:** Low to Medium. These issues won’t break the app, but addressing them will save time and bugs later. Improving test coverage, in particular, is a **High** value improvement for long-term quality, though initial complexity is Moderate.

## Deployment & DevOps Readiness

**Overview:** Preparing the app for production involves configuration management, building the app, and deploying it in a stable environment with CI/CD, containerization, and monitoring.

- **Build Process:** The project uses Next.js – production build can be done via `npm run build` which outputs a `.next` directory ready for `next start`. Ensure environment variables (`DATABASE_URL`, `JWT_SECRET`, etc.) are set in the production environment. The `setup.sh` script provided is mainly for development (it installs packages, runs migrations and seeds). For production, you might not run seeds, and you would want migrations to run in a controlled manner. **Recommendation:** Use Prisma Migrate in production carefully – ideally generate SQL scripts and apply, or use `prisma migrate deploy` as in the script (that applies any pending migrations).

- **Configuration Management:** All secrets (DB URL, JWT secret) should be in environment variables or a secrets manager, not in the code repo. This seems accounted for. If deploying via Docker, use docker secrets or env files (not baked into the image). The Next.js `env` field in config is currently empty – if you need to expose certain env vars to client-side (none needed now except maybe a map API key in future), you can add them with `NEXT_PUBLIC_` prefix.

- **Containerization:** There is no Dockerfile, but creating one is straightforward. For example:

  ```dockerfile
  FROM node:18-alpine
  WORKDIR /app
  COPY . .
  RUN npm ci && npm run build
  ENV NODE_ENV=production
  EXPOSE 3000
  CMD ["npm", "run", "start"]
  ```

  This container would need the appropriate env vars at runtime and a connection to a Postgres instance. If you plan to use Docker in production, test the image locally and ensure static files (public/) are served correctly. Also, include steps to run migrations (either baked in or a separate job).

- **CI/CD Pipeline:** Setting up a pipeline will improve reliability of deployments. For example, using GitHub Actions or GitLab CI to: run lint/tests on push, then build and deploy (to a server or PaaS). There is no pipeline config present, so this will need to be created. For a Node/Next app, a simple pipeline might:

  1. Install deps and run `npm run build`.
  2. (Optional) Run tests.
  3. If on main branch, deploy: e.g., push Docker image to registry or use a tool (Vercel, etc.). **Recommendation:** Implement CI early, even if just for running tests and lint – it helps catch mistakes.

- **Monitoring & Observability:** After deployment, you’ll want to monitor:

  - **Logs:** Aggregate application logs. If on a VM, set up something like PM2 (which can manage logs), or send logs to a service (Datadog, etc.). At minimum, ensure you can SSH in or access the container logs to debug issues.
  - **Uptime Monitoring:** Use an external service or simple cron to hit the site’s health endpoint periodically. This will alert you if the site goes down.
  - **Performance Monitoring:** Tools like New Relic or even Vercel’s analytics (if used) can help. At least track response times and load. Given a small userbase, this might be overkill initially.
  - **Alerts:** Configure alerts for high error rates (if many 500s start occurring, you want to know).

- **Scaling & Redundancy:** Decide if you need more than one instance of the app. If uptime is critical, you might want at least two app instances behind a load balancer, and a managed Postgres with automated backups. Docker/Kubernetes or a PaaS can handle this. The code will need the improvements noted (shared image storage or external storage) for multi-instance. If starting with one server, ensure automated backups of the database are in place (e.g., if using AWS RDS or Yandex Managed DB, configure backups).

- **SEO Considerations in Deployment:** Make sure the production deployment serves a sitemap.xml and robots.txt. Currently none is implemented. You can generate a sitemap easily (List all active listings and categories). This helps search engines find all pages. A `robots.txt` should at least allow all public pages and disallow `/admin` and `/api`. These can be served from `public/` folder by adding those files there.

- **Security in Deployment:** Use HTTPS. Obtain an SSL certificate (Let’s Encrypt or through the hosting provider). If deploying on a platform like Vercel, this is built-in. If on your own VM, use a proxy like Nginx or Caddy to terminate SSL. Also, consider setting HTTP security headers (Content Security Policy, etc.). Next.js can configure some headers in `next.config.js` or via middleware.

**Priority:** Start by containerizing or otherwise scripting the deployment to avoid manual error-prone deploys. Set up the database in production and run migrations. Prepare environment config for production (in .env files or secrets). Plan for backups and monitoring as part of your go-live checklist. These are mostly operational concerns – severity is High (for business), but they are not code “bugs”; they just need implementation.

## Scalability & Future-Proofing

**Overview:** This section looks at how the system will handle growth in data volume, traffic, and new features.

- **Horizontal Scalability:** With stateless JWT auth and a shared database, the application can scale by adding more server instances behind a load balancer. The **major blocker** to horizontal scaling is the local file storage for images (as discussed). Solve that with external storage, and the app tier can scale out easily. Also, use a sticky session or distributed session store if you move away from JWT to server-managed sessions (not needed currently).
- **Vertical Scalability:** If running on one server, ensure the server has enough RAM/CPU for Node.js. Next.js can be memory-intensive under load (because server rendering and Prisma will use memory). For a modest number of concurrent users, a few GB of RAM should suffice. Monitor the process – Node can handle thousands of requests per second if database and I/O are optimized.
- **Database Scaling:** Postgres can handle a reasonable load on a single instance. As traffic grows, you might need to:
  - Use connection pooling (Prisma by default opens few connections; consider PgBouncer if needed).
  - Scale up the DB instance specs (CPU, RAM, IOPS).
  - For read-heavy workloads (e.g., lots of listing views), consider read replicas. Prisma can be configured to use a replica for read queries if necessary.
  - Partitioning is not needed unless millions of rows; not likely in this scenario.
- **Caching Layer:** For increased performance under heavy load, introduce caching:
  - A CDN for images and static content (even dynamic pages can be cached short-term if not updated frequently).
  - Server-side cache: e.g., Redis to cache results of common queries (like the homepage listing summary or category counts). Cache invalidation would be needed when data changes (perhaps purge on listing create/update).
  - Next.js incremental static regeneration (as noted) can serve many users from static pages while updating in background.
- **Feature Extensibility:** The current design can accommodate new features:
  - **Additional Listing Fields:** Easy to add in Prisma schema and forms.
  - **User Roles or Permissions:** As mentioned, add a role and expand auth checks.
  - **Public User Accounts:** If in the future clients register to save favorites or post inquiries, you’d create a separate `User` role and extend the auth system. The groundwork (JWT auth) can be extended to that, but you’d need to harden security (password reset flows, email verification, etc.).
  - **Internationalization:** If needed, Next.js has i18n support. Right now content is mostly Russian – adding English would mean duplicating pages or using frameworks for translation. It’s possible, but plan accordingly (Yandex SEO would then need hreflang tags, etc.).
  - **Mobile optimization:** The frontend uses responsive Tailwind classes, which is good. Always test on mobile devices as traffic grows. Also consider a PWA or mobile app if that’s in scope later.
  - **Third-Party Integrations:** If needing to integrate with CRM or analytics, the current code can accommodate – e.g., adding an API call in the listing create handler to notify a CRM, etc. Just be mindful of keeping such calls asynchronous or resilient (so a slow API doesn’t block your main flow).
- **Scheduled Tasks / Background Jobs:** Currently, everything happens in request-response cycles. If future features require heavy processing (e.g., generating reports, sending bulk emails, or image processing), a background job system (like BullMQ with Redis, or a serverless cron job) might be introduced. The code is not structured for that yet, but it’s something to consider if needed (e.g., offload sending an email to a queue when a comment is added, so the HTTP response isn’t delayed).
- **Upgrading Dependencies:** Next.js (v15 canary) will eventually stabilize; plan to keep the framework updated for security and performance improvements. The code already notes a Next 15 change (promise-based params) and adapts to it. This proactive approach is good – continue to monitor release notes. Likewise, Prisma updates frequently; test and upgrade it periodically to get fixes (e.g., performance improvements, security patches).

In summary, with a few adjustments (especially to file storage), the architecture is quite scalable. Use cloud services (CDN, managed DB) to reduce the ops burden of scaling.

## Hosting & Deployment Recommendations (Russia-Friendly)

Given the target audience and location (Russia), we need hosting that provides low latency to Russian users and complies with any regional requirements. We also want affordability and reliability, plus support for SEO needs (fast loading, ability to configure domain, etc.).

**Potential Hosting Options:**

- **Yandex Cloud:** Yandex offers cloud VMs and managed databases in data centers located in Russia. You could host the Node.js app on a Yandex Compute Cloud VM or use Yandex Cloud Functions (though Functions might not handle a Next.js SSR app easily without modifications). Yandex Cloud also has an Object Storage service (good for hosting images) and a CDN. This is a strong option for local compliance and performance. Pricing for a small VM is reasonable, and you pay in rubles which might be convenient. SEO-wise, Yandex Cloud hosting itself doesn’t directly boost SEO, but the fast response times in Russia can help user experience metrics.
- **Selectel / Reg.ru / Timeweb:** These are Russian hosting providers offering VPS and dedicated servers. A simple VPS from one of these could be cost-effective (~$5-10/month for a basic plan). You’ll need to manage the stack (install Node, Postgres, etc.). They typically offer control panels and one-click installs. Ensure the VPS includes or allows adding an SSL certificate (most do). These providers have Moscow/Peterburg region servers, giving good local latency.
- **DigitalOcean / AWS (EU region):** If Russian hosting is not mandatory, you could use an international provider with a region close to Russia (like Frankfurt). DigitalOcean, for instance, is known for simplicity and has data centers in Frankfurt and Amsterdam which have decent connectivity to Russia. However, due to regulatory or political considerations, a domestic provider might be safer to avoid any potential service restrictions.
- **Vercel or Netlify:** Vercel (the company behind Next.js) provides an excellent deployment platform where you just push your code and it handles build and global deployment. They don’t have Russian data centers, but their Edge Network will still deliver content quickly globally. The downside is you’d still need a database (likely hosted elsewhere) and Vercel’s pricing can grow if you have a lot of serverless function invocations (each Next.js SSR request is a lambda). Also, there may be account/payment issues depending on region. If accessible, Vercel is great for developer experience and includes analytics, but a self-hosted approach might be more predictable for this use case.

**SEO Support Considerations:** Any hosting that allows you to set up proper SSL, custom domain, and fast response times is good for SEO. Yandex does not give preferential treatment for using any specific host, but it does care about site speed and uptime. A CDN that has presence in Russia (Cloudflare has some presence, though had issues; Yandex’s own CDN via Yandex Cloud might integrate well) could improve load times for static assets.

**Deployment Solutions (Tech Stack Fit):**

The tech stack (Node.js + Next.js + Postgres + Prisma) can be deployed in several ways:

- **Docker Compose on a VPS:** You can containerize the app and a Postgres database, and run them via Docker Compose on a Russian VPS. This encapsulates the environment (no need to manually install Node/PG on the host). Ensure you mount a volume for the Postgres data for persistence. This approach gives you full control and is relatively inexpensive. Just budget time for setting up Docker, security (firewall, etc.), and monitoring.
- **Managed Platforms:**
  - *Heroku Alternative:* Since Heroku free tier is gone, look at alternatives like **Railway.app** or **Render.com** – but I’m not sure about their availability in Russia. They deploy Node apps easily and can provide a managed Postgres. If they operate (and can be paid for) in your context, they simplify a lot (git push to deploy, etc.).
  - *Yandex Cloud App Engine:* Yandex has a PaaS called Cloud Functions or you could use their Kubernetes service. These might be more complex than needed. A simple VM (or container instance) might suffice.
- **Ensure SEO Features:** Whichever deployment, set up:
  - **Custom Domain:** Use a `.ru` domain if targeting Russia (e.g., `mysite.ru`). This can slightly improve Yandex ranking for Russian searches. Make sure the host supports adding that domain with SSL.
  - **WWW vs non-WWW:** Decide and redirect one to the other to avoid duplicate content.
  - **Robots.txt & Sitemap:** As mentioned, include these files. Hosting doesn’t directly affect this, but some platforms (like Vercel) might allow dynamic generation if needed. On a VPS, you’ll manage it yourself.

**Cost and Reliability:** A small VPS (1 CPU, 2GB RAM) with a managed Postgres could be ~$20-30/month total in many providers. Yandex Cloud’s pricing might be similar or slightly higher for managed DB. That should handle a decent load (thousands of visits per day easily). If the budget is a big concern, start small and scale up as needed.

**Recommendation:** If you want full control and are comfortable managing servers, go with a Russian VPS provider for the Node app and use a managed Postgres (either the same provider or a cloud DB). If you prefer less ops work, try Yandex Cloud’s offerings or an all-in-one PaaS. Given the audience, leaning on Yandex’s ecosystem could also indirectly benefit (for instance, easier integration with Yandex Metrica, etc.).

## SEO Strategy for Yandex (Organic & Paid)

To attract users via Yandex, we need to optimize the site for Yandex’s search algorithm and possibly use Yandex.Direct for paid advertising. Below are strategies for both organic SEO and paid search:

### Organic SEO (Yandex)

1. **Ensure Indexability:** Yandex’s crawler must be able to crawl and index your pages. With Next.js SSR pages and proper links, you are on the right track. Specifically:

   - Implement a **XML Sitemap** listing all important URLs (home, category pages, all listing detail pages). Yandex.Webmaster allows you to submit a sitemap to expedite indexing ([The Ultimate Guide to Yandex SEO](https://www.searchenginejournal.com/yandex-seo-guide/252885/#:~:text=sitemaps via Yandex)).

   - Use **Yandex.Webmaster tools**: Register your site (once live) at Yandex.Webmaster. This will give you insights into crawling, index coverage, and any issues Yandex finds. You can also set your site’s **geographic region** in Webmaster (if your site is specific to, say, Krasnodar Krai, set that) ([The Ultimate Guide to Yandex SEO](https://www.searchenginejournal.com/yandex-seo-guide/252885/#:~:text=match at L515 Within Yandex,getting useful and relevant results)). This helps Yandex serve your site to the right regional audience.

   - **Robots.txt:** Include a robots.txt that allows all the main site, disallowing only admin and unnecessary paths. Also point to the sitemap:

     ```
     User-agent: *
     Disallow: /admin/
     Disallow: /api/
     Sitemap: https://yourdomain.com/sitemap.xml
     ```

2. **On-Page Optimization:** Optimize titles, meta descriptions, and content for Yandex:

   - **Title Tags:** Yandex considers title tags crucial. Each page should have a unique, descriptive title (in Russian, as your audience is Russian). For example, a listing page title could be `"2-комнатная квартира, 60м² – Краснодар, ул. Ленина – Цена 3 млн ₽"`. Include important keywords like property type, location, and maybe price. Keep it under ~60-70 characters (Yandex may display up to 70).
   - **Meta Descriptions:** Provide a meta description for each page type. Yandex might use it as snippet. For listings, summarize the property (e.g., “Продается 2-к квартира, 60 кв.м, в центре Краснодара, с ремонтом...”). For category pages, describe the category (e.g., “Объявления о продаже домов – подборка частных домов в Краснодарском крае.”).
   - **Headings and Content:** Ensure the pages have relevant headings (H1 for the listing title or category name). Use Russian language content naturally – Yandex’s algorithm (especially after the leaked signals) places weight on content relevance and user behavior. Provide enough detail on listing pages (which you do: descriptions, features). On category pages, consider adding a short intro text with some keywords about that property type and region.
   - **Static Content for Crawling:** As noted, avoid content that only loads via JS. We already plan to SSR listing details, which is crucial. Yandex’s own guidance: *“there must be static content for the robot”* when dealing with SPAs ([The Ultimate Guide to Yandex SEO](https://www.searchenginejournal.com/yandex-seo-guide/252885/#:~:text=,Irstlena Pershina)). After changes, double-check that the page source (Ctrl+U in browser) contains the relevant info (Yandex may not execute complex JS, though it has improved).
   - **Schema Markup:** Yandex supports structured data (schema.org). For real estate listings, you can use schema.org/Offer or schema.org/RealEstateListing. At minimum, mark up the address, price, and property type. This can enhance how your listing appears in Yandex search (maybe showing price or other details). Yandex also supports Open Graph tags if you want nice previews when sharing links (not directly SEO, but improves click-throughs).

3. **Site Speed:** Yandex takes page speed into account (especially via the Vladivostok update for mobile). Make sure your site loads quickly:

   - Use caching and CDN as discussed.
   - Optimize images (which we plan to do with sharp/CDN).
   - Minify and compress assets (Next.js by default does this for JS/CSS; ensure gzip or Brotli is enabled on your server).
   - Consider using Yandex’s CDN or services if available, but not necessary if others are in place.

4. **Mobile Friendliness:** Yandex’s algorithm penalizes sites not mobile-friendly. The responsive design covers this. Test the site on Yandex’s mobile-friendly test (available in Yandex.Webmaster). If any layout issues on small screens, fix those (Tailwind usually makes it easy to adjust).

5. **Behavioral Factors:** Yandex places more emphasis on user behavior (click-through rate, bounce rate, time on site) than Google. To improve these:

   - Make sure search snippets (title/meta) are enticing and relevant, to get users to click.
   - Provide a good user experience so they don’t immediately bounce. This means clear information, no intrusive pop-ups, and quick load as mentioned.
   - Yandex Metrica (analytics) provides “Session replay” and behavioral analysis; some speculate Yandex might use Metrica data as a ranking factor (not confirmed, but Metrica is a useful analytics tool anyway). You might integrate Yandex Metrica for your own insights – it won’t directly boost SEO, but it can help identify where users struggle.

6. **Content Strategy:** Apart from listings, consider adding supporting content that can attract searchers. For instance, articles or guides (“How to buy an apartment in Krasnodar”, “Real estate market trends 2025”) can draw organic traffic and boost your site’s authority. Yandex, like Google, rewards sites that are regularly updated with quality content. A blog or news section could be beneficial if you have the capacity to maintain it. This is optional, but could set you apart from bare-bones listing sites.

7. **Backlinks (Off-page SEO):** Yandex used to downplay backlinks due to rampant link-spam, but they still matter, especially quality local backlinks. Strategies:

   - List the site in local real estate directories or forums.
   - If the business has partners (e.g., a local realtor association), get a link from their sites.
   - Ensure you are on **Yandex Business Directory** (Yandex Spravочник) if it’s applicable (that’s more for physical businesses, but if you have an office).
   - Don’t engage in spammy link buying – Yandex’s “Minusinsk” algorithm targets link spam and can penalize sites for unnatural links ([The Ultimate Guide to Yandex SEO](https://www.searchenginejournal.com/yandex-seo-guide/252885/#:~:text=match at L572 After the,saw three key impact dates)). Focus on a few high-quality, relevant backlinks rather than quantity.
   - Social signals: Having a VKontakte page or other social media and linking to your site might marginally help (indirectly, through traffic).

8. **Monitoring SEO:** Use Yandex.Webmaster to monitor indexation and any issues (it will tell if there are crawl errors, duplicate content, etc.). Also track your rankings for key queries (like “купить квартиру Краснодар”) to see if you need to optimize content.

### Paid SEO (Yandex.Direct Advertising)

Yandex.Direct is the advertising platform to display sponsored search results on Yandex (akin to Google Ads). An effective Yandex.Direct strategy:

- **Campaign Structure:** Organize campaigns by category of real estate. For example, one campaign for “Apartments for sale in [Your City]”, another for “Houses for sale”, etc. This allows tailoring ad text to each category and using specific keywords.
- **Keyword Selection:** Use Yandex Wordstat (Yandex’s keyword tool) to find popular search terms in your region. Target both general terms (“купить квартиру +YourCity”) and long-tail terms (“купить 2-к квартиру центр Краснодар”). Include Russian synonyms or variations (e.g., “квартира” vs “жилье” if applicable).
  - **Negative Keywords:** Add negatives to avoid irrelevant clicks (e.g., if you don’t do rentals, exclude “аренда” searches).
  - Yandex’s match types differ slightly from Google’s – be sure to use the correct operators for broad match vs exact.
- **Ad Copy:** Write your ads in Russian, highlighting unique selling points:
  - Mention something like “Большой выбор квартир” (large selection of apartments) or “Актуальные объявления, прямая продажа” (updated listings, direct sale).
  - Yandex allows extended ad titles – the first sentence of description can concatenate to title if you add a punctuation. Use this to make the ad stand out.
  - Include a call to action, like “Смотрите сейчас!” (See now!) or “Звоните – консультация бесплатно” (Call for a free consultation) if applicable.
  - Ensure the ad links to a relevant landing page (e.g., apartment ads to the apartment category page, not just the homepage). This improves Quality Score.
- **Budget & Bidding:** Yandex.Direct operates on an auction CPC model. Start with a modest daily budget and see how many clicks you get. Bids for real estate keywords can be competitive. Use Yandex’s bid simulators to see approximate positions. It might be worth bidding for first place for high-value keywords if budget allows, as those get significantly more clicks.
  - Consider using automated bidding strategies Yandex.Direct offers (like optimized for conversions, if you set up conversion tracking – e.g., contact form submissions as a goal).
  - Keep an eye on ROI: if a click is expensive, ensure it’s likely to lead to a sale or valuable inquiry.
- **Landing Page Optimization:** For paid traffic, ensure the page they land on is optimized to convert:
  - If it’s a category page, show a prominent search filter or highlight featured listings to catch interest.
  - Maybe have a clear contact option (“Need help finding a property? Contact us.”) for those who came via an ad.
  - Fast load times are crucial – users coming from ads might bounce if it loads slow on mobile.
- **Yandex Metrica + Goals:** Use Yandex Metrica to set up goals (like a user clicking “Show phone number” or submitting a contact form). Then link Metrica to Yandex.Direct. This way, you can enable conversion tracking in Direct and optimize for those actions. Yandex.Direct can then auto-adjust bids for users more likely to convert (similar to Google Ads conversion optimization).
- **Ad Extensions:** Yandex.Direct has ad extensions (sitelinks, callouts, etc.). Use them:
  - Sitelinks: add additional links (like “🏠 Дома”, “🏢 Квартиры”, “🏬 Коммерческая”) which can appear below your ad linking to those sections.
  - Callout extensions: short texts like “Без посредников”, “Ежедневное обновление” (no middlemen, updated daily).
  - These make your ad larger and more noticeable.
- **Geotargeting:** If the business is local, target your specific region in the campaign settings. Yandex allows granular geo targeting. This avoids wasteful clicks from users in other areas unlikely to buy in your region.
- **Time Targeting:** You could schedule ads to run when you can respond to inquiries promptly. If someone submits a form at 3am, you might only reach them later – maybe that’s fine, but consider if you only want ads in business hours or around them.
- **Testing & Optimization:** Continuously A/B test ad copy (Yandex allows creating multiple ads per ad group). See which phrasing gets better click-through rate and conversion rate. Also, monitor keywords – pause those that get clicks but no conversions. Add new keywords as you discover them.
  - Yandex.Direct’s analytics will show you performance by keyword, region, device, etc. Use that data to refine.
- **Budget Management:** If the budget is limited, focus on the most relevant keywords (like including your city name for targeted traffic). You can also use Yandex’s forecast tool to see how many clicks to expect. It’s often better to appear in top 3 for a few keywords than barely show for many.
- **Quality Score:** Yandex, like Google, has a quality score that affects your ad ranking and cost. Relevant keywords, ads, and landing pages improve this. The steps above (tight thematic groups, good ad copy, relevant landing content) will help ensure a high quality score, meaning you pay less per click for the same position.

**Summary:** Use Yandex.Direct to drive initial traffic, especially while organic SEO efforts ramp up (SEO is a longer game). Meanwhile, build your site’s content and reputation so that over time you rely less on paid traffic. Track both channels in analytics to measure which listings or campaigns yield actual leads or sales. Over time, you might find certain neighborhoods or property types perform best, and you can adjust both SEO content and ad spend to capitalize on those.

------

## Key Issues and Action Plan

Finally, here is a summary of the most important issues identified, with recommended priority for fixing:

| Issue / Improvement                                          | Severity     | Fix Complexity | Priority (1=highest) | Reference (File/Example)                                     |
| ------------------------------------------------------------ | ------------ | -------------- | -------------------- | ------------------------------------------------------------ |
| **Use secure JWT secret in env (no default)** – Prevent token forgery. | **Critical** | Simple         | 1                    | `src/lib/auth.ts` – hardcoded default secret                 |
| **Sanitize image path to prevent traversal** – Lock down `/api/image`. | **Critical** | Simple         | 1                    | `api/image/[...path]/route.ts` – no check on `..`            |
| **Fix logout cookie clearing** – Ensure admins can truly log out. | **High**     | Simple         | 1                    | `api/auth/logout/route.ts` – improper cookie usage           |
| **Consolidate Prisma client** – Avoid multiple DB connections. | **High**     | Simple         | 2                    | Multiple files (use `lib/prisma` everywhere)                 |
| **SSR for listing pages** – Improve SEO/load (avoid purely client fetch). | **High**     | Moderate       | 2                    | `app/listing/[id]/page.tsx` – currently `'use client'` fetching data |
| **Image handling via external storage/optimization** – Needed for scaling and speed. | **High**     | Moderate       | 2                    | `admin/listings/route.ts` – saves to local `public/images`   |
| **Implement CSRF best practices** – (Strict SameSite or tokens for forms). | Medium       | Simple         | 3                    | Cookie settings in `auth/login` (SameSite=Lax)               |
| **Transaction wrap multi-step ops** – Consistency on create/update. | Medium       | Moderate       | 3                    | `admin/listings/[id]/route.ts` – multi-step update logic     |
| **Add role-based auth check** – Future-proof admin vs normal users. | Medium       | Moderate       | 4                    | `middleware.ts` & `verifyAuth` – currently any user is admin |
| **Validate input data** – Prevent bad data/errors (especially on listing forms). | Medium       | Moderate       | 4                    | e.g. `admin/listings/route.ts` – no validation for fields    |
| **Remove dev artifacts & logs** – Clean up for prod (AuthContext.tmp, console logs). | Low          | Simple         | 5                    | Various (`console.log` in auth, seeds, etc.)                 |
| **Add tests and monitoring** – Ensure reliability post-deploy. | Low          | Moderate       | 5                    | (Out of code scope – set up testing framework)               |

By tackling the above issues in roughly this order, you will significantly enhance the security, stability, and performance of the application before going live. Many of the high-severity fixes are quick wins (configuration changes or small code changes), so they should be done immediately. Medium-level improvements like refactoring for transactions and adding more validation/testing will pay off in the maintenance phase and can be done once the critical fixes are out of the way.

------

**Conclusion:** With the recommended changes, the realty website can be made production-ready to reliably serve users. Focus first on security patches and architectural fixes (to ensure a stable foundation), then polish performance (SSR, caching, CDN) and finally invest in SEO/marketing to attract the target audience. Good luck with the deployment – by following this audit, you’ll have a robust, secure, and optimized real estate platform ready for the Russian market! ([The Ultimate Guide to Yandex SEO](https://www.searchenginejournal.com/yandex-seo-guide/252885/#:~:text=,Irstlena Pershina)) ([The Ultimate Guide to Yandex SEO](https://www.searchenginejournal.com/yandex-seo-guide/252885/#:~:text=Yandex supports schema mark,Images search results))