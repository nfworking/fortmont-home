# Security Review — fortmont-home

**Date:** 2026-07-27  
**Scope:** Full application audit — Next.js 14 App Router, NextAuth JWT sessions, custom OAuth server, Prisma/MariaDB, admin surfaces (OAuth clients, ticketing), and all integrations (Entra, UniFi, proxy, storage, mail).

---

## CRITICAL

### 1. Hardcoded database credentials — `lib/prisma.tsx`
The MariaDB host, username, password (`"StrongPassword"`), and database name are hardcoded directly in source code. This is OWASP A02 (Security Misconfiguration). Anyone with repository access has full database credentials.

**Fix:** Replace with environment variables (`DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`).

---

### 2. `getUserRole()` always returns `"admin"` — `lib/ticketing-auth.ts` (line 14)
```ts
async function getUserRole(userId: string): Promise<string | null> {
  return "admin"; // ← every authenticated user is an admin
}
```
Any logged-in user receives admin-level access to the entire ticketing system. This is OWASP A01 (Broken Access Control).

**Fix:** Implement a real role lookup — query `prisma.user.findUnique({ where: { id: userId }, select: { role: true } })` or read the role from the validated session token.

---

### 3. No `middleware.ts` — no centralized route protection
There is no `middleware.ts` file. All route protection depends on individual layout/page-level checks, which are inconsistently applied. Admin routes in particular have incomplete guards (see items 4 & 5).

**Fix:** Create `middleware.ts` at the project root using NextAuth's `auth` middleware to protect `/dashboard`, `/admin`, `/admin_ticketing`, `/platform`, and all API routes that require authentication.

---

### 4. `app/admin/oauth-clients` has no auth or role check — `app/admin/oauth-clients/page.tsx`
This page is a `"use client"` component with no server-side session or role verification. Any user who navigates to `/admin/oauth-clients` can view, create, and delete OAuth clients.

**Fix:** Convert to a server component (or add a server action layer) and guard with `await auth()` + role check before rendering.

---

### 5. `admin_ticketing` layout checks session existence but not role — `app/admin_ticketing/layout.tsx`
`await auth()` is called only to fetch user display data. There is no `if (!session || session.user.role !== 'admin') redirect('/login')` guard. Combined with finding #2, this exposes the entire admin ticketing UI to every authenticated user.

**Fix:** Add an explicit role check immediately after `await auth()` and redirect unauthorized users.

---

## HIGH

### 6. `passwordHash` forwarded to client — `app/admin_ticketing/dashboard/page.tsx` (line 58)
The `passwordHash` field is fetched from the upstream API and included in the `serializedUsers` array passed to the `TicketDashboard` client component. Password hashes must never be sent to the browser.

**Fix:** Omit `passwordHash` when mapping `serializedUsers`, or add it to the Prisma `select` exclusion list at the source.

---

### 7. `NEXT_PUBLIC_API_KEY` sent as a request header from a client component — `components/dashboard/entra/cards.tsx` (line 33)
```ts
"x-api-key": process.env.NEXT_PUBLIC_API_KEY!
```
All `NEXT_PUBLIC_*` variables are bundled into client-side JavaScript and visible to anyone inspecting page source or network traffic. This API key is publicly exposed and provides no security benefit. The component already uses `withBearerToken` for authentication.

**Fix:** Remove the `x-api-key` header from this component entirely.

---

### 8. Access token and refresh token exposed in client-side session — `lib/auth.ts`
The `session` callback assigns `session.accessToken` and `session.refreshToken`, making both available to `useSession()` in every client component. An XSS vulnerability anywhere in the application would give an attacker full OAuth credentials with offline access.

**Fix:** Audit which client components genuinely need the raw access token. Where possible, proxy sensitive API calls through Next.js server-side API routes so tokens never reach the browser.

---

### 9. Raw cookie header forwarded to internal API — `app/admin_ticketing/dashboard/page.tsx` (lines 27–38)
```ts
const cookie = (await headers()).get("cookie");
const res = await fetch(`${process.env.API_HOST}/api/ticketing/...`, {
  headers: { cookie: cookie ?? "" },
```
This forwards the user's full cookie jar — including the NextAuth session token — to an internal service. This is an SSRF-adjacent pattern that leaks session credentials unnecessarily.

**Fix:** Call the internal ticketing API with a dedicated service-to-service bearer token or API key instead of forwarding the user's browser cookies.

---

### 10. IP address taken from `x-forwarded-for` without trusted-proxy validation — `lib/auth.ts`
`x-forwarded-for` can be freely set by any client unless a trusted reverse proxy strips and replaces it first. If the application is ever directly reachable (e.g. during development, misconfigured proxy, or container network exposure), session IP addresses can be spoofed.

