## Architecture & Design

**Images Stored on Local Filesystem:** Uploaded images are saved to `public/images` on the server’s disk (e.g., via `saveImage()` in `admin/listings/route.ts` writing files to `process.cwd()/public/images`). **Impact:** This design works on a single-server setup, but in a multi-server or serverless environment it becomes problematic – other instances won’t have the same files, and deployments won’t include user-uploaded images. It also makes backups and scalability harder. **Recommendation:** In the short term, ensure the deployment environment has persistent storage or use a shared volume. For long-term scalability, consider using an object storage service (like AWS S3 or Yandex Object Storage) and serve images via CDN. You can still store the path in the database, but the file should reside in durable storage. **Severity:** High (for horizontal scaling), **Complexity:** Moderate.

---

**No API Versioning:** The API endpoints are defined under `/api/...` without a version prefix. While not critical now, any future changes to API contracts could break clients (though in this case, the client is the same Next app). **Recommendation:** If you foresee third-party API consumers or significant evolution, consider a versioning strategy (e.g., `/api/v1/...`). For internal use, this can be deferred. 

---

### Add Role-Based Access Control

I have a Next.js 13+ app with App Router using PostgreSQL and Prisma. Currently, I have basic JWT-based authentication, but all authenticated users are treated as admins.  
 
I want to implement simple **role-based access control** for just **two users**:
- `ADMIN`: Full access to all features, including managing listings and users.  
- `MODERATOR`: Can manage listings only, but not users or settings.  

Please help me with the following:
1. Modify my `User` model in `prisma/schema.prisma` to support roles using an enum.  
2. Update Prisma with a migration to add the new `role` field.  
3. Modify my JWT logic so that `role` is included in the token.  
4. Update route protection so that only `ADMIN` and `MODERATOR` can access `/admin`, but only `ADMIN` can access user management routes (e.g., `/api/admin/users`).  
5. Show me how to manually assign roles in the DB (e.g., make me `ADMIN` and the other user `MODERATOR`).  
6. Bonus: Optional – in the frontend, show or hide UI links based on role.  

Please provide clean and minimal code examples for each step.


---

### Remove from repo

**Potential Architectural Debt:** A few files and configs appear to be remnants of development that should be cleaned up:

- There is both `next.config.js` and `next.config.ts`. The JS version with actual settings (image domains, etc.) is likely being used, while the TS is mostly empty. Keeping both is confusing – only one is needed.
- An `AuthContext.tsx.tmp` exists, suggesting an unfinished implementation. Unused files increase confusion.
- Debugging artifacts (console logs, `.cursor/` directory with prompt/workbench notes) are present in the repo. These should be removed for production deployment to reduce noise and avoid accidentally exposing internal information.

---

## Performance Optimization

**Database Query Efficiency:** Most data access uses Prisma, which generates optimized SQL. Queries filter by relevant fields and use indexed columns where possible:

- Listing retrieval uses filters on `status`, `categoryId`, etc., and does a count + paginated find (`findMany`) in parallel. Ensure indexes exist on columns like `status`, `categoryId`, `price` if large volumes are expected. In PostgreSQL, primary keys and unique fields (e.g., `id`, `slug`, `listingCode`) are indexed by default. However, adding an index on `Listing.categoryId` and other frequent filter fields (e.g., `status`, `price`) is advisable to speed up queries on listings by category or price range. **Severity:** Medium (if dataset grows), **Complexity:** Simple (add Prisma schema indexes or DB migrations).
- Text search uses SQL `LIKE` via Prisma’s `contains` filters on title and description. For small data, this is fine; for large data or complex search, a full-text index or search engine might be needed. This can be revisited later (Yandex’s indexing can handle text search on SSR content, so this is more about internal search performance).
- Raw SQL usage: The listing history API uses `prisma.$queryRaw` for a custom JOIN query. It properly parameterizes the listing ID, so it’s safe from SQL injection. However, raw queries bypass some optimizations of Prisma. Monitor this query’s performance; if it slows, consider adding an index on `ListingHistory.listingId` (if not already) or moving some logic (like joining user names) to Prisma models. **Severity:** Low (currently).


---

**Caching of Expensive Operations:** At present, each search or filter query hits the database. Given moderate data, this is fine. If traffic or data size grows, introducing caching could help:

- Server-side, use Next.js ISR (Incremental Static Regeneration) or route handler caching for rarely-changing data (e.g., categories list). For instance, category pages could be statically regenerated every X minutes since categories change rarely. Currently `dynamic = 'force-dynamic'` is set (disabling caching), probably to always show fresh listings. In the future, if needed, a strategy could be to cache pages for a short time or use stale-while-revalidate to handle heavy load.
- Client-side, the SWR usage will cache API results in memory. Just ensure not to re-fetch unnecessarily. (It appears SWR is used in `ListingsWithFilters.tsx`, but since SSR already provides initial listings, make sure to coordinate to avoid double fetching on page load).

---

## Reliability & Error Handling

- **Concurrency and Race Conditions:** With two admin users, concurrent edits could happen. The code doesn’t lock records during editing. For example, if two admins edited the same listing simultaneously, last save wins and earlier changes might be lost without notice. This is a complex case to handle (optimistic locking via record version, etc., could be added if needed). Given the small team, it may not be a priority. Just be aware of it for the future if userbase grows.
- **Fault Recovery:** If the server crashes or restarts, the stateless nature (JWT for session, DB for data) means users can continue after refresh. Ensure to run the app in a managed way (e.g., using PM2 or as a service) so it auto-restarts on crash. Also verify that unhandled promise rejections are caught – currently most awaits are in try/catch, which is good.

---

## Nice to, for later: 

#### Remaining light coupling (nice-to-have)

| File | Direct Prisma call | Why it’s OK (for now) | When to move to a service |
|------|-------------------|-----------------------|---------------------------|
| `api/admin/users*.ts` | simple `findMany`, `update`, `delete` | CRUD only a few lines | If you’ll add user roles/ stats/ validation |
| `api/listings/route.ts` & `/[id]/route.ts` | read-only queries | read paths are lightweight | Create `PublicListingService` if logic grows |
| `api/admin/listings/route.ts` lines 44-49 | one lookup for `category` | pre-validation convenience | Could be part of `ListingService.createListing` |

### Next tiny polish (optional)

1. **UserService**: move the handful of user CRUD calls if you plan to add password-reset, bulk invites, etc.
2. **PublicListingService**: wrap the public `listings` queries so search logic is reusable in future (e.g., GraphQL or mobile app).
3. **Unit tests for services**: now that logic is isolated, add Jest tests to lock behaviour.


### 📌 Multiple Prisma Client Instances - Next tiny improvement (optional)

```ts
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query']
        : [],          // silence in prod
  });
```

That keeps production logs clean while retaining verbose SQL logs locally.
