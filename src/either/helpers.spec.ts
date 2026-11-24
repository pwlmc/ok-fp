import { describe, expect, it, vi } from "vitest";
import { left, right } from "./constructors.js";
import { sequence, traverse } from "./helpers.js";

describe("either helpers", () => {
	describe("sequence", () => {
		it("should return a right with the array of values when no left", () => {
			const res = sequence([right(1), right(2), right(3)]);
			expect(res.toResult()).toEqual(right([1, 2, 3]).toResult());
		});

		it("should return left if one array item is left", () => {
			const error = new Error("test error");
			const res = sequence([
				right<number, Error>(1),
				left<Error, number>(error),
				right<number, Error>(3),
			]);
			expect(res.toResult()).toEqual(left(error).toResult());
		});
	});

	describe("traverse", () => {
		it("should map and collect all right values", () => {
			const result = traverse([1, 2, 3], (value) => right(value * 2));

			expect(result.toResult()).toEqual(right([2, 4, 6]).toResult());
		});

		it("should stop mapping after the first left", () => {
			const mapper = vi.fn((value: number) =>
				value === 2
					? left<string, number>("error")
					: right<number, string>(value),
			);

			expect(traverse([1, 2, 3], mapper).toResult()).toEqual(
				left("error").toResult(),
			);
			expect(mapper).toHaveBeenCalledTimes(2);
		});

		it("should return right with an empty array for empty input", () => {
			expect(traverse([], () => left("error")).toResult()).toEqual(
				right([]).toResult(),
			);
		});
	});
});
