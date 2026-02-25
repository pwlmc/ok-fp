import { left, right } from "../either/constructors.js";
import type { Either } from "../either/either.js";
import { createTask, type Task } from "../task/task.js";
import type { TaskEitherValue } from "./model.js";

export type TaskEither<E, T> = {
	/**
	 * Transforms the Right value using a mapping function.
	 * If this TaskEither resolves to Left, the mapper is not called.
	 *
	 * @typeParam U - The type of the transformed value
	 * @param mapper - Function to transform the Right value
	 * @returns New TaskEither with the transformed Right value, or the same Left if error
	 *
	 * @example
	 * ```typescript
	 * taskEither(5).map(x => x * 2).run()         // Promise<Right(10)>
	 * taskLeft("error").map(x => x * 2).run()     // Promise<Left("error")>
	 * ```
	 */
	map: <U>(mapper: (right: T) => U) => TaskEither<E, U>;

	/**
	 * Transforms the Left value using a mapping function.
	 * If this TaskEither resolves to Right, the mapper is not called.
	 *
	 * @typeParam F - The type of the transformed error
	 * @param mapper - Function to transform the Left value
	 * @returns New TaskEither with the transformed Left value, or the same Right if success
	 *
	 * @example
	 * ```typescript
	 * taskLeft("error").mapLeft(e => `mapped: ${e}`).run()  // Promise<Left("mapped: error")>
	 * taskEither(42).mapLeft(e => `mapped: ${e}`).run()     // Promise<Right(42)>
	 * ```
	 */
	mapLeft: <F>(mapper: (left: E) => F) => TaskEither<F, T>;

	/**
	 * Applies a function wrapped in a TaskEither to a value wrapped in a TaskEither.
	 * Both TaskEithers are run concurrently.
	 *
	 * @typeParam EE - Left type of the argument TaskEither
	 * @typeParam A - The type of the argument value
	 * @typeParam U - The type of the function's return value
	 * @param arg - TaskEither containing the argument to apply the function to
	 * @returns TaskEither containing the function result, or the first Left if any is Left
	 *
	 * @example
	 * ```typescript
	 * const add = (x: number) => (y: number) => x + y;
	 * taskEither(add(5)).ap(taskEither(3)).run()    // Promise<Right(8)>
	 * taskEither(add(5)).ap(taskLeft("err")).run()  // Promise<Left("err")>
	 * ```
	 */
	ap: <EE, A, U>(
		this: TaskEither<E, (a: A) => U>,
		arg: TaskEither<EE, A>,
	) => TaskEither<E | EE, U>;

	/**
	 * Combines this TaskEither with another TaskEither into a tuple.
	 * Both TaskEithers are run concurrently.
	 *
	 * @typeParam EE - Left type of the other TaskEither
	 * @typeParam A - Right type of the other TaskEither
	 * @param other - The TaskEither to combine with this one
	 * @returns TaskEither containing a tuple of both Right values, or the first Left
	 *
	 * @example
	 * ```typescript
	 * taskEither("Alice").zip(taskEither(30)).run()       // Promise<Right(["Alice", 30])>
	 * taskEither("Alice").zip(taskLeft("No age")).run()   // Promise<Left("No age")>
	 * ```
	 */
	zip: <EE, A>(other: TaskEither<EE, A>) => TaskEither<E | EE, readonly [T, A]>;

	/**
	 * Flattens a nested TaskEither structure by removing one level of nesting.
	 *
	 * @typeParam EE - Left type of the inner TaskEither
	 * @typeParam U - Right type of the inner TaskEither
	 * @returns The inner TaskEither if this TaskEither is Right, otherwise this Left unchanged
	 *
	 * @example
	 * ```typescript
	 * taskEither(taskEither(42)).flatten().run()            // Promise<Right(42)>
	 * taskEither(taskLeft("inner error")).flatten().run()   // Promise<Left("inner error")>
	 * ```
	 */
	flatten: <EE, U>(
		this: TaskEither<E, TaskEither<EE, U>>,
	) => TaskEither<E | EE, U>;

	/**
	 * Chains TaskEither-returning operations together (monadic bind).
	 * If this TaskEither resolves to Left, the mapper is not called.
	 *
	 * @typeParam EE - The error type of the TaskEither returned by the mapper
	 * @typeParam U - The success type of the TaskEither returned by the mapper
	 * @param mapper - Function that takes a Right value and returns a TaskEither
	 * @returns The TaskEither returned by mapper if this is Right, otherwise this Left unchanged
	 *
	 * @example
	 * ```typescript
	 * taskEither(10).flatMap(x => taskEither(x * 2)).run()  // Promise<Right(20)>
	 * taskLeft("error").flatMap(x => taskEither(x)).run()   // Promise<Left("error")>
	 * ```
	 */
	flatMap: <EE, U>(
		mapper: (right: T) => TaskEither<EE, U>,
	) => TaskEither<E | EE, U>;

	/**
	 * Performs a side effect with the Right value, returning the original TaskEither unchanged.
	 * If this TaskEither resolves to Left, the side effect is not executed.
	 *
	 * @param sideEffect - Function to execute with the Right value (return value is ignored)
	 * @returns The same TaskEither instance unchanged
	 *
	 * @example
	 * ```typescript
	 * taskEither(42).tap(v => console.log(v)).run()    // Logs: 42, resolves to Right(42)
	 * taskLeft("error").tap(v => console.log(v)).run() // No log, resolves to Left("error")
	 * ```
	 */
	tap: (sideEffect: (right: T) => unknown) => TaskEither<E, T>;

	/**
	 * Performs a side effect with the Left value, returning the original TaskEither unchanged.
	 * If this TaskEither resolves to Right, the side effect is not executed.
	 *
	 * @param sideEffect - Function to execute with the Left value (return value is ignored)
	 * @returns The same TaskEither instance unchanged
	 *
	 * @example
	 * ```typescript
	 * taskLeft("error").tapLeft(e => console.log(e)).run()  // Logs: "error", resolves to Left("error")
	 * taskEither(42).tapLeft(e => console.log(e)).run()     // No log, resolves to Right(42)
	 * ```
	 */
	tapLeft: (sideEffect: (left: E) => unknown) => TaskEither<E, T>;

	/**
	 * Pattern matches on the resolved Either, executing different functions based on its state.
	 * Returns the result wrapped in a Task.
	 *
	 * @typeParam U - The return type of both matcher functions
	 * @param onLeft - Function to execute if resolved Either is Left
	 * @param onRight - Function to execute if resolved Either is Right
	 * @returns Task that resolves with the result of the executed function
	 *
	 * @example
	 * ```typescript
	 * await taskEither(5).match(() => 0, x => x * 2).run()      // 10
	 * await taskLeft("error").match(() => 0, x => x * 2).run()  // 0
	 * ```
	 */
	match: <U>(onLeft: (left: E) => U, onRight: (right: T) => U) => Task<U>;

	/**
	 * Extracts the Right value, or returns a fallback value if Left.
	 * Returns the result wrapped in a Task.
	 *
	 * @param fallback - Function that takes the Left value and returns a default value of type T
	 * @returns Task that resolves with the Right value or the fallback
	 *
	 * @example
	 * ```typescript
	 * await taskEither(42).getOrElse(() => 0).run()          // 42
	 * await taskLeft("error").getOrElse(() => 0).run()       // 0
	 * ```
	 */
	getOrElse: (fallback: (left: E) => T) => Task<T>;

	/**
	 * Returns this TaskEither if it resolves to Right, otherwise returns the result of the fallback function.
	 *
	 * @typeParam EE - The type of the error in the fallback TaskEither
	 * @param fallback - Function that takes the Left value and returns an alternative TaskEither
	 * @returns This TaskEither if Right, otherwise the TaskEither returned by the fallback function
	 *
	 * @example
	 * ```typescript
	 * taskEither(42).orElse(() => taskEither(0)).run()          // Promise<Right(42)>
	 * taskLeft("error").orElse(() => taskEither(0)).run()       // Promise<Right(0)>
	 * ```
	 */
	orElse: <EE>(
		fallback: (left: E) => TaskEither<EE, T>,
	) => TaskEither<E | EE, T>;

	/**
	 * Executes the TaskEither and returns the resulting Promise.
	 *
	 * @returns A Promise that resolves with the Either value
	 *
	 * @example
	 * ```typescript
	 * const result = await taskEither(42).run(); // Either<never, number>
	 * ```
	 */
	run: () => Promise<Either<E, T>>;
};

