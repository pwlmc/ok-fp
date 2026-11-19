import { describe, expect, it } from "vitest";
import { invalid, valid } from "./constructors.js";
import { sequence } from "./helpers.js";

describe("validation helpers", () => {
	describe("sequence", () => {
		it("should return valid with array of values when all are valid", () => {
			const result = sequence([valid(1), valid(2), valid(3)]);
			expect(result.toResult()).toEqual({ ok: true, value: [1, 2, 3] });
		});

		it("should accumulate all errors when some are invalid", () => {
			const result = sequence([
				valid<number, string>(1),
				invalid<string, number>("e1"),
				invalid<string, number>("e2"),
			]);
			expect(result.toResult()).toEqual({ ok: false, errors: ["e1", "e2"] });
		});

		it("should return valid with empty array for empty input", () => {
			const result = sequence([]);
			expect(result.toResult()).toEqual({ ok: true, value: [] });
		});
	});
});
