# Contributing to BobrChat

Thanks for your interest! We welcome issues, pull requests, and discussions.

## Setup

Follow the [Getting Started](README.md#getting-started) guide in the README to set up your local environment.

### Amp orbs

`.agents/setup` installs Nix, prepares the `orb` development shell pinned by `flake.lock`,
and installs both the app and `og/` dependencies with frozen Bun lockfiles. Amp can
cache the prepared environment in project snapshots, so new orbs reuse the toolchain
and dependencies. Repeated setup runs reuse installed packages and caches.

The orb shell uses repository-local Wrangler instead of building a redundant Nix
copy, which can exhaust small orbs' memory. The default Nix shell is unchanged.

The setup adds a repository-scoped login-shell hook so agents and supervised services
receive the full Nix environment without manually running `nix develop`.
`.agents/resume` checks that this environment and both dependency installations are
available; it does not reinstall packages or authenticate services.

When neither `.env` nor `.env.local` exists, setup copies `.env.example` to
`.env.local`. The template is not a working app configuration: supply the required
values through Amp project secrets or the ignored environment file. Setup does not
provision databases, run migrations, start servers, or deploy anything. Database
commands remain manual, as required by `AGENTS.md`.

For an orb dev server, use `amp orb service start web --command 'bun run dev' --portal`
after configuring the environment and database. Use the returned portal URL to access
it, rather than a sandbox-local address.

## AI Usage

> [!NOTE]
> AI generation is allowed, however it's common courtesy to disclose when you've used AI to generate code, especially for larger changes. Please mention if you used AI in your PR description, and which tool you used (e.g., "Used GitHub Copilot for initial implementation of chat message parsing logic," "Used ChatGPT to help rubber duck an issue," etc). This helps maintain transparency and allows reviewers to provide more targeted feedback.

## Development Workflow

1. **Create a branch** for your feature/fix: `git checkout -b feature/my-feature`
2. **Make changes** following the code style below
3. **Test locally** with `bun run dev` (standard Next.js dev server) or `bun run preview` (Cloudflare Workers preview via Wrangler)
4. **Commit** with clear messages
5. **Push** and open a PR

## Code Style

Style is enforced via ESLint — this runs automatically in VSCode.

**Key conventions:**

- Use `~/*` path aliases for imports from `src/` (e.g., `~/lib/utils`)
- Filenames: `kebab-case`
- Types: use `type` not `interface`
- Double quotes, semicolons, 2-space indent
- Client components: add `"use client"` directive; prefer server components
- Environment variables: import from `~/lib/env`, never `process.env` directly
- Conditional classNames: use `cn()` from `~/lib/utils`

## Running Checks

```bash
bun run lint          # Run ESLint
bun run lint:fix      # Auto-fix style issues
bun run build         # TypeScript check + Next.js build
bun run preview       # Build with OpenNext and preview on Cloudflare Workers locally
```

## Database Changes

If you modify the schema in `src/lib/db/schema/`:

```bash
bun db:push           # Push schema changes
bun db:studio         # Browse data with Drizzle Studio
```

## Commit Messages

Prefix commits with the domain area:

- `sidebar: fix search bar alignment`
- `chat: clean up markdown rendering`
- `auth: add Codeberg OAuth support`

## Contributor License Agreement (CLA)

By contributing, you agree that your contributions will be licensed under the [Business Source License 1.1](LICENSE), and you agree to the following terms:

1. **Grant of Rights:** You grant the project owner a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable license to use, reproduce, modify, and distribute your contributions.
2. **Monetization:** You acknowledge that your contributions may be included in paid, hosted, or commercial versions of this software. You are not entitled to any compensation or royalties.
3. **Ownership:** You retain ownership of your original work, but you grant the project owner the right to re-license your contributions under any terms, including the Business Source License 1.1.
4. **Authority:** You represent that you are the legal owner of the code you are contributing and that it does not infringe on any third-party intellectual property.
