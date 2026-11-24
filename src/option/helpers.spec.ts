import { describe, expect, it, vi } from "vitest";
import { none, some } from "./constructors.js";
import { sequence, traverse } from "./helpers.js";

describe("option helpers", () => {
	describe("sequence", () => {
		it("should return an option with the array of values when no none", () => {
			const res = sequence([some(1), some(2), some(3)]);
			expect(res.toNullable()).toEqual([1, 2, 3]);
		});

		it("should return none if one array items is none", () => {
			const res = sequence([some(1), none<number>(), some(3)]);
			expect(res.toNullable()).toBe(null);
		});
	});

	describe("traverse", () => {
		it("should map and collect all some values", () => {
			const result = traverse([1, 2, 3], (value) => some(value * 2));

			expect(result.toNullable()).toEqual([2, 4, 6]);
		});

		it("should preserve falsey some values", () => {
			const result = traverse([1], () => some(0));

			expect(result.toNullable()).toEqual([0]);
		});

		it("should stop mapping after the first none", () => {
			const mapper = vi.fn((value: number) =>
				value === 2 ? none<number>() : some(value),
			);

			expect(traverse([1, 2, 3], mapper).toNullable()).toBeNull();
			expect(mapper).toHaveBeenCalledTimes(2);
		});

		it("should return some with an empty array for empty input", () => {
			expect(traverse([], () => none()).toNullable()).toEqual([]);
		});
	});
});
