import { describe, expect, it, vi } from "vitest";
import { left, right } from "../either/constructors.js";
import { none, some } from "../option/constructors.js";
import { invalid, valid } from "../validation/constructors.js";
import { map3 } from "./map3.js";

describe("map3", () => {
	describe("Option", () => {
		it("should map some values", () => {
			const a = some(2);
			const b = some(3);
			const c = some(4);
			const d = map3(a, b, c, (a, b, c) => a * b * c);
			expect(d.toNullable()).toBe(24);
		});

		it("should not call the mapper and return none when one of the values is none", () => {
			const mapper = vi.fn();
			for (const opts of [
				[none<number>(), some(3), some(4)],
				[some(2), none<number>(), some(4)],
				[some(2), some(3), none<number>()],
			]) {
				const [a, b, c] = opts;
				const d = map3(a!, b!, c!, mapper);
				expect(d.toNullable()).toBe(null);
				expect(mapper).not.toBeCalled();
			}
		});
	});

	describe("Either", () => {
		it("should map right values", () => {
			const a = right(2);
			const b = right(3);
			const c = right(4);
			const d = map3(a, b, c, (a, b, c) => a * b * c);
			expect(d.toResult()).toEqual(right(24).toResult());
		});

		it("should not call the mapper and return left when one of the values is left", () => {
			const mapper = vi.fn();
			const error = new Error("test error");
			for (const eithers of [
				[
					left<Error, number>(error),
					right<number, Error>(3),
					right<number, Error>(4),
				],
				[
					right<number, Error>(2),
					left<Error, number>(error),
					right<number, Error>(4),
				],
				[
					right<number, Error>(2),
					right<number, Error>(3),
					left<Error, number>(error),
				],
			]) {
				const [a, b, c] = eithers;
				const d = map3(a!, b!, c!, mapper);
				expect(d.toResult()).toEqual(left(error).toResult());
				expect(mapper).not.toBeCalled();
			}
		});
	});

	describe("Validation", () => {
		it("should map valid values", () => {
			const result = map3(valid(2), valid(3), valid(4), (a, b, c) => a + b + c);
			expect(result.toResult()).toEqual({ ok: true, value: 9 });
		});

		it("should accumulate all errors when all are invalid", () => {
			const mapper = vi.fn();
			const result = map3(
				invalid<string, number>("e1"),
				invalid<string, number>("e2"),
				invalid<string, number>("e3"),
				mapper,
			);
			expect(result.toResult()).toEqual({
				ok: false,
				errors: ["e1", "e2", "e3"],
			});
			expect(mapper).not.toBeCalled();
		});

		it("should accumulate errors from multiple invalid values", () => {
			const mapper = vi.fn();
			const result = map3(
				invalid<string, number>("e1"),
				valid<number, string>(2),
				invalid<string, number>("e3"),
				mapper,
			);
			expect(result.toResult()).toEqual({
				ok: false,
				errors: ["e1", "e3"],
			});
			expect(mapper).not.toBeCalled();
		});
	});
});
