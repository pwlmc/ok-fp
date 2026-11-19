import { none, some } from "./constructors.js";
import type { Option } from "./option.js";

/**
 * Converts an array of Options into an Option of array.
 * If all Options in the array contain values, returns Some containing an array of all values.
 * If any Option in the array is None, returns None.
 *
 * @param opts - Array of Options to sequence
 * @returns Some containing array of all values if all Options are Some, otherwise None
 *
 * @example
 * ```typescript
 * sequence([some(1), some(2), some(3)]) // Some([1, 2, 3])
 * sequence([some(1), none(), some(3)]) // None
 * ```
 */
export function sequence<T>(opts: Option<T>[]): Option<T[]> {
	const out: T[] = [];

	for (const opt of opts) {
		const [value] = opt.toArray();
		if (!value) {
			return none<T[]>();
		}
		out.push(value);
	}

	return some(out);
}
