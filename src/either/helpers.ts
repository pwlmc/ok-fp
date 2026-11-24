import { left, right } from "./constructors.js";
import type { Either } from "./either.js";

/**
 * Converts an array of Eithers into an Either of array.
 * Returns Right with all values if all Eithers are Right, otherwise the first Left.
 *
 * @param eithers - Array of Eithers to sequence
 * @returns Either containing array of all values, or the first Left
 *
 * @example
 * ```typescript
 * sequence([right(1), right(2), right(3)]) // Right([1, 2, 3])
 * sequence([right(1), left("error")])      // Left("error")
 * ```
 */
export function sequence<E, T>(eithers: Either<E, T>[]): Either<E, T[]> {
	const out: T[] = [];

	for (const either of eithers) {
		const result = either.toResult();
		if (!result.ok) {
			return left(result.error);
		}
		out.push(result.value);
	}

	return right(out);
}

/**
 * Maps values to Eithers and collects their Right values.
 * Stops at the first Left without mapping the remaining values.
 */
export function traverse<E, A, B>(
	values: readonly A[],
	mapper: (value: A) => Either<E, B>,
): Either<E, B[]> {
	const out: B[] = [];

	for (const value of values) {
		const result = mapper(value).toResult();
		if (!result.ok) {
			return left(result.error);
		}
		out.push(result.value);
	}

	return right(out);
}
