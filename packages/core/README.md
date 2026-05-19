# @buildingsync/core

Shared domain code consumed by **both** the cloud app (BuildingSync-Web)
and the on-prem app (BuildingSync-Onprem). Lives in this repo
because that's where features land first; vendored or published into
the on-prem repo on release.

## What belongs here

- Prisma schema + migrations
- Server actions (the `addResident`, `addLease`, `createWorkOrder`
  family — pure logic, no adapter coupling)
- React components shared between the two apps
- Domain types
- Adapter interfaces (auth, storage, email, push)
- Pure helpers (`brand`, `format`, `invite-code`, `audit`, etc.)

## What does NOT belong here

- Auth / storage / email / push concrete implementations
  (Supabase vs GoTrue, Resend vs SMTP, etc.) — those live in each
  app and implement the interfaces exported from here
- Stripe / Anthropic integrations (cloud-only)
- License-validation client/server (on-prem-only and cloud-only respectively)
- Marketing pages (cloud-only)
- Admin/license/system pages (on-prem-only)

See `onprem/docs/SYNC.md` in the private on-prem repo for the full map.

## How it's wired today

Local path-mapped via `tsconfig.json`:

```json
"paths": {
  "@buildingsync/core":   ["./packages/core/src/index.ts"],
  "@buildingsync/core/*": ["./packages/core/src/*"]
}
```

This works for type-checking + Next.js bundling without needing an
npm workspaces install step. The on-prem repo will consume this
package via git-direct dependency (or, when stable, a private npm
registry publish).

## Migration plan

Modules are migrating into here incrementally — moving everything in
one big bang would break too much at once. Migration ordering:

| Wave | Modules                                            | Status   |
| ---- | -------------------------------------------------- | -------- |
| 1    | `brand`                                            | ✅ done  |
| 2    | `format`, `invite-code`                            | pending  |
| 3    | `audit` (interface only — concrete in each app)    | pending  |
| 4    | Adapter interfaces: `AuthAdapter`, `StorageAdapter`, `EmailAdapter`, `PushAdapter` | pending  |
| 5    | Prisma schema move + generator config              | pending  |
| 6    | Server actions (`addResident`, `addLease`, etc.)   | pending  |
| 7    | Shared React components (`Avatar`, `StatusPill`, `PortalNav`, `MobileMenu`, ...) | pending  |
| 8    | API route handlers (generic, with adapter injection) | pending  |

Each wave: move the file into `packages/core/src/`, replace the
original at `lib/<name>.ts` with a re-export so existing imports
keep working, typecheck, commit.

## Adding a new shared module

1. Create `packages/core/src/<name>.ts`
2. Export it from `packages/core/src/index.ts`
3. (Optional) Add a subpath export in `packages/core/package.json`
4. Import via `@buildingsync/core` (root) or `@buildingsync/core/<name>` (subpath)

## Publishing

Not published to a registry yet. The on-prem repo will pin a commit
SHA via `"@buildingsync/core": "github:BuildingAi-Cloud/BuildingSync-Web#<sha>:packages/core"`
during early development, then switch to a private npm registry
(GitHub Packages or Verdaccio) once the API stabilises.
