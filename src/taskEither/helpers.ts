import { left, right } from "../either/constructors.js";
import { createTaskEither, type TaskEither } from "./taskEither.js";

/**
 * Runs all TaskEithers concurrently and collects their Right values into an array.
 * Short-circuits on the first Left, returning it immediately.
 * Equivalent to `Promise.all` for TaskEithers.
 *
 * @param taskEithers - Array of TaskEithers to run concurrently
 * @returns TaskEither that resolves with an array of all Right values, or the first Left
 *
 * @example
 * ```typescript
 * await allTaskEithers([taskRight(1), taskRight(2), taskRight(3)]).run() // Right([1, 2, 3])
 * await allTaskEithers([taskRight(1), taskLeft("err"), taskRight(3)]).run() // Left("err")
 * ```
 */
export function allTaskEithers<E, T>(
	taskEithers: TaskEither<E, T>[],
): TaskEither<E, T[]> {
	return createTaskEither(() =>
		Promise.all(taskEithers.map((te) => te.run())).then((eithers) => {
			const out: T[] = [];
			for (const either of eithers) {
				const result = either.toResult();
				if (!result.ok) {
					return left<E, T[]>(result.error);
				}
				out.push(result.value);
			}
			return right<T[], E>(out);
		}),
	);
}
