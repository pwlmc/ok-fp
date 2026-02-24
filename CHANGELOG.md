# Changelog

All notable changes to this project will be documented in this file.

## [Next]

### Added

- `Task<T>` — a lazy async computation that wraps `() => Promise<T>`, with `map`, `flatMap`, `flatten`, `ap`, `zip`, `tap`, and `run`

## [0.2.0](https://github.com/pwlmc/okfp/compare/v0.0.1..v0.2.0) - 2026-02-23

### Added

- `Validation<E, T>` applicative — accumulates errors across independent validations instead of short-circuiting on the first failure (unlike `Either`)
- Full `Validation` documentation with API reference and an "Either vs Validation" decision guide
- `Validation` section added to the Getting Started page

### Changed

- **BREAKING** `EitherV<E, T>` renamed to `EitherValue<E, T>`.
- **BREAKING** `OptionV<T>` renamed to `OptionValue<T>`.

## [0.0.1](https://github.com/pwlmc/okfp/compare/v0.0.0..v0.0.1) - 2026-02-21

### Added

- Initial release of `ok-fp`.
- `Option` type with `some`, `none`, `map`, `flatMap`, and related utilities.
- `Either` type with `right`, `left`, `map`, `flatMap`, and related utilities.
