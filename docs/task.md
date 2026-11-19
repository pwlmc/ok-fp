---
description: Learn how to use Task in TypeScript for lazy, composable asynchronous computations that always succeed.
---

# Task

`Task<T>` represents a **lazy asynchronous computation** that always succeeds with a value of type `T`.

Think of it as a `() => Promise<T>` with a composable, functional interface.

## Why Task instead of Promise?

- **Lazy** - a Task does nothing until you call `.run()`. Promises are eager.
- **Composable** - chain, combine, and transform Tasks before executing.

```ts
import { Task } from "ok-fp";

// A Promise runs immediately:
const eager = fetch("/api/users"); // request fires now

// A Task is just a description - nothing runs yet:
const lazy = Task.fromPromise(() => fetch("/api/users"));
// only runs when you call: lazy.run()
```

## Basic Usage

### Creating a Task

```ts
import { Task, task } from "ok-fp";

const immediate = task(42); // Task<number> - wraps a plain value
const lazy = Task.fromPromise(() => fetch("/api/data").then((r) => r.json())); // Task<unknown>
```

### Transforming and Chaining

```ts
import { Task } from "ok-fp";

const fetchUserId = Task.fromPromise(() =>
  fetch("/api/session").then((r) => r.json() as Promise<{ id: string }>),
);

const fetchUser = (id: string) =>
  Task.fromPromise(() => fetch(`/api/users/${id}`).then((r) => r.json()));

const userName = fetchUserId
  .flatMap((session) => fetchUser(session.id)) // chain async steps
  .map((user) => user.name); // transform the result

await userName.run(); // executes only here
```

### Running a Task

```ts
import { task } from "ok-fp";

const t = task(42);
const result = await t.run(); // 42
```

---

## API Reference

### Construct

#### task

```ts
task<T>(value: T): Task<T>
```

Create a Task that immediately resolves with the provided value.

```ts
import { task } from "ok-fp";

task(42); // Task<number>
task("hello"); // Task<string>
```

---

#### Task.fromPromise

```ts
Task.fromPromise<T>(thunk: () => Promise<T>): Task<T>
```

Create a Task from a lazy Promise-returning thunk. The thunk is not called until `.run()` is invoked.

```ts
import { Task } from "ok-fp";

const fetchUser = Task.fromPromise(() => fetch("/api/user").then((r) => r.json()));
await fetchUser.run(); // fetches the user
```

---

### Transform

#### map

```ts
map<U>(mapper: (value: T) => U): Task<U>
```

Transform the value produced by the Task using a mapping function.

```ts
import { task } from "ok-fp";

task(5).map((n) => n * 2); // Task<number> - resolves to 10
await task(5).map((n) => n * 2).run(); // 10
```

---

#### flatMap

```ts
flatMap<U>(mapper: (value: T) => Task<U>): Task<U>
```

Chain Task-returning operations together. The next Task is only created after the previous one resolves.

```ts
import { Task, task } from "ok-fp";

await task(10).flatMap((x) => task(x * 2)).run(); // 20

const fetchProfile = (id: string) => Task.fromPromise(() => fetchProfileById(id));
await task("user-1").flatMap(fetchProfile).run(); // fetches profile for "user-1"
```

---

#### flatten

```ts
flatten(): Task<U>  // where this is Task<Task<U>>
```

Remove one level of nesting from a nested Task.

```ts
import { task } from "ok-fp";

await task(task(42)).flatten().run(); // 42
```

---

### Combine

#### zip

```ts
zip<A>(taskA: Task<A>): Task<readonly [T, A]>
```

Combine two Tasks into a tuple. Both Tasks are run concurrently.

```ts
import { task } from "ok-fp";

await task("Alice").zip(task(30)).run(); // ["Alice", 30]
```

---

#### ap

```ts
ap<A, U>(this: Task<(arg: A) => U>, arg: Task<A>): Task<U>
```

Apply a function wrapped in a Task to a value wrapped in a Task. Both Tasks are run concurrently.

```ts
import { task } from "ok-fp";

const add = (x: number) => (y: number) => x + y;
await task(add(5)).ap(task(3)).run(); // 8
```

---

#### tap

```ts
tap(sideEffect: (value: T) => unknown): Task<T>
```

Run a side effect with the resolved value. Returns the original Task unchanged.

```ts
import { task } from "ok-fp";

await task(42)
  .tap((v) => console.log("value:", v)) // logs "value: 42"
  .run(); // 42
```

---

### Inspect

#### run

```ts
run(): Promise<T>
```

Execute the Task and return the resulting Promise. Nothing runs until this is called.

```ts
import { task } from "ok-fp";

const result = await task(42).run(); // 42
```

---

### Helpers

#### Task.all

```ts
Task.all<T>(tasks: Task<T>[]): Task<T[]>
```

Run all Tasks concurrently and collect their results into an array. Equivalent to `Promise.all` for Tasks.
::: tip Prefer the free function
`allTasks(tasks)` is equivalent to `Task.all(tasks)` and is recommended for most call sites.
:::

```ts
import { allTasks, task } from "ok-fp";

await allTasks([task(1), task(2), task(3)]).run(); // [1, 2, 3]
```
