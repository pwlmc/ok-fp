---
description: Learn how to use Validation in TypeScript to accumulate independent errors instead of stopping at the first failure.
---

# Validation

`Validation<E, T>` represents a computation that can succeed with a value (`Valid`) or fail with **accumulated** errors (`Invalid`).

- **`Valid<E, T>`** - success, carries a value of type `T`
- **`Invalid<E, T>`** - failure, carries one or more errors of type `E`

## Either vs Validation: When to Use Which

Both `Either` and `Validation` model computations that can fail, but they behave very differently when you combine multiple failing computations. Choosing the right one matters.

### Use `Either` when

- **Steps are dependent** - each step relies on the result of the previous one. If step 1 fails, step 2 cannot proceed.
- **You want to stop at the first error** - a pipeline where the first failure is the only one that matters.
- **You are sequencing operations** - chaining `flatMap` through a series of transformations.

```ts
import { right, left } from "ok-fp";

const parseAge = (input: string) => {
  const n = Number(input);
  return Number.isInteger(n) ? right(n) : left("Must be a whole number");
};

const validateAge = (n: number) =>
  n >= 0 && n <= 150 ? right(n) : left("Must be between 0 and 150");

// Each step depends on the previous - Either is the right choice
parseAge("abc")
  .flatMap(validateAge)
  .match(
    (err) => console.error(err), // "Must be a whole number"
    (age) => console.log(age),
  );
```

### Use `Validation` when

- **Steps are independent** - you are validating several fields or inputs that do not depend on each other.
- **You want all errors at once** - reporting every problem in a form, a config file, or a batch of inputs in a single pass.

```ts
import { invalid, map2, valid } from "ok-fp";

const validateName = (name: string) =>
  name.length > 0 ? valid(name) : invalid("Name is required");

const validateAge = (age: number) =>
  age >= 0 ? valid(age) : invalid("Age must be non-negative");

// Both validations are independent - Validation accumulates all errors
map2(validateName(""), validateAge(-1), (name, age) => ({ name, age })).match(
  (errors) => console.error(errors), // ["Name is required", "Age must be non-negative"]
  (user) => console.log(user),
);
```

### Quick reference

| Scenario                              | Use          |
| ------------------------------------- | ------------ |
| Steps depend on each other            | `Either`     |
| Stop at the first failure             | `Either`     |
| Validate independent fields           | `Validation` |
| Collect all errors in one pass        | `Validation` |
| Parsing a pipeline of transformations | `Either`     |
| Form or config validation             | `Validation` |

### The key difference in action

```ts
import { invalid, left, map2 } from "ok-fp";

// Either: stops at the first error
map2(
  left("Name is required"),
  left("Age must be positive"),
  (name, age) => ({ name, age }),
);
// Left("Name is required")  ← second error is never seen

// Validation: collects all errors
map2(
  invalid("Name is required"),
  invalid("Age must be positive"),
  (name, age) => ({ name, age }),
);
// invalid(["Name is required", "Age must be positive"])  ← both errors reported
```

## Basic Usage

### Creating a Validation

#### Create directly

```ts
import { invalid, valid } from "ok-fp";

const success = valid(42); // valid(42)
const failure = invalid("Something went wrong"); // invalid(["Something went wrong"])
```

#### Create from Either

```ts
import { Validation, left, right } from "ok-fp";

const fromRight = Validation.fromEither(right(42)); // valid(42)
const fromLeft = Validation.fromEither(left("error")); // invalid(["error"])
```

#### Create from Option

```ts
import { Validation, none, some } from "ok-fp";

const fromSome = Validation.fromOption(some(42), () => "missing"); // valid(42)
const fromNone = Validation.fromOption(none(), () => "missing"); // invalid(["missing"])
```

### Combining Independent Validations

```ts
import { invalid, map2, map3, valid } from "ok-fp";

const validateName = (name: string) =>
  name.trim().length > 0 ? valid(name.trim()) : invalid("Name is required");

const validateEmail = (email: string) =>
  email.includes("@") ? valid(email) : invalid("Invalid email address");

const validateAge = (age: number) =>
  age >= 18 ? valid(age) : invalid("Must be at least 18");

// All three are validated independently - all errors are collected
map3(
  validateName(""),
  validateEmail("not-an-email"),
  validateAge(16),
  (name, email, age) => ({ name, email, age }),
).match(
  (errors) => console.error("Errors:", errors),
  // ["Name is required", "Invalid email address", "Must be at least 18"]
  (user) => console.log("User:", user),
);
```

