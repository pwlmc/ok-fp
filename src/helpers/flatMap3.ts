import type { Either } from "../either/either.js";
import type { Option } from "../option/option.js";
import type { Task } from "../task/task.js";
import type { TaskEither } from "../taskEither/taskEither.js";
import { map3 } from "./map3.js";

type FlatMap3Mapper = (
	first: unknown,
	second: unknown,
	third: unknown,
) => unknown;

type Flattenable = {
	flatten: () => unknown;
};

const combine = map3 as unknown as (
	first: unknown,
	second: unknown,
	third: unknown,
	mapper: FlatMap3Mapper,
) => Flattenable;

/**
 * Combines three Options with a mapper that returns an Option, then flattens the result.
 */
export function flatMap3<A, B, C, D>(
	first: Option<A>,
	second: Option<B>,
	third: Option<C>,
	mapper: (first: A, second: B, third: C) => Option<D>,
): Option<D>;

/**
 * Combines three Eithers with a mapper that returns an Either, then flattens the result.
 */
export function flatMap3<EA, A, EB, B, EC, C, ED, D>(
	first: Either<EA, A>,
	second: Either<EB, B>,
	third: Either<EC, C>,
	mapper: (first: A, second: B, third: C) => Either<ED, D>,
): Either<EA | EB | EC | ED, D>;

/**
 * Runs three Tasks concurrently, maps their values to a Task, then flattens the result.
 */
export function flatMap3<A, B, C, D>(
	first: Task<A>,
	second: Task<B>,
	third: Task<C>,
	mapper: (first: A, second: B, third: C) => Task<D>,
): Task<D>;

/**
 * Runs three TaskEithers concurrently, maps their Right values to a TaskEither, then flattens the result.
 */
export function flatMap3<EA, A, EB, B, EC, C, ED, D>(
	first: TaskEither<EA, A>,
	second: TaskEither<EB, B>,
	third: TaskEither<EC, C>,
	mapper: (first: A, second: B, third: C) => TaskEither<ED, D>,
): TaskEither<EA | EB | EC | ED, D>;

export function flatMap3(
	first: unknown,
	second: unknown,
	third: unknown,
	mapper: FlatMap3Mapper,
): unknown {
	return combine(first, second, third, mapper).flatten();
}
