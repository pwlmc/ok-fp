import { createValidation, type Validation } from "./validation.js";

/**
 * Converts an array of Validations into a Validation of array.
 * Returns Valid with all values if all Validations are Valid, otherwise accumulates all errors.
 *
 * @param validations - Array of Validations to sequence
 * @returns Validation containing array of all values, or all accumulated errors
 *
 * @example
 * ```typescript
 * sequenceValidations([valid(1), valid(2), valid(3)]) // Valid([1, 2, 3])
 * sequenceValidations([valid(1), invalid("e1"), invalid("e2")]) // Invalid(["e1", "e2"])
 * ```
 */
export function sequenceValidations<E, T>(
	validations: readonly Validation<E, T>[],
): Validation<E, T[]> {
	const errors: E[] = [];
	const values: T[] = [];

	for (const v of validations) {
		v.match(
			(errs) => errors.push(...errs),
			(value) => values.push(value),
		);
	}

	return errors.length > 0
		? createValidation({ invalid: errors })
		: createValidation({ valid: values });
}
