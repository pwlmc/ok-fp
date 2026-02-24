import { createTask, type Task } from "./task.js";

/**
 * Creates a Task that immediately resolves with the provided value.
 *
 * @typeParam T - The type of the value
 * @param value - The value to wrap in a Task
 * @returns Task that resolves with the given value
 *
 * @example
 * ```typescript
 * const t = task(42); // Task<number>
 * await t.run(); // 42
 * ```
 */
export function task<T>(value: T): Task<T> {
	return createTask(() => Promise.resolve(value));
}

/**
 * Creates a Task from a lazy Promise-returning thunk.
 * The thunk is not called until `run()` is invoked.
 *
 * @typeParam T - The type of the resolved value
 * @param thunk - A function that returns a Promise
 * @returns Task wrapping the lazy Promise
 *
 * @example
 * ```typescript
 * const fetchUser = fromPromise(() => fetch("/api/user").then(r => r.json()));
 * await fetchUser.run(); // fetches the user
 * ```
 */
export function fromPromise<T>(thunk: () => Promise<T>): Task<T> {
	return createTask(thunk);
}
