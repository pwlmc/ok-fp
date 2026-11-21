---
description: Learn how to use TaskEither in TypeScript for lazy asynchronous computations with explicit typed errors.
---

# TaskEither

`TaskEither<E, T>` represents a **lazy asynchronous computation** that can succeed with a value of type `T` or fail with an error of type `E`.

It combines the laziness of `Task` with the error handling of `Either` - think of it as a `() => Promise<Either<E, T>>`.

## Why TaskEither?

Most real-world async operations can fail: API calls, file reads, database queries. `TaskEither` lets you:

- **Compose** fallible async operations with `flatMap`
- **Handle errors** in a type-safe way - the error type `E` is always visible
- **Stay lazy** - nothing executes until you call `.run()`

```ts
import { type TaskEither } from "ok-fp";

// A plain Promise hides what can go wrong:
async function unsafeFetch(url: string): Promise<User> { /* ... */ }

// TaskEither makes it explicit:
function safeFetch(url: string): TaskEither<HttpError, User> { /* ... */ }
```

## Basic Usage

### Creating a TaskEither

```ts
import { TaskEither, right, task, taskLeft, taskRight } from "ok-fp";

const success = taskRight(42);          // TaskEither<never, number> - resolves to Right(42)
const failure = taskLeft("not found");   // TaskEither<string, never> - resolves to Left("not found")

// Wrap an existing Either
const fromE = TaskEither.fromEither(right(10)); // TaskEither<never, number>

// Wrap a Task (always succeeds)
const fromT = TaskEither.fromTask(task(5));   // TaskEither<never, number>

// Safely wrap a Promise that may reject
const safe = TaskEither.tryCatch(
  () => fetch("/api/user").then((r) => r.json()),
  (err) => `Fetch failed: ${err}`,
); // TaskEither<string, unknown>
```

### Transforming and Chaining

```ts
import { TaskEither, taskLeft, taskRight } from "ok-fp";

type User = { id: string; name: string };

const fetchUser = (id: string) =>
  TaskEither.tryCatch(
    () => fetch(`/api/users/${id}`).then((r) => r.json() as Promise<User>),
    (err) => `Fetch failed: ${err}`,
  );

const greeting = fetchUser("a-001")
  .map((user) => user.name)            // transform the success value
  .map((name) => `Hello, ${name}!`);  // chain another transformation

const result = await greeting.run(); // Either<string, string>
```

### Error Handling

```ts
import { taskLeft, taskRight } from "ok-fp";

const result = await taskLeft("not found")
  .orElse(() => taskRight(0))  // recover from Left
  .run(); // Right(0)

const matched = await taskLeft("error")
  .match(
    (err) => `Failed: ${err}`,
    (val) => `Got: ${val}`,
  )
  .run(); // "Failed: error"
```

### Running a TaskEither

```ts
import { taskLeft, taskRight } from "ok-fp";

const result = await taskRight(42).run(); // Either<never, number> → Right(42)
const error = await taskLeft("oops").run(); // Either<string, never> → Left("oops")
```

---

## API Reference

### Construct

#### taskRight

```ts
taskRight<T, E = never>(value: T): TaskEither<E, T>
```

Create a TaskEither that resolves to `Right` with the provided value.

```ts
import { taskRight } from "ok-fp";

taskRight(42); // TaskEither<never, number>
taskRight("hello"); // TaskEither<never, string>
```

---

#### taskLeft

```ts
taskLeft<E, T = never>(error: E): TaskEither<E, T>
```

Create a TaskEither that resolves to `Left` with the provided error.

```ts
import { taskLeft } from "ok-fp";

taskLeft("not found"); // TaskEither<string, never>
taskLeft(404); // TaskEither<number, never>
```

---

#### TaskEither.fromEither

```ts
TaskEither.fromEither<E, T>(either: Either<E, T>): TaskEither<E, T>
```

Lift an existing `Either` into a `TaskEither`.

```ts
import { TaskEither, left, right } from "ok-fp";

TaskEither.fromEither(right(42));         // TaskEither<never, number>
TaskEither.fromEither(left("error"));     // TaskEither<string, never>
```

---

#### TaskEither.fromTask

```ts
TaskEither.fromTask<T, E = never>(t: Task<T>): TaskEither<E, T>
```

Lift a `Task` (which always succeeds) into a `TaskEither` that always resolves to `Right`.

```ts
import { TaskEither, task } from "ok-fp";

TaskEither.fromTask(task(5));  // TaskEither<never, number> - always Right(5)
```

---

#### TaskEither.tryCatch

```ts
TaskEither.tryCatch<T, E>(thunk: () => Promise<T>, onThrow: (err: unknown) => E): TaskEither<E, T>
```