**Fix:** Document and enforce that only the first address in `x-forwarded-for` from a known trusted proxy CIDR is accepted. Consider adding a `TRUSTED_PROXY_CIDR` environment variable check.

---

## MEDIUM

### 11. No HTTP security headers — `next.config.ts`
`next.config.ts` has no `headers()` configuration. The following headers are missing:

| Header | Purpose |
|---|---|
| `Content-Security-Policy` | XSS mitigation |
| `X-Frame-Options: DENY` | Clickjacking prevention |
| `X-Content-Type-Options: nosniff` | MIME sniffing prevention |
| `Referrer-Policy: strict-origin-when-cross-origin` | Referrer leakage control |
| `Permissions-Policy` | Disable unused browser APIs |
| `Strict-Transport-Security` | Force HTTPS |

**Fix:** Add a `headers()` async function in `next.config.ts` applying these to all routes.

---

### 12. Notification polling at 2-second intervals — `components/common/notificationUi.tsx`
`POLL_INTERVAL_MS = 2000` fires a credentialed API request every 2 seconds per open browser tab. With many concurrent users this creates significant backend load and can function as an unintentional self-DoS.

**Fix:** Increase the interval to ≥30 seconds, or replace polling with a server-sent events stream.

---

### 13. `handlePasswordChange` missing try-catch — `components/account/Securitysection.tsx`
The function has no `try/catch`. If the `fetch` or `.json()` call throws (network error, malformed response), the result is an unhandled promise rejection that silently crashes the UI with no user feedback and may surface stack information in development.

**Fix:** Wrap the function body in `try { ... } catch (error) { toast.error(...) }`.

---

### 14. Session SSE endpoint has no rate limiting — `app/api/auth/session-stream/route.ts`
Each request opens a persistent connection and queries the database every 15 seconds. There is no limit on concurrent connections per user or globally, making this a potential resource exhaustion target.

**Fix:** Add a per-user connection limit and ensure the abort signal properly cleans up all resources (the `cancel()` handler is currently empty).

---

### 15. `trustHost: true` with no middleware
`trustHost: true` is appropriate behind a correctly configured reverse proxy, but combined with the absence of `middleware.ts` it means that if the Next.js server is ever directly reachable, host header manipulation could influence redirect and callback URL construction in the OAuth flow.

**Fix:** Ensure network-level controls prevent direct access to the Next.js process, and implement `middleware.ts` as described in item #3.

---

## LOW

### 16. Hard-coded external image URL in `MailboxOnboarding` — `components/mail/mailbox.tsx`
The background image is fetched directly from `images.unsplash.com`. This creates an external dependency, requires adding the domain to any future CSP `img-src` directive, and will break silently if the URL is removed.

**Fix:** Download the image and serve it as a local asset from `public/`.

---

### 17. `appendQueryToUri` appends to arbitrary redirect URIs without scheme validation — `lib/oauth.ts`
`createOAuthErrorRedirect()` appends query parameters to whatever `redirectUri` is passed. There is no scheme-level check (e.g. rejecting `javascript:` URIs). This relies entirely on upstream redirect URI allowlist enforcement.

**Fix:** Add an explicit scheme check (`new URL(redirectUri).protocol` must be `https:` or `http:`) before appending parameters.

---

## Fix Priority Summary

| Priority | File | Action |
|---|---|---|
| 🔴 Critical | `lib/prisma.tsx` | Replace hardcoded credentials with environment variables |
| 🔴 Critical | `lib/ticketing-auth.ts` | Implement real role lookup |
| 🔴 Critical | `middleware.ts` *(new)* | Add centralized auth + role guards |
| 🔴 Critical | `app/admin/oauth-clients/page.tsx` | Add server-side admin role guard |
| 🔴 Critical | `app/admin_ticketing/layout.tsx` | Add `redirect` if role is not admin |
| 🟠 High | `app/admin_ticketing/dashboard/page.tsx` | Strip `passwordHash`; replace cookie-forwarding with service token |
| 🟠 High | `components/dashboard/entra/cards.tsx` | Remove `NEXT_PUBLIC_API_KEY` header |
| 🟠 High | `lib/auth.ts` | Avoid exposing raw tokens in client session |
| 🟡 Medium | `next.config.ts` | Add security response headers |
| 🟡 Medium | `components/account/Securitysection.tsx` | Wrap `handlePasswordChange` in try-catch |
| 🟡 Medium | `components/common/notificationUi.tsx` | Increase poll interval or switch to SSE |
| 🟡 Medium | `app/api/auth/session-stream/route.ts` | Add rate limiting; fix empty `cancel()` |
| 🟢 Low | `components/mail/mailbox.tsx` | Move background image to local asset |
| 🟢 Low | `lib/oauth.ts` | Validate redirect URI scheme in `createOAuthErrorRedirect` |