### Extracting the Value

```ts
import { invalid, valid } from "ok-fp";

const x = valid(42);
x.getOrElse(() => 0); // 42

const y = invalid("error");
y.getOrElse(() => 0); // 0

// Pattern matching
const result = x.match(
  (errors) => `Errors: ${errors.join(", ")}`, // Invalid case
  (val) => `Value: ${val}`, // Valid case
);
// result = "Value: 42"
```

---

## API Reference

### Construct

#### valid

```ts
valid<T, E = never>(value: T): Validation<E, T>
```

Create a Validation containing a success value.

```ts
import { valid } from "ok-fp";

valid(42); // valid(42)
valid("hello"); // valid("hello")
```

---

#### invalid

```ts
invalid<E, T = never>(error: E): Validation<E, T>
```

Create a Validation containing a single error. The error is wrapped in an array internally.

```ts
import { invalid } from "ok-fp";

invalid("Something went wrong"); // invalid(["Something went wrong"])
invalid(404); // invalid([404])
```

---

#### Validation.fromEither

```ts
Validation.fromEither<E, T>(either: Either<E, T>): Validation<E, T>
```

Convert an Either to a Validation. `Right` becomes `Valid`, `Left` becomes `Invalid` with a single error.

```ts
import { Validation, left, right } from "ok-fp";

Validation.fromEither(right(42)); // valid(42)
Validation.fromEither(left("error")); // invalid(["error"])
```

---

#### Validation.fromOption

```ts
Validation.fromOption<E, T>(opt: Option<T>, onNone: () => E): Validation<E, T>
```

Convert an Option to a Validation. `Some` becomes `Valid`, `None` becomes `Invalid` with the provided error.

```ts
import { Validation, none, some } from "ok-fp";

Validation.fromOption(some(42), () => "missing"); // valid(42)
Validation.fromOption(none(), () => "missing"); // invalid(["missing"])
```

---

### Transform

#### map

```ts
map<U>(mapper: (value: T) => U): Validation<E, U>
```

Transform the Valid value. Invalid is passed through unchanged.

```ts
import { invalid, valid } from "ok-fp";

valid(5).map((n) => n * 2); // valid(10)
invalid("error").map((n) => n * 2); // invalid(["error"])
```

---

#### filterOrElse

```ts
filterOrElse(predicate: (value: T) => boolean, onInvalid: () => E): Validation<E, T>
```

Keep the Valid value only if the predicate holds. Returns Invalid with the provided error otherwise.

```ts
import { invalid, valid } from "ok-fp";

valid(5).filterOrElse(
  (n) => n > 3,
  () => "too small",
); // valid(5)

valid(2).filterOrElse(
  (n) => n > 3,
  () => "too small",
); // invalid(["too small"])

invalid("error").filterOrElse(
  (n) => n > 3,
  () => "too small",
); // invalid(["error"])
```

---

### Combine

#### ap

```ts
ap<EE, A, U>(this: Validation<E, (a: A) => U>, arg: Validation<EE, A>): Validation<E | EE, U>
```

Apply a function wrapped in a Validation to a value wrapped in a Validation. Unlike `Either.ap`, if both are Invalid **errors are accumulated**.

```ts
import { invalid, valid } from "ok-fp";

const add = (x: number) => (y: number) => x + y;
valid(add(5)).ap(valid(3)); // valid(8)
valid(add(5)).ap(invalid("err")); // invalid(["err"])
invalid("e1").ap(invalid("e2")); // invalid(["e1", "e2"]) ← errors accumulated!
```

---

#### zip

```ts
zip<EE, A>(valA: Validation<EE, A>): Validation<E | EE, readonly [T, A]>
```

Combine two Validations into a tuple. If both are Valid, returns Valid with a tuple. If either is Invalid, accumulates all errors.

