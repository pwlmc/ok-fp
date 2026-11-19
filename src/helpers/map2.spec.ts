import { describe, expect, it, vi } from "vitest";
import { left, right } from "../either/constructors.js";
import { none, some } from "../option/constructors.js";
import { invalid, valid } from "../validation/constructors.js";
import { map2 } from "./map2.js";

describe("map2", () => {
	describe("Option", () => {
		it("should map some values", () => {
			const a = some(2);
			const b = some(3);
			const c = map2(a, b, (a, b) => a * b);
			expect(c.toNullable()).toBe(6);
		});

		it("should not call the mapper and return none when one of the values is none", () => {
			const mapper = vi.fn();
			for (const opts of [
				[none<number>(), some(3)],
				[some(2), none<number>()],
			]) {
				const [a, b] = opts;
				const c = map2(a!, b!, mapper);
				expect(c.toNullable()).toBe(null);
				expect(mapper).not.toBeCalled();
			}
		});
	});

	describe("Either", () => {
		it("should map right values", () => {
			const a = right(2);
			const b = right(3);
			const c = map2(a, b, (a, b) => a * b);
			expect(c.toResult()).toEqual(right(6).toResult());
		});

		it("should not call the mapper and return left when one of the values is left", () => {
			const mapper = vi.fn();
			const error = new Error("test error");
			for (const eithers of [
				[left<Error, number>(error), right<number, Error>(3)],
				[right<number, Error>(2), left<Error, number>(error)],
			]) {
				const [a, b] = eithers;
				const c = map2(a!, b!, mapper);
				expect(c.toResult()).toEqual(left(error).toResult());
				expect(mapper).not.toBeCalled();
			}
		});
	});

	describe("Validation", () => {
		it("should map valid values", () => {
			const result = map2(valid(2), valid(3), (a, b) => a * b);
			expect(result.toResult()).toEqual({ ok: true, value: 6 });
		});

		it("should accumulate errors when both are invalid", () => {
			const mapper = vi.fn();
			const result = map2(
				invalid<string, number>("e1"),
				invalid<string, number>("e2"),
				mapper,
			);
			expect(result.toResult()).toEqual({ ok: false, errors: ["e1", "e2"] });
			expect(mapper).not.toBeCalled();
		});

		it("should return invalid when first is invalid", () => {
			const mapper = vi.fn();
			const result = map2(
				invalid<string, number>("e1"),
				valid<number, string>(3),
				mapper,
			);
			expect(result.toResult()).toEqual({ ok: false, errors: ["e1"] });
			expect(mapper).not.toBeCalled();
		});

		it("should return invalid when second is invalid", () => {
			const mapper = vi.fn();
			const result = map2(
				valid<number, string>(2),
				invalid<string, number>("e2"),
				mapper,
			);
			expect(result.toResult()).toEqual({ ok: false, errors: ["e2"] });
			expect(mapper).not.toBeCalled();
		});
	});
});
