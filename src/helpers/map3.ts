import type { Either } from "../either/either.js";
import type { Option } from "../option/option.js";
import type { Task } from "../task/task.js";
import type { TaskEither } from "../taskEither/taskEither.js";
import type { Validation } from "../validation/validation.js";

/**
 * Combines three Options using a mapping function.
 * Only applies the mapper if all three Options contain values.
 *
 * @param first - First Option to combine
 * @param second - Second Option to combine
 * @param third - Third Option to combine
 * @param mapper - Function that combines all three values
 * @returns Option containing the combined result, or None if any Option is None
 *
 * @example
 * ```typescript
 * map3(some(15), some(6), some(2023), (day, month, year) => `${day}/${month}/${year}`)
 * // Some("15/6/2023")
 * ```
 */
export function map3<A, B, C, D>(
	first: Option<A>,
	second: Option<B>,
	third: Option<C>,
	mapper: (first: A, second: B, third: C) => D,
): Option<D>;

/**
 * Combines three Eithers using a mapping function.
 * Returns the mapped result if all Eithers are Right, otherwise the first Left.
 *
 * @param first - First Either to combine
 * @param second - Second Either to combine
 * @param third - Third Either to combine
 * @param mapper - Function to combine all three Right values
 * @returns Either containing the combined result, or the first Left
 *
 * @example
 * ```typescript
 * map3(right(1), right(2), right(3), (a, b, c) => a + b + c)
 * // Right(6)
 * ```
 */
export function map3<EA, A, EB, B, EC, C, D>(
	first: Either<EA, A>,
	second: Either<EB, B>,
	third: Either<EC, C>,
	mapper: (first: A, second: B, third: C) => D,
): Either<EA | EB | EC, D>;

/**
 * Combines three Validations using a mapping function.
 * If all are Valid, applies the mapper. If any are Invalid, accumulates all errors.
 *
 * @param first - First Validation to combine
 * @param second - Second Validation to combine
 * @param third - Third Validation to combine
 * @param mapper - Function to combine all three valid values
 * @returns Validation containing the combined result, or all accumulated errors
 *
 * @example
 * ```typescript
 * map3(valid(1), valid(2), valid(3), (a, b, c) => a + b + c)
 * // Valid(6)
 * ```
 */
export function map3<EA, A, EB, B, EC, C, D>(
	first: Validation<EA, A>,
	second: Validation<EB, B>,
	third: Validation<EC, C>,
	mapper: (first: A, second: B, third: C) => D,
): Validation<EA | EB | EC, D>;

/**
 * Combines three Tasks using a mapping function.
 * Runs all three Tasks and maps their resolved values.
 *
 * @param first - First Task to combine
 * @param second - Second Task to combine
 * @param third - Third Task to combine
 * @param mapper - Function that combines all three resolved values
 * @returns Task containing the combined result
 */
export function map3<A, B, C, D>(
	first: Task<A>,
	second: Task<B>,
	third: Task<C>,
	mapper: (first: A, second: B, third: C) => D,
): Task<D>;

/**
 * Combines three TaskEithers using a mapping function.
 * Returns the mapped result if all resolve to Right, otherwise the first Left.
 *
 * @param first - First TaskEither to combine
 * @param second - Second TaskEither to combine
 * @param third - Third TaskEither to combine
 * @param mapper - Function to combine all three Right values
 * @returns TaskEither containing the combined result, or the first Left
 */
export function map3<EA, A, EB, B, EC, C, D>(
	first: TaskEither<EA, A>,
	second: TaskEither<EB, B>,
	third: TaskEither<EC, C>,
	mapper: (first: A, second: B, third: C) => D,
): TaskEither<EA | EB | EC, D>;

export function map3(
	first: unknown,
	second: unknown,
	third: unknown,
	mapper: unknown,
): unknown {
	const applicative = first as {
		map: (
			mapper: (
				value: unknown,
			) => (value: unknown) => (value: unknown) => unknown,
		) => {
			ap: (value: unknown) => {
				ap: (value: unknown) => unknown;
			};
		};
	};
	const combine = mapper as (
		first: unknown,
		second: unknown,
		third: unknown,
	) => unknown;

	return applicative
		.map(
			(firstValue) => (secondValue) => (thirdValue) =>
				combine(firstValue, secondValue, thirdValue),
		)
		.ap(second)
		.ap(third);
}
