<div class="hero">
  <h1 class="hero-title">OK-FP</h1>
  <p class="hero-tagline">Essential Effect Data Types for TypeScript</p>
</div>

# Getting Started

OK-FP is a small, focused functional programming toolkit for TypeScript. It provides composable, type-safe wrappers for optional values, errors, and async computations. If you're new to Effect Data Types, the video below gives a quick introduction to the core ideas behind the library.

<div class="video-wrapper">
  <iframe src="https://www.youtube.com/embed/-aNP5pisXWY?start=91" title="Introduction to OK-FP (Riga Frontend Meetup)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen class="video-iframe"></iframe>
  <p class="video-caption">Introduction to OK-FP (FrontEnd Meetup Riga)</p>
</div>

## Installation

Install OK-FP with your package manager of choice:

::: code-group

```sh [npm]
$ npm install ok-fp
```

```sh [pnpm]
$ pnpm add ok-fp
```

```sh [yarn]
$ yarn add ok-fp
```

:::

## Effects

<div class="effect-card">

<a href="/ok-fp/option" class="effect-title">Option</a>

A value that might not exist, a type-safe alternative to `null` checks.

```ts
some("Alice")
  .map((name) => `Hello, ${name}!`)
  .getOrElse(() => "User not found");
```

</div>

<div class="effect-card">

<a href="/ok-fp/either" class="effect-title">Either</a>

Success or typed error. Stops at the first failure.

```ts
right(25)
  .map((age) => age + 1)
  .match(
    (err) => `Error: ${err}`,
    (age) => `Age: ${age}`,
  );
```

</div>

<div class="effect-card">

<a href="/ok-fp/validation" class="effect-title">Validation</a>

Like Either, but accumulates **all** errors. Ideal for forms and config.

```ts
map2(validateName(name), validateAge(age), (name, age) => ({ name, age }));
// Invalid(["Name required", "Must be 18+"])
```

</div>

<div class="effect-card">

<a href="/ok-fp/task" class="effect-title">Task</a>

Lazy async computation. Nothing runs until you call `.run()`.

```ts
fromPromise(() => fetch("/api/user").then((r) => r.json()))
  .map((user) => user.name)
  .run();
```

</div>

<div class="effect-card">

<a href="/ok-fp/task-either" class="effect-title">TaskEither</a>

Lazy async with typed errors. Combines Task + Either.

```ts
const fetchUser = tryCatch(
  () => fetch("/api/user").then((r) => r.json()),
  (err) => `Failed: ${err}`,
);
```

</div>

<style scoped>
.hero {
  text-align: center;
  padding: 1rem 0 4rem;
}
.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  margin: 0 0 0.75rem;
  line-height: 1.1;
}
.hero-tagline {
  font-size: 1.25rem;
  color: var(--vp-c-text-2);
  margin: 0;
}
.video-wrapper {
  margin: 1.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.video-iframe {
  width: 100%;
  max-width: 560px;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
}
.video-caption {
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  margin: 0;
  font-weight: 500;
}
.effect-card {
  position: relative;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.25rem 1.25rem 0;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: border-color 0.25s, box-shadow 0.25s;
}
.effect-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.effect-card div[class*="language-"] {
  margin: 0.75rem -1.25rem 0;
  border-radius: 0 0 8px 8px;
  position: relative;
  z-index: 1;
}
.effect-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  text-decoration: none !important;
  transition: color 0.25s;
}
.effect-card:hover .effect-title {
  color: var(--vp-c-brand-2);
  text-decoration: none !important;
}
.effect-title::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
}
.effect-card > p {
  margin: 0.25rem 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
}
</style>
