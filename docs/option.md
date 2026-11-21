---
description: Learn how to use Option in TypeScript to represent present or absent values without null and undefined checks.
---

# Option

`Option<T>` represents a value that may or may not exist. It is a type-safe alternative to `null`, `undefined`, or optional chaining.

- **`Some<T>`** - a value of type `T` is present
- **`None<T>`** - no value is present (absence)

## Why Option?

Nullable values (`null`, `undefined`) are a common source of runtime errors. They're easy to forget, hard to track, and their meaning is often ambiguous - does `null` mean "not found", "not loaded yet", or "explicitly empty"?

`Option` makes absence **explicit and type-safe**. You can't accidentally use a missing value - the compiler forces you to handle both cases.

```ts
import { type Option, some, none } from "ok-fp";

// Without Option: null is ambiguous and easy to forget
function unsafeGet(id: string): User | null {
  /* ... */
}
const user = unsafeGet("123");
console.log(user.name); // 💥 runtime error if null

// With Option: you must handle absence
function safeGet(id: string): Option<User> {
  /* ... */
}
safeGet("123").match(
  () => console.log("User not found"),
  (user) => console.log(user.name),
);
```

## Basic Usage

### Creating an Option

```ts
import { Option, some, none } from "ok-fp";

const hasValue = some(42); // some(42)
const empty = none(); // none
const fromNull = Option.fromNullable(null); // none
const fromValue = Option.fromNullable("hello"); // some("hello")
```

### Transforming and Chaining

```ts
import { type Option, some, none } from "ok-fp";

const parseNumber = (input: string): Option<number> => {
  const n = Number(input);
  return Number.isFinite(n) ? some(n) : none();
};

const nonZero = (n: number): Option<number> => (n !== 0 ? some(n) : none());

const positive = (n: number): Option<number> => (n > 0 ? some(n) : none());

const compute = (input: string): Option<number> =>
  parseNumber(input)
    .flatMap(nonZero) // must not be 0
    .flatMap(positive) // must be > 0
    .map((n) => 1 / n) // reciprocal (no need for flatMap)
    .map((n) => n * 100); // scale

// Usage (returns Option instances)
compute("4"); // returns some(25)
compute("0"); // returns none() (fails nonZero)
compute("-3"); // returns none() (fails positive)
compute("abc"); // returns none() (fails parsing)
```

### Extracting the Value

```ts
import { type Option, some, none } from "ok-fp";

const x: Option<number> = some(42);
x.getOrElse(() => 0); // 42

const y: Option<number> = none();
y.getOrElse(() => 0); // 0

// Pattern matching
const result = x.match(
  () => "no value", // None case
  (val) => `value: ${val}`, // some case
);
// result = "value: 42"
```

---

## API Reference

### Construct

#### some

```ts
some<T>(value: T): Option<T>
```

Create an Option containing a value.

```ts
import { some } from "ok-fp";

some(42); // some(42)
some("hello"); // some("hello")
```

---

#### none

```ts
none<T>(): Option<T>
```

Create an Option representing absence.

```ts
import { none } from "ok-fp";

none(); // none
none<number>(); // none (typed)
```

---

#### Option.fromNullable

```ts
Option.fromNullable<T>(value: T | null | undefined): Option<T>
```

Convert a nullable value to Option. Returns `some` if the value is not `null`/`undefined`, otherwise `None`.

```ts
import { Option } from "ok-fp";

Option.fromNullable(42); // some(42)
Option.fromNullable(null); // none
Option.fromNullable(undefined); // none
```

---

#### Option.fromEither

```ts
Option.fromEither<L, R>(either: Either<L, R>): Option<R>
```

Convert an Either to an Option. Right becomes some, Left becomes None.

```ts
import { Option, left, right } from "ok-fp";

Option.fromEither(right(42)); // some(42)
Option.fromEither(left("error")); // none
```

---

### Transform

#### map

```ts
map<U>(f: (value: T) => U): Option<U>
```

Transform the value if present. Returns None if the Option is None.

```ts
import { none, some } from "ok-fp";

some(5).map((n) => n * 2); // some(10)
none<number>().map((n) => n * 2); // none
```

---

#### filter

```ts
filter(predicate: (value: T) => boolean): Option<T>
```

Keep the value only if the predicate holds. Returns None otherwise.

```ts
import { none, some } from "ok-fp";

some(5).filter((n) => n > 3); // some(5)
some(2).filter((n) => n > 3); // none
```

---

#### flatMap

```ts
flatMap<U>(f: (value: T) => Option<U>): Option<U>
```

Chain Option-returning operations. Short-circuits to None if this Option is None.

```ts
import { none, some } from "ok-fp";

const safeDivide = (x: number) => (x === 0 ? none() : some(10 / x));
some(2).flatMap(safeDivide); // some(5)
some(0).flatMap(safeDivide); // none
none().flatMap(safeDivide); // none
```

---

#### flatten

```ts
flatten(): Option<U>  // where this is Option<Option<U>>
```

Remove one level of nesting from a nested Option.

```ts
import { none, some } from "ok-fp";

some(some(5)).flatten(); // some(5)
some(none<number>()).flatten(); // none
```

