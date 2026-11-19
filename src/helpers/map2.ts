import type { Either } from "../either/either.js";
import type { Option } from "../option/option.js";
import type { Task } from "../task/task.js";
import type { TaskEither } from "../taskEither/taskEither.js";
import type { Validation } from "../validation/validation.js";

type Map2Applicative = {
	map: (mapper: (value: unknown) => (value: unknown) => unknown) => {
		ap: (value: unknown) => unknown;
	};
};

type Map2Mapper = (first: unknown, second: unknown) => unknown;

/**
 * Combines two Options using a mapping function.
 * Only applies the mapper if both Options contain values.
 *
 * @param first - First Option to combine
 * @param second - Second Option to combine
 * @param mapper - Function that combines both values
 * @returns Option containing the combined result, or None if either Option is None
 *
 * @example
 * ```typescript
 * map2(some("John"), some("Doe"), (first, last) => `Hi ${first} ${last}!`)
 * // Some("John Doe")
 * ```
 */
export function map2<A, B, C>(
	first: Option<A>,
	second: Option<B>,
	mapper: (first: A, second: B) => C,
): Option<C>;

/**
 * Combines two Eithers using a mapping function.
 * Returns the mapped result if both Eithers are Right, otherwise the first Left.
 *
 * @param first - First Either to combine
 * @param second - Second Either to combine
 * @param mapper - Function to combine both Right values
 * @returns Either containing the combined result, or the first Left
 *
 * @example
 * ```typescript
 * map2(right("John"), right("Doe"), (first, last) => `${first} ${last}`)
 * // Right("John Doe")
 * ```
 */
export function map2<EA, A, EB, B, C>(
	first: Either<EA, A>,
	second: Either<EB, B>,
	mapper: (first: A, second: B) => C,
): Either<EA | EB, C>;

/**
 * Combines two Validations using a mapping function.
 * If both are Valid, applies the mapper. If any are Invalid, accumulates all errors.
 *
 * @param first - First Validation to combine
 * @param second - Second Validation to combine
 * @param mapper - Function to combine both valid values
 * @returns Validation containing the combined result, or all accumulated errors
 *
 * @example
 * ```typescript
 * map2(valid("John"), valid("Doe"), (first, last) => `${first} ${last}`)
 * // Valid("John Doe")
 * ```
 */
export function map2<EA, A, EB, B, C>(
	first: Validation<EA, A>,
	second: Validation<EB, B>,
	mapper: (first: A, second: B) => C,
): Validation<EA | EB, C>;

/**
 * Combines two Tasks using a mapping function.
 * Runs both Tasks and maps their resolved values.
 *
 * @param first - First Task to combine
 * @param second - Second Task to combine
 * @param mapper - Function that combines both resolved values
 * @returns Task containing the combined result
 */
export function map2<A, B, C>(
	first: Task<A>,
	second: Task<B>,
	mapper: (first: A, second: B) => C,
): Task<C>;

/**
 * Combines two TaskEithers using a mapping function.
 * Returns the mapped result if both resolve to Right, otherwise the first Left.
 *
 * @param first - First TaskEither to combine
 * @param second - Second TaskEither to combine
 * @param mapper - Function to combine both Right values
 * @returns TaskEither containing the combined result, or the first Left
 */
export function map2<EA, A, EB, B, C>(
	first: TaskEither<EA, A>,
	second: TaskEither<EB, B>,
	mapper: (first: A, second: B) => C,
): TaskEither<EA | EB, C>;

export function map2(
	first: unknown,
	second: unknown,
	mapper: unknown,
): unknown {
	const applicative = first as Map2Applicative;
	const combine = mapper as Map2Mapper;

	return applicative
		.map((firstValue) => (secondValue) => combine(firstValue, secondValue))
		.ap(second);
}
