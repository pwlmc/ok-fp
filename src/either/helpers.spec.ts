import { describe, expect, it } from "vitest";
import { left, right } from "./constructors.js";
import { sequence } from "./helpers.js";

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
});