---

#### orElse

```ts
orElse(fallback: () => Option<T>): Option<T>
```

Return this Option if it contains a value, otherwise return the fallback. The fallback is lazily evaluated.

```ts
import { none, some } from "ok-fp";

some(5).orElse(() => some(10)); // some(5)
none().orElse(() => some(10)); // some(10)
```

---

### Combine

#### zip

```ts
zip<A>(optA: Option<A>): Option<readonly [T, A]>
```

Combine two Options into a tuple. Returns None if either is None.

```ts
import { none, some } from "ok-fp";

some("Alice").zip(some(30)); // some(["Alice", 30])
some("Alice").zip(none()); // none
```

---

#### ap

```ts
ap<A, U>(this: Option<(arg: A) => U>, optA: Option<A>): Option<U>
```

Apply a function wrapped in an Option to a value wrapped in an Option.

```ts
import { none, some } from "ok-fp";

const add = (x: number) => (y: number) => x + y;
some(add(5)).ap(some(3)); // some(8)
some(add(5)).ap(none()); // none
```

---

#### tap

```ts
tap(sideEffect: (value: T) => unknown): Option<T>
```

Run a side effect if some. Returns the original Option unchanged.

```ts
import { none, some } from "ok-fp";

some(5).tap((v) => console.log("value:", v)); // some(5), logs "value: 5"
none().tap((v) => console.log("value:", v)); // none, no log
```

---

#### tapNone

```ts
tapNone(sideEffect: () => unknown): Option<T>
```

Run a side effect if None. Returns the original Option unchanged.

```ts
import { none, some } from "ok-fp";

some(5).tapNone(() => console.log("empty")); // some(5), no log
none().tapNone(() => console.log("empty")); // none, logs "empty"
```

---

### Inspect

#### match

```ts
match<U>(onNone: () => U, onSome: (value: T) => U): U
```

Pattern match on the Option.

```ts
import { none, some } from "ok-fp";

some(5).match(
  () => "empty",
  (x) => `value: ${x}`,
); // "value: 5"

none().match(
  () => "empty",
  (x) => `value: ${x}`,
); // "empty"
```

---

#### getOrElse

```ts
getOrElse(fallback: () => T): T
```

Extract the value, or return a fallback if None. The fallback is lazily evaluated.

```ts
import { none, some } from "ok-fp";

some(5).getOrElse(() => 0); // 5
none().getOrElse(() => 0); // 0
```

---

#### toNullable

```ts
toNullable(): T | null
```

Convert the Option to a nullable value. Returns the value if some, `null` if None.

```ts
import { none, some } from "ok-fp";

some(5).toNullable(); // 5
none().toNullable(); // null
```

---

#### toArray

```ts
toArray(): readonly T[]
```

Convert the Option to an array. Returns a single-element array if some, empty array if None.

```ts
import { none, some } from "ok-fp";

some(42).toArray(); // [42]
none().toArray(); // []
```

---

### Helpers

#### map2

```ts
map2<A, B, C>(optA: Option<A>, optB: Option<B>, f: (a: A, b: B) => C): Option<C>
```

Combine two Options with a function. Returns None if either is None.

```ts
import { map2, none, some } from "ok-fp";

map2(some("John"), some("Doe"), (f, l) => `${f} ${l}`); // some("John Doe")
map2(some("John"), none(), (f, l) => `${f} ${l}`); // none
```

---

#### map3

```ts
map3<A, B, C, D>(optA: Option<A>, optB: Option<B>, optC: Option<C>, f: (a: A, b: B, c: C) => D): Option<D>
```

Combine three Options with a function. Returns None if any is None.

```ts
import { map3, some } from "ok-fp";

map3(some(1), some(2), some(3), (a, b, c) => a + b + c); // some(6)
```

---

#### flatMap2

```ts
flatMap2<A, B, C>(
  optA: Option<A>,
  optB: Option<B>,
  f: (a: A, b: B) => Option<C>,
): Option<C>
```

Combine two Options with a function that returns an Option, then flatten the result. Returns None if either input or
the returned Option is None.

```ts
import { flatMap2, none, some } from "ok-fp";

flatMap2(some(2), some(3), (a, b) => (a + b > 0 ? some(a + b) : none())); // some(5)
```

---

#### flatMap3

```ts
flatMap3<A, B, C, D>(
  optA: Option<A>,
  optB: Option<B>,
  optC: Option<C>,
  f: (a: A, b: B, c: C) => Option<D>,
): Option<D>
```

Combine three Options with a function that returns an Option, then flatten the result. Returns None if any input or
the returned Option is None.

```ts
import { flatMap3, some } from "ok-fp";

flatMap3(some(1), some(2), some(3), (a, b, c) => some(a + b + c)); // some(6)
```

---

#### Option.sequence

```ts
Option.sequence<T>(opts: Option<T>[]): Option<T[]>
```

Convert an array of Options to an Option of array. Returns None if any element is None.

```ts
import { Option, none, some } from "ok-fp";

Option.sequence([some(1), some(2), some(3)]); // some([1, 2, 3])
Option.sequence([some(1), none(), some(3)]); // none
```
