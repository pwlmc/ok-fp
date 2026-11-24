import { describe, expect, it, vi } from "vitest";
import { invalid, valid } from "./constructors.js";
import { sequence, traverse } from "./helpers.js";

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

	describe("traverse", () => {
		it("should map and collect all valid values", () => {
			const result = traverse([1, 2, 3], (value) => valid(value * 2));

			expect(result.toResult()).toEqual({ ok: true, value: [2, 4, 6] });
		});

		it("should map every value and accumulate all errors in input order", () => {
			const mapper = vi.fn((value: number) =>
				value % 2 === 0
					? valid<number, string>(value)
					: invalid<string, number>(`invalid ${value}`),
			);

			expect(traverse([1, 2, 3], mapper).toResult()).toEqual({
				ok: false,
				errors: ["invalid 1", "invalid 3"],
			});
			expect(mapper).toHaveBeenCalledTimes(3);
		});

		it("should return valid with an empty array for empty input", () => {
			expect(traverse([], () => invalid("error")).toResult()).toEqual({
				ok: true,
				value: [],
			});
		});
	});
});