Safely wrap a Promise-returning thunk that may reject. Rejections are caught and converted to `Left` using `onThrow`.

```ts
import { TaskEither } from "ok-fp";

TaskEither.tryCatch(
  () => fetch("/api/data").then((r) => r.json()),
  (err) => `Request failed: ${err}`,
);
// Right(data) on success, Left("Request failed: ...") on rejection
```

---

### Transform

#### map

```ts
map<U>(mapper: (value: T) => U): TaskEither<E, U>
```

Transform the `Right` value. If this resolves to `Left`, the mapper is not called.

```ts
import { taskLeft, taskRight } from "ok-fp";

taskRight(5).map((n) => n * 2);          // resolves to Right(10)
taskLeft("error").map((n) => n * 2);      // resolves to Left("error")
```

---

#### mapLeft

```ts
mapLeft<F>(mapper: (error: E) => F): TaskEither<F, T>
```

Transform the `Left` value. If this resolves to `Right`, the mapper is not called.

```ts
import { taskRight } from "ok-fp";

taskRight(42).mapLeft((e) => `mapped: ${e}`);     // resolves to Right(42)
```

---

#### flatMap

```ts
flatMap<EE, U>(mapper: (value: T) => TaskEither<EE, U>): TaskEither<E | EE, U>
```

Chain TaskEither-returning operations together. Short-circuits to `Left` if this resolves to `Left`.

```ts
import { TaskEither, taskLeft, taskRight } from "ok-fp";

taskRight(10).flatMap((x) => taskRight(x * 2));  // resolves to Right(20)
taskLeft("error").flatMap((x) => taskRight(x));   // resolves to Left("error")

// Real-world: chain two async steps
const fetchProfile = (id: string) =>
  TaskEither.tryCatch(() => fetch(`/api/profile/${id}`).then((r) => r.json()), String);

taskRight("user-1").flatMap(fetchProfile);
```

---

#### flatten

```ts
flatten(): TaskEither<E | EE, U>  // where this is TaskEither<E, TaskEither<EE, U>>
```

Remove one level of nesting from a nested `TaskEither`.

```ts
import { taskLeft, taskRight } from "ok-fp";

taskRight(taskRight(42)).flatten();          // resolves to Right(42)
taskRight(taskLeft("inner error")).flatten(); // resolves to Left("inner error")
```

---

### Combine

#### zip

```ts
zip<EE, A>(other: TaskEither<EE, A>): TaskEither<E | EE, readonly [T, A]>
```

Combine two `TaskEither` values into a tuple. Both are run concurrently. Returns the first `Left` if either fails.

```ts
import { taskLeft, taskRight } from "ok-fp";

taskRight("Alice").zip(taskRight(30));     // resolves to Right(["Alice", 30])
taskRight("Alice").zip(taskLeft("No age")); // resolves to Left("No age")
```

---

#### ap

```ts
ap<EE, A, U>(this: TaskEither<E, (a: A) => U>, arg: TaskEither<EE, A>): TaskEither<E | EE, U>
```

Apply a function wrapped in a `TaskEither` to a value wrapped in a `TaskEither`. Both are run concurrently.

```ts
import { taskLeft, taskRight } from "ok-fp";

const add = (x: number) => (y: number) => x + y;
taskRight(add(5)).ap(taskRight(3));    // resolves to Right(8)
taskRight(add(5)).ap(taskLeft("err")); // resolves to Left("err")
```

---

#### tap

```ts
tap(sideEffect: (value: T) => unknown): TaskEither<E, T>
```

Run a side effect with the `Right` value. Returns the original `TaskEither` unchanged.

```ts
import { taskLeft, taskRight } from "ok-fp";

await taskRight(42).tap((v) => console.log("value:", v)).run();
// logs "value: 42", resolves to Right(42)

await taskLeft("error").tap((v) => console.log("value:", v)).run();
// no log, resolves to Left("error")
```

---

#### tapLeft

```ts
tapLeft(sideEffect: (error: E) => unknown): TaskEither<E, T>
```

Run a side effect with the `Left` value. Returns the original `TaskEither` unchanged.

```ts
import { taskLeft, taskRight } from "ok-fp";

await taskLeft("error").tapLeft((e) => console.error("error:", e)).run();
// logs "error: error", resolves to Left("error")

await taskRight(42).tapLeft((e) => console.error("error:", e)).run();
// no log, resolves to Right(42)
```

---

### Inspect

#### match

```ts
match<U>(onLeft: (error: E) => U, onRight: (value: T) => U): Task<U>
```

Pattern match on the resolved `Either`. Returns the result wrapped in a `Task`.

```ts
import { taskLeft, taskRight } from "ok-fp";

await taskRight(5).match(() => 0, (x) => x * 2).run();     // 10
await taskLeft("error").match(() => 0, (x) => x * 2).run(); // 0
```

