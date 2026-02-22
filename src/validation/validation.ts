import type { Valid, ValidationV } from "./model.js";

export type Validation<E, T> = {
	/**
	 * Transforms the valid value using a mapping function.
	 * If this Validation is Invalid, returns the same Invalid unchanged.
	 *
	 * @param mapper - Function to transform the contained value
	 * @returns New Validation containing the transformed value, or the same Invalid
	 */
	map: <U>(mapper: (value: T) => U) => Validation<E, U>;

	/**
	 * Applies a function wrapped in a Validation to a value wrapped in a Validation.
	 * Unlike Either, if both are Invalid, errors are accumulated (concatenated).
	 *
	 * @param arg - Validation containing the argument to apply the function to
	 * @returns Validation containing the result, or accumulated errors if any are Invalid
	 *
	 * @example
	 * ```typescript
	 * const add = (x: number) => (y: number) => x + y;
	 * valid(add(5)).ap(valid(3))         // Valid(8)
	 * valid(add(5)).ap(invalid("err"))   // Invalid(["err"])
	 * invalid("e1").ap(invalid("e2"))    // Invalid(["e1", "e2"]) ← errors accumulated!
	 * ```
	 */
	ap: <EE, A, U>(
		this: Validation<E, (a: A) => U>,
		arg: Validation<EE, A>,
	) => Validation<E | EE, U>;

	/**
	 * Pattern matches on the Validation, executing different functions based on its state.
	 *
	 * @param onInvalid - Function to execute if Validation is Invalid, receives the array of errors
	 * @param onValid - Function to execute if Validation is Valid, receives the value
	 * @returns The result of the executed function
	 */
	match: <U>(
		onInvalid: (errors: readonly E[]) => U,
		onValid: (value: T) => U,
	) => U;

	/**
	 * Extracts the valid value, or returns a fallback value if Invalid.
	 *
	 * @param fallback - Function that receives the errors and returns a default value
	 * @returns The valid value if present, otherwise the result of the fallback function
	 */
	getOrElse: (fallback: (errors: readonly E[]) => T) => T;

	/**
	 * Performs a side effect if this Validation is Valid, returning the original Validation unchanged.
	 * If this Validation is Invalid, the side effect is not executed.
	 *
	 * @param sideEffect - Function to execute with the valid value (return value is ignored)
	 * @returns The same Validation instance unchanged
	 */
	tap: (sideEffect: (value: T) => void) => Validation<E, T>;
};

export function createValidation<E, T>(
	value: ValidationV<E, T>,
): Validation<E, T> {
	const validation: Validation<E, T> = {
		map: <U>(mapper: (value: T) => U): Validation<E, U> =>
			validation.match(
				() => forceCast<E, T, E, U>(validation),
				(v) => createValidation<E, U>({ valid: mapper(v) }),
			),

		ap: function <EE, A, U>(
			this: Validation<E, (a: A) => U>,
			arg: Validation<EE, A>,
		): Validation<E | EE, U> {
			return this.match(
				(errors1) =>
					arg.match(
						(errors2) =>
							createValidation<E | EE, U>({
								invalid: [...errors1, ...errors2],
							}),
						() =>
							createValidation<E | EE, U>({
								invalid: errors1 as readonly (E | EE)[],
							}),
					),
				(fn) =>
					arg.match(
						(errors2) =>
							createValidation<E | EE, U>({
								invalid: errors2 as readonly (E | EE)[],
							}),
						(v) => createValidation<E | EE, U>({ valid: fn(v) }),
					),
			);
		},

		match: <U>(
			onInvalid: (errors: readonly E[]) => U,
			onValid: (value: T) => U,
		) => (isValid(value) ? onValid(value.valid) : onInvalid(value.invalid)),

		getOrElse: (fallback) =>
			validation.match(
				(errors) => fallback(errors),
				(v) => v,
			),

		tap: (sideEffect) => {
			validation.match(() => {}, sideEffect);
			return validation;
		},
	};

	return validation;
}

function isValid<E, T>(value: ValidationV<E, T>): value is Valid<T> {
	return typeof value === "object" && "valid" in value;
}

function forceCast<E, T, EE, TT>(v: Validation<E, T>): Validation<EE, TT> {
	return v as unknown as Validation<EE, TT>;
}
