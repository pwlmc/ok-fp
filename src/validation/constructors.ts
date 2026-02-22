import type { Either } from "../either.js";
import { createValidation, type Validation } from "./validation.js";

/**
 * Creates a Validation containing a valid value.
 *
 * @param value - The valid value to wrap
 * @returns Validation containing the valid value
 *
 * @example
 * ```typescript
 * const v = valid(42); // Validation<never, number>
 * ```
 */
export function valid<T, E = never>(value: T): Validation<E, T> {
	return createValidation({ valid: value });
}

/**
 * Creates a Validation containing a single error.
 *
 * @param error - The error to wrap
 * @returns Validation containing the error
 *
 * @example
 * ```typescript
 * const v = invalid("Something went wrong"); // Validation<string, never>
 * ```
 */
export function invalid<E, T = never>(error: E): Validation<E, T> {
	return createValidation({ invalid: [error] });
}

/**
 * Creates a Validation from an Either.
 * Right values become Valid, Left values become Invalid (with a single error).
 *
 * @param either - The Either to convert
 * @returns Validation equivalent of the Either
 *
 * @example
 * ```typescript
 * fromEither(right(42))       // Valid(42)
 * fromEither(left("error"))   // Invalid(["error"])
 * ```
 */
export function fromEither<E, T>(either: Either<E, T>): Validation<E, T> {
	return either.match(
		(error) => invalid<E, T>(error),
		(value) => valid<T, E>(value),
	);
}
