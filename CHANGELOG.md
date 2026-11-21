# Changelog

All notable changes to this project will be documented in this file.

## [Next]

TBA

## [0.4.0](https://github.com/pwlmc/okfp/compare/v0.3.0...v0.4.0) - 2026-11-21

### Added

- Shared `flatMap2` and `flatMap3` helpers for combining and flattening `Option`, `Either`, `Task`, and `TaskEither`.

## [0.3.0](https://github.com/pwlmc/okfp/compare/v0.2.2...v0.3.0) - 2026-11-20

### Added

- Companion APIs for each effect type: `Option`, `Either`, `Validation`, `Task`, and `TaskEither`.
- Shared `map2` and `map3` helpers for combining values across all effect types.
- Architecture decision records in the `decisions/` directory.

### Changed

- **BREAKING** All package APIs are now exported from `ok-fp`. The `ok-fp/option`, `ok-fp/either`,
  `ok-fp/validation`, `ok-fp/task`, and `ok-fp/taskEither` entry points have been removed.
- **BREAKING** `taskEither` has been renamed to `taskRight`.
- **BREAKING** Task collection helpers have been renamed: `all` is now `allTasks` for `Task` and
  `allTaskEithers` for `TaskEither`.
- **BREAKING** Effect-specific `map2`, `map3`, and `sequence` exports have been removed. Import `map2` and `map3`
  from `ok-fp`, and use `Option.sequence`, `Either.sequence`, or `Validation.sequence`.
- **BREAKING** The minimum supported Node.js version is now 22.
- Documentation now uses the unified package entry point and companion APIs.

## [0.2.2](https://github.com/pwlmc/okfp/compare/v0.2.1...v0.2.2) - 2026-02-26

### Added

- `TaskEither<E, T>` - a lazy async computation that wraps `() => Promise<Either<E, T>>`, with `map`, `mapLeft`, `flatMap`, `flatten`, `ap`, `zip`, `tap`, `tapLeft`, `match`, `getOrElse`, `orElse`, and `run`
- Full `TaskEither` documentation
- `TaskEither` section added to the Getting Started page

## [0.2.1](https://github.com/pwlmc/okfp/compare/v0.2.0...v0.2.1) - 2026-02-25

### Added

- `Task<T>` - a lazy async computation that wraps `() => Promise<T>`, with `map`, `flatMap`, `flatten`, `ap`, `zip`, `tap`, and `run`
- Full `Task` documentation

## [0.2.0](https://github.com/pwlmc/okfp/compare/v0.0.1...v0.2.0) - 2026-02-23

### Added

- `Validation<E, T>` applicative - accumulates errors across independent validations instead of short-circuiting on the first failure (unlike `Either`)
- Full `Validation` documentation with API reference and an "Either vs Validation" decision guide
- `Validation` section added to the Getting Started page

### Changed

- **BREAKING** `EitherV<E, T>` renamed to `EitherValue<E, T>`.
- **BREAKING** `OptionV<T>` renamed to `OptionValue<T>`.

## [0.0.1](https://github.com/pwlmc/okfp/compare/v0.0.0...v0.0.1) - 2026-02-21

### Added

- Initial release of `ok-fp`.
- `Option` type with `some`, `none`, `map`, `flatMap`, and related utilities.
- `Either` type with `right`, `left`, `map`, `flatMap`, and related utilities.
