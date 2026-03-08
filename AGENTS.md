# OK-FP

Essential Effect Data Types for TypeScript.

## Project Structure

Single-package library (not a monorepo):

- `src/` - Source code, one directory per effect type
- `docs/` - VitePress documentation site
- `dist/` - Build output (not committed)

Each effect type follows the same layout:

- `src/{type}/` - Implementation directory
- `src/{type}.ts` - Barrel re-export
- `src/{type}/model.ts` - Type definitions
- `src/{type}/constructors.ts` - Factory functions
- `src/{type}/helpers.ts` - Utility functions
- `src/{type}/{type}.ts` - Core implementation
- `src/{type}/{type}.spec.ts` - Tests
- `src/{type}/constructors.spec.ts` - Constructor tests
- `src/{type}/helpers.spec.ts` - Helper tests

## Tech Stack

- **Runtime:** Node.js (ESM)
- **Language:** TypeScript (strict mode)
- **Build:** tsdown
- **Test:** vitest (with `@vitest/coverage-v8`)
- **Lint:** Biome
- **Docs:** VitePress

## Commands

```bash
npm run lint          # Run Biome check
npm run typecheck     # Run tsc --noEmit
npm run test          # Run vitest
npm run build         # Build with tsdown
npm run docs:dev      # Dev server for docs
npm run docs:build    # Build docs
```

## Key Conventions

- Tests are co-located with source files using `.spec.ts` suffix
- Imports use `.js` extensions (ESM convention for TypeScript)
- `clearMocks: true` is set globally in vitest config. No need to manually reset mocks.
- Each effect type has its own barrel export in `src/{type}.ts`
- Package exports are per-effect: `ok-fp/option`, `ok-fp/either`, `ok-fp/validation`, `ok-fp/task`, `ok-fp/taskEither`
- Test utilities for algebraic laws (functor, monad, applicative) live in `src/testUtils/`

## Agent Guidelines

### Permissions

- **Allowed without asking:** non-mutating npm scripts (`lint`, `typecheck`, `test`, `build`), reading project files, creating commits.
- **Requires permission:** `npm install` or any command that modifies project dependencies, pushing to origin.

### Quality Assurance

After a batch of code changes, verify that QA scripts pass (`lint`, `typecheck`, `test`) and that the package builds correctly before considering the work done.

### General Rules

- Read existing code before modifying it. Understand the patterns in use.
- Keep changes minimal and focused. Do not refactor surrounding code unless asked.
- Follow existing conventions. Do not introduce new patterns without discussion.

### Code Style

- TypeScript strict mode. All compiler options in `tsconfig.json` are intentional.
- Functional style. Prefer `const`, pure functions, and immutable data.
- No classes except for the effect type implementations.
- ESM imports with `.js` extensions (e.g., `import foo from "./foo.js"`).
- Use Biome for formatting and linting. Do not override Biome rules without discussion.

### Writing Style

- Be strict and concise. No filler, no fluff.
- Never use em dashes in docs, comments, or commit messages. Use commas, periods, or parentheses instead.
- Markdown files (docs, ADRs) should have lines wrapped at 120 characters max.

### Testing

- Co-locate tests with source: `foo.ts` -> `foo.spec.ts`
- Use vitest (`describe`, `it`, `expect`)
- Test behavior, not implementation. Prefer testing public API surfaces.
- Algebraic law tests (functor, monad, applicative) use shared helpers from `src/testUtils/`

### Commits & PRs

- Use conventional commits (e.g., `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`).
- One logical change per commit.
- PR descriptions should explain the "why", not just the "what".
- CI must pass: lint, typecheck, test, build.