export function createTaskEither<E, T>(
	thunk: TaskEitherValue<E, T>,
): TaskEither<E, T> {
	const te: TaskEither<E, T> = {
		map: <U>(mapper: (right: T) => U): TaskEither<E, U> =>
			te.flatMap((rightVal) =>
				createTaskEither(() => Promise.resolve(right<U, E>(mapper(rightVal)))),
			),

		mapLeft: <F>(mapper: (leftVal: E) => F): TaskEither<F, T> =>
			createTaskEither<F, T>(() =>
				thunk().then((either) =>
					either.match(
						(leftVal) => left<F, T>(mapper(leftVal)),
						(rightVal) => right<T, F>(rightVal),
					),
				),
			),

		ap: function <EE, A, U>(
			this: TaskEither<E, (a: A) => U>,
			arg: TaskEither<EE, A>,
		): TaskEither<E | EE, U> {
			return createTaskEither<E | EE, U>(() =>
				Promise.all([this.run(), arg.run()]).then(
					([eitherFn, eitherA]) =>
						(eitherFn as Either<E, (a: A) => U>).ap(
							eitherA as Either<EE, A>,
						) as Either<E | EE, U>,
				),
			);
		},

		zip: <EE, A>(
			other: TaskEither<EE, A>,
		): TaskEither<E | EE, readonly [T, A]> =>
			te.map((value) => (a: A) => [value, a] as const).ap(other),

		flatten: function <EE, U>(
			this: TaskEither<E, TaskEither<EE, U>>,
		): TaskEither<E | EE, U> {
			// biome-ignore lint/complexity/noFlatMapIdentity: flatMap here is the custom TaskEither method, not Array.flatMap
			return this.flatMap((value) => value);
		},

		flatMap: <EE, U>(
			mapper: (rightVal: T) => TaskEither<EE, U>,
		): TaskEither<E | EE, U> =>
			createTaskEither<E | EE, U>(() =>
				thunk().then((either) =>
					either.match<Promise<Either<E | EE, U>>>(
						(leftVal) => Promise.resolve(left<E | EE, U>(leftVal)),
						(rightVal) => mapper(rightVal).run() as Promise<Either<E | EE, U>>,
					),
				),
			),

		tap: (sideEffect: (right: T) => unknown): TaskEither<E, T> =>
			createTaskEither(() =>
				thunk().then((either) => {
					either.tap(sideEffect);
					return either;
				}),
			),

		tapLeft: (sideEffect: (leftVal: E) => unknown): TaskEither<E, T> =>
			createTaskEither(() =>
				thunk().then((either) => {
					either.match(sideEffect, () => {});
					return either;
				}),
			),

		match: <U>(onLeft: (left: E) => U, onRight: (right: T) => U): Task<U> =>
			createTask(() => thunk().then((either) => either.match(onLeft, onRight))),

		getOrElse: (fallback: (left: E) => T): Task<T> =>
			createTask(() => thunk().then((either) => either.getOrElse(fallback))),

		orElse: <EE>(
			fallback: (leftVal: E) => TaskEither<EE, T>,
		): TaskEither<E | EE, T> =>
			createTaskEither<E | EE, T>(() =>
				thunk().then((either) =>
					either.match<Promise<Either<E | EE, T>>>(
						(leftVal) => fallback(leftVal).run() as Promise<Either<E | EE, T>>,
						() => Promise.resolve(either as unknown as Either<E | EE, T>),
					),
				),
			),

		run: () => thunk(),
	};

	return te;
}
