# Getting Started

## Installation

Install OKFP with your package manager of choice:

```bash
npm install okfp
# or
pnpm add okfp
# or
yarn add okfp
```

## Option

`Option` represents a value that may or may not be present — a type-safe alternative to `null` and `undefined`.

```ts
import { type Option, some, none } from "okfp/option";

const parseNumber = (input: string): Option<number> => {
  const n = Number(input);
  return Number.isFinite(n) ? some(n) : none();
};

const positive = (n: number): Option<number> => (n > 0 ? some(n) : none());

const reciprocal = (n: number): Option<number> => some(1 / n);

const compute = (input: string): Option<number> =>
  parseNumber(input)
    .flatMap(positive)
    .flatMap(reciprocal)
    .map((n) => n * 100);

compute("4");   // Option.some(25)
compute("0");   // Option.none()
compute("abc"); // Option.none()
```

## Either

`Either` represents a computation that can succeed with a value (`right`) or fail with a typed error (`left`).

```ts
import { type Either, right, left } from "okfp/either";

const parsePositive = (input: string): Either<string, number> => {
  const n = Number(input);
  if (!Number.isFinite(n)) return left("Not a number");
  if (n <= 0) return left("Must be positive");
  return right(n);
};

const result = parsePositive("4");
// Either.right(4)

const failed = parsePositive("-1");
// Either.left("Must be positive")
```
