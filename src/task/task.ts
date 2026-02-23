import type { TaskValue } from "./model.js";

export type Task<T> = {
	/**
	 * Transforms the value produced by the Task using a mapping function.
	 *
	 * @typeParam U - The type of the transformed value
	 * @param mapper - Function to transform the resolved value
	 * @returns A new Task that resolves with the transformed value
	 *
	 * @example
	 * ```typescript
	 * task(5).map(x => x * 2).run() // Promise<10>
	 * ```
	 */
	map: <U>(mapper: (value: T) => U) => Task<U>;

	/**
	 * Applies a function wrapped in a Task to a value wrapped in a Task.
	 * Both Tasks are run concurrently.
	 *
	 * @typeParam A - The type of the argument value
	 * @typeParam U - The type of the function's return value
	 * @param arg - Task containing the argument to apply the function to
	 * @returns Task containing the function result
	 *
	 * @example
	 * ```typescript
	 * const add = (x: number) => (y: number) => x + y;
	 * task(add(5)).ap(task(3)).run() // Promise<8>
	 * ```
	 */
	ap: <A, U>(this: Task<(a: A) => U>, arg: Task<A>) => Task<U>;

	/**
	 * Combines this Task with another Task into a tuple.
	 * Both Tasks are run concurrently.
	 *
	 * @typeParam A - The type of the value in the other Task
	 * @param taskA - The Task to combine with this one
	 * @returns Task containing a tuple of both values
	 *
	 * @example
	 * ```typescript
	 * task("Alice").zip(task(30)).run() // Promise<["Alice", 30]>
	 * ```
	 */
	zip: <A>(taskA: Task<A>) => Task<readonly [T, A]>;

	/**
	 * Flattens a nested Task structure by removing one level of nesting.
	 *
	 * @returns The inner Task result
	 *
	 * @example
	 * ```typescript
	 * task(task(42)).flatten().run() // Promise<42>
	 * ```
	 */
	flatten: <U>(this: Task<Task<U>>) => Task<U>;

	/**
	 * Chains Task-returning operations together (monadic bind).
	 *
	 * @typeParam U - The type of the value in the returned Task
	 * @param mapper - Function that takes a resolved value and returns a Task
	 * @returns The Task returned by mapper
	 *
	 * @example
	 * ```typescript
	 * task(10).flatMap(x => task(x * 2)).run() // Promise<20>
	 * ```
	 */
	flatMap: <U>(mapper: (value: T) => Task<U>) => Task<U>;

	/**
	 * Performs a side effect with the resolved value, returning the original Task unchanged.
	 *
	 * @param sideEffect - Function to execute with the resolved value (return value is ignored)
	 * @returns The same Task instance unchanged
	 *
	 * @example
	 * ```typescript
	 * task(42)
	 *   .tap(value => console.log(`Got value: ${value}`))
	 *   .run() // Logs: "Got value: 42", resolves to 42
	 * ```
	 */
	tap: (sideEffect: (value: T) => unknown) => Task<T>;

	/**
	 * Executes the Task and returns the resulting Promise.
	 *
	 * @returns A Promise that resolves with the Task's value
	 *
	 * @example
	 * ```typescript
	 * const result = await task(42).run(); // 42
	 * ```
	 */
	run: () => Promise<T>;
};

export function createTask<T>(thunk: TaskValue<T>): Task<T> {
	const t: Task<T> = {
		map: <U>(mapper: (value: T) => U): Task<U> =>
			createTask(() => thunk().then(mapper)),

		ap: function <A, U>(this: Task<(a: A) => U>, arg: Task<A>): Task<U> {
			return createTask(() =>
				Promise.all([this.run(), arg.run()]).then(([fn, a]) => fn(a)),
			);
		},

		zip: <A>(taskA: Task<A>): Task<readonly [T, A]> =>
			t.map((value) => (a: A) => [value, a] as const).ap(taskA),

		flatten: function <U>(this: Task<Task<U>>): Task<U> {
			// biome-ignore lint/complexity/noFlatMapIdentity: flatMap here is the custom Task method, not Array.flatMap
			return this.flatMap((value) => value);
		},

		flatMap: <U>(mapper: (value: T) => Task<U>): Task<U> =>
			createTask(() => thunk().then((value) => mapper(value).run())),

		tap: (sideEffect): Task<T> =>
			createTask(() =>
				thunk().then((value) => {
					sideEffect(value);
					return value;
				}),
			),

		run: () => thunk(),
	};

	return t;
}
