---
status: "accepted"
date: 2025-12-28
---

# Use object-with-methods API style

## Context and Problem Statement

Each effect data type (Option, Either, Task, etc.) exposes operations like `map`, `flatMap`, and `match`.
We need to decide how these operations are surfaced to the consumer: as standalone (free) functions
or as methods on the effect instance.

Most FP languages and libraries (e.g., Haskell, fp-ts) use free functions. This keeps each
function pure and composable, but in TypeScript it leads to deeply nested calls or requires
a `pipe` utility to read naturally:

```ts
// Free functions + pipe (fp-ts style)
pipe(
  some("Alice"),
  map((name) => `Hello, ${name}!`),
  getOrElse(() => "User not found"),
);
```

```ts
// Object with methods
some("Alice")
  .map((name) => `Hello, ${name}!`)
  .getOrElse(() => "User not found");
```

## Considered Options

- **Free functions.** Each operation is a standalone function (e.g., `map(option, fn)`).
  Requires a `pipe` or `flow` helper for readable chaining.
- **Object with methods.** Each effect instance exposes operations as methods
  (e.g., `option.map(fn)`). Chaining is native via dot notation.

## Decision Outcome

Chosen option: **object with methods**, because:

1. Method chaining reads naturally in TypeScript and requires no extra utilities (`pipe`, `flow`).
2. IDE autocompletion shows available operations directly on the value.
3. It matches what TypeScript developers already expect from APIs like `Array`, `Promise`, and `Map`.

For additional context, read the
["Source Code Is Not Going Anywhere... I Hope"](https://pwlmc.dev/posts/ok-fp-breaks-a-core-functional-programming-rule-on-purpose/)
blog post where the reasons for the decision are discussed in more depth.

### Consequences

- All effect data types are implemented as objects with methods.
- No `pipe` or `flow` utility is needed or provided.
- Free function helpers (e.g., `map2`, `all`) are still used where an operation applies
  across multiple instances rather than being called on one.
