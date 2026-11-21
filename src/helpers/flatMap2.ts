import type { Either } from "../either/either.js";
import type { Option } from "../option/option.js";
import type { Task } from "../task/task.js";
import type { TaskEither } from "../taskEither/taskEither.js";
import { map2 } from "./map2.js";

type FlatMap2Mapper = (first: unknown, second: unknown) => unknown;

type Flattenable = {
	flatten: () => unknown;
};

const combine = map2 as unknown as (
	first: unknown,
	second: unknown,
	mapper: FlatMap2Mapper,
) => Flattenable;

/**
 * Combines two Options with a mapper that returns an Option, then flattens the result.
 */
export function flatMap2<A, B, C>(
	first: Option<A>,
	second: Option<B>,
	mapper: (first: A, second: B) => Option<C>,
): Option<C>;

/**
 * Combines two Eithers with a mapper that returns an Either, then flattens the result.
 */
export function flatMap2<EA, A, EB, B, EC, C>(
	first: Either<EA, A>,
	second: Either<EB, B>,
	mapper: (first: A, second: B) => Either<EC, C>,
): Either<EA | EB | EC, C>;

/**
 * Runs two Tasks concurrently, maps their values to a Task, then flattens the result.
 */
export function flatMap2<A, B, C>(
	first: Task<A>,
	second: Task<B>,
	mapper: (first: A, second: B) => Task<C>,
): Task<C>;

/**
 * Runs two TaskEithers concurrently, maps their Right values to a TaskEither, then flattens the result.
 */
export function flatMap2<EA, A, EB, B, EC, C>(
	first: TaskEither<EA, A>,
	second: TaskEither<EB, B>,
	mapper: (first: A, second: B) => TaskEither<EC, C>,
): TaskEither<EA | EB | EC, C>;

export function flatMap2(
	first: unknown,
	second: unknown,
	mapper: FlatMap2Mapper,
): unknown {
	return combine(first, second, mapper).flatten();
}