---

#### getOrElse

```ts
getOrElse(fallback: (error: E) => T): Task<T>
```

Extract the `Right` value, or return a fallback computed from the `Left`. Returns the result wrapped in a `Task`.

```ts
import { taskLeft, taskRight } from "ok-fp";

await taskRight(42).getOrElse(() => 0).run();      // 42
await taskLeft("error").getOrElse(() => 0).run();   // 0
```

---

#### orElse

```ts
orElse<EE>(fallback: (error: E) => TaskEither<EE, T>): TaskEither<E | EE, T>
```

Return this `TaskEither` if it resolves to `Right`, otherwise recover with the fallback.

```ts
import { taskLeft, taskRight } from "ok-fp";

taskRight(42).orElse(() => taskRight(0)).run();       // Right(42)
taskLeft("error").orElse(() => taskRight(0)).run();    // Right(0)
taskLeft("error").orElse(() => taskLeft("still bad")).run(); // Left("still bad")
```

---

#### run

```ts
run(): Promise<Either<E, T>>
```

Execute the `TaskEither` and return the resulting Promise. Nothing runs until this is called.

```ts
import { taskLeft, taskRight } from "ok-fp";

const result = await taskRight(42).run(); // Right(42)
const error = await taskLeft("oops").run(); // Left("oops")
```

---

### Helpers

#### map2

```ts
map2<EA, A, EB, B, C>(
  taskEitherA: TaskEither<EA, A>,
  taskEitherB: TaskEither<EB, B>,
  f: (a: A, b: B) => C,
): TaskEither<EA | EB, C>
```

Run two TaskEithers concurrently and map their Right values with a pure function. Returns the first Left if either
input is Left.

```ts
import { map2, taskRight } from "ok-fp";

await map2(taskRight(2), taskRight(3), (a, b) => a * b).run(); // Right(6)
```

---

#### map3

```ts
map3<EA, A, EB, B, EC, C, D>(
  taskEitherA: TaskEither<EA, A>,
  taskEitherB: TaskEither<EB, B>,
  taskEitherC: TaskEither<EC, C>,
  f: (a: A, b: B, c: C) => D,
): TaskEither<EA | EB | EC, D>
```

Run three TaskEithers concurrently and map their Right values with a pure function. Returns the first Left if any
input is Left.

```ts
import { map3, taskRight } from "ok-fp";

await map3(
  taskRight(2),
  taskRight(3),
  taskRight(4),
  (a, b, c) => a * b * c,
).run(); // Right(24)
```

---

#### flatMap2

```ts
flatMap2<EA, A, EB, B, EC, C>(
  taskEitherA: TaskEither<EA, A>,
  taskEitherB: TaskEither<EB, B>,
  f: (a: A, b: B) => TaskEither<EC, C>,
): TaskEither<EA | EB | EC, C>
```

Run two TaskEithers concurrently, map their Right values to another TaskEither, then flatten the result. Returns the
first Left from the inputs or the returned TaskEither.

```ts
import { flatMap2, taskRight } from "ok-fp";

await flatMap2(taskRight(2), taskRight(3), (a, b) => taskRight(a * b)).run(); // Right(6)
```

---

#### flatMap3

```ts
flatMap3<EA, A, EB, B, EC, C, ED, D>(
  taskEitherA: TaskEither<EA, A>,
  taskEitherB: TaskEither<EB, B>,
  taskEitherC: TaskEither<EC, C>,
  f: (a: A, b: B, c: C) => TaskEither<ED, D>,
): TaskEither<EA | EB | EC | ED, D>
```

Run three TaskEithers concurrently, map their Right values to another TaskEither, then flatten the result. Returns the
first Left from the inputs or the returned TaskEither.

```ts
import { flatMap3, taskRight } from "ok-fp";

await flatMap3(
  taskRight(2),
  taskRight(3),
  taskRight(4),
  (a, b, c) => taskRight(a * b * c),
).run(); // Right(24)
```

---

#### TaskEither.all

```ts
TaskEither.all<E, T>(
  taskEithers: TaskEither<E, T>[],
): TaskEither<E, T[]>
```

Run all `TaskEither` values concurrently and collect their `Right` values into an array. Returns the first `Left` if any fails.
::: tip Prefer the free function
`allTaskEithers(taskEithers)` is equivalent to `TaskEither.all(taskEithers)` and is recommended for most call sites.
:::

```ts
import { allTaskEithers, taskLeft, taskRight } from "ok-fp";

await allTaskEithers([taskRight(1), taskRight(2), taskRight(3)]).run(); // Right([1, 2, 3])
await allTaskEithers([taskRight(1), taskLeft("err"), taskRight(3)]).run(); // Left("err")
```
