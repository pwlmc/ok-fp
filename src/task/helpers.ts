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