```ts
import { invalid, valid } from "ok-fp";

valid("Alice").zip(valid(30)); // valid(["Alice", 30])
valid("Alice").zip(invalid("No age")); // invalid(["No age"])
invalid("e1").zip(invalid("e2")); // invalid(["e1", "e2"])
```

---

#### tap

```ts
tap(sideEffect: (value: T) => void): Validation<E, T>
```

Run a side effect if Valid. Returns the original Validation unchanged.

```ts
import { invalid, valid } from "ok-fp";

valid(42).tap((v) => console.log("value:", v)); // valid(42), logs "value: 42"
invalid("err").tap((v) => console.log("value:", v)); // invalid(["err"]), no log
```

---

#### tapInvalid

```ts
tapInvalid(sideEffect: (errors: readonly E[]) => void): Validation<E, T>
```

Run a side effect if Invalid. Returns the original Validation unchanged.

```ts
import { invalid, valid } from "ok-fp";

valid(42).tapInvalid((errs) => console.log(errs)); // valid(42), no log
invalid("err").tapInvalid((errs) => console.log(errs)); // invalid(["err"]), logs ["err"]
```

---

### Inspect

#### match

```ts
match<U>(onInvalid: (errors: readonly E[]) => U, onValid: (value: T) => U): U
```

Pattern match on the Validation.

```ts
import { invalid, valid } from "ok-fp";

valid(42).match(
  (errors) => `Errors: ${errors.join(", ")}`,
  (val) => `Value: ${val}`,
); // "Value: 42"

invalid("oops").match(
  (errors) => `Errors: ${errors.join(", ")}`,
  (val) => `Value: ${val}`,
); // "Errors: oops"
```

---

#### getOrElse

```ts
getOrElse(fallback: (errors: readonly E[]) => T): T
```

Extract the Valid value, or return a fallback computed from the errors.

```ts
import { invalid, valid } from "ok-fp";

valid(42).getOrElse(() => 0); // 42
invalid("error").getOrElse(() => 0); // 0
```

---

#### toResult

```ts
toResult(): ValidationResult<E, T>
```

Convert Validation to a plain `ValidationResult` object: `{ ok: true, value: T }` or `{ ok: false, errors: readonly E[] }`.

```ts
import { invalid, valid } from "ok-fp";

valid(42).toResult(); // { ok: true, value: 42 }
invalid("error").toResult(); // { ok: false, errors: ["error"] }
```

---

### Helpers

#### map2

```ts
map2<EA, A, EB, B, C>(valA: Validation<EA, A>, valB: Validation<EB, B>, mapper: (a: A, b: B) => C): Validation<EA | EB, C>
```

Combine two Validations with a function. Accumulates all errors from both if either is Invalid.

```ts
import { invalid, map2, valid } from "ok-fp";

map2(valid("John"), valid("Doe"), (f, l) => `${f} ${l}`); // valid("John Doe")
map2(invalid("e1"), invalid("e2"), (f, l) => `${f} ${l}`); // invalid(["e1", "e2"])
```

---

#### map3

```ts
map3<EA, A, EB, B, EC, C, D>(valA: Validation<EA, A>, valB: Validation<EB, B>, valC: Validation<EC, C>, mapper: (a: A, b: B, c: C) => D): Validation<EA | EB | EC, D>
```

Combine three Validations with a function. Accumulates all errors from all three if any are Invalid.

```ts
import { invalid, map3, valid } from "ok-fp";

map3(
  valid(1),
  valid(2),
  valid(3),
  (a, b, c) => a + b + c,
); // valid(6)

map3(
  invalid("e1"),
  valid(2),
  invalid("e3"),
  (a, b, c) => a + b + c,
); // invalid(["e1", "e3"])
```

---

#### Validation.sequence

```ts
Validation.sequence<E, T>(
  validations: readonly Validation<E, T>[],
): Validation<E, T[]>
```

Convert an array of Validations to a Validation of array. Returns Valid with all values if all are Valid, otherwise accumulates all errors.

```ts
import { Validation, invalid, valid } from "ok-fp";

Validation.sequence([
  valid(1),
  valid(2),
  valid(3),
]); // valid([1, 2, 3])

Validation.sequence([
  valid(1),
  invalid("e1"),
  invalid("e2"),
]); // invalid(["e1", "e2"])
```
