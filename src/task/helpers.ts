import { createTask, type Task } from "./task.js";

/**
 * Runs all Tasks concurrently and collects their results into an array.
 * Equivalent to `Promise.all` for Tasks.
 *
 * @param tasks - Array of Tasks to run concurrently
 * @returns Task that resolves with an array of all results
 *
 * @example
 * ```typescript
 * await all([task(1), task(2), task(3)]).run() // [1, 2, 3]
 * ```
 */
export function all<T>(tasks: Task<T>[]): Task<T[]> {
	return createTask(() => Promise.all(tasks.map((t) => t.run())));
}

/**
 * Maps each item in an array to a Task and runs all Tasks concurrently.
 *
 * @param items - Array of items to map
 * @param mapper - Function that converts each item to a Task
 * @returns Task that resolves with an array of all mapped results
 *
 * @example
 * ```typescript
 * await traverse([1, 2, 3], x => task(x * 2)).run() // [2, 4, 6]
 * ```
 */
export function traverse<T, U>(
	items: T[],
	mapper: (item: T) => Task<U>,
): Task<U[]> {
	return all(items.map(mapper));
}

/**
 * Converts an array of Tasks into a Task of array, running all Tasks concurrently.
 * Equivalent to `all`.
 *
 * @param tasks - Array of Tasks to sequence
 * @returns Task that resolves with an array of all results
 *
 * @example
 * ```typescript
 * await sequence([task(1), task(2), task(3)]).run() // [1, 2, 3]
 * ```
 */
export function sequence<T>(tasks: Task<T>[]): Task<T[]> {
	return all(tasks);
}
