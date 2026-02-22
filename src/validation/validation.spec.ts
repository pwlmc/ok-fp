import { describe, expect, it, vi } from "vitest";
import { applicativeLawsSpec } from "../testUtils/applicativeLaws.js";
import { functorLawsSpec } from "../testUtils/functorLaws.js";
import { invalid, valid } from "./constructors.js";
import type { Validation } from "./validation.js";

type ValidationTag<E, T> =
	| { tag: "VALID"; valid: T }
	| { tag: "INVALID"; invalid: readonly E[] };

const asTag = <E, T>(v: Validation<E, T>): ValidationTag<E, T> =>
	v.match(
		(errors) => ({ tag: "INVALID" as const, invalid: errors }),
		(value) => ({ tag: "VALID" as const, valid: value }),
	);

describe("validation", () => {
	describe("map", () => {
		const mapper = (n: number) => n + 2;

		it("should map valid value", () => {
			const v = valid(2);
			expect(asTag(v.map(mapper))).toEqual(asTag(valid(4)));
		});

		it("should not change the invalid value", () => {
			const v = invalid<string, number>("error");
			expect(v.map(mapper)).toBe(v);
		});

		it("should not call the mapper when invalid", () => {
			const mapper = vi.fn();
			invalid("error").map(mapper);
			expect(mapper).not.toHaveBeenCalled();
		});
	});

	describe("ap", () => {
		it("should apply the function to the valid value", () => {
			const v = valid((n: number) => n * 2).ap(valid(3));
			expect(asTag(v)).toEqual(asTag(valid(6)));
		});

		it("should return invalid when the function is invalid", () => {
			const v = invalid<string, (n: number) => number>("fn error").ap(valid(3));
			expect(asTag(v)).toEqual(asTag(invalid("fn error")));
		});

		it("should return invalid when the argument is invalid", () => {
			const v = valid((n: number) => n * 2).ap(invalid("arg error"));
			expect(asTag(v)).toEqual(asTag(invalid("arg error")));
		});

		it("should accumulate errors when both are invalid", () => {
			const v = invalid<string, (n: number) => number>("fn error").ap(
				invalid("arg error"),
			);
			expect(asTag(v)).toEqual({
				tag: "INVALID",
				invalid: ["fn error", "arg error"],
			});
		});
	});

	describe("match", () => {
		it("should return the mapped valid value", () => {
			const result = valid(1).match(
				() => 0,
				(value) => value + 1,
			);
			expect(result).toBe(2);
		});

		it("should return the mapped invalid errors", () => {
			const result = invalid<string, number>("error").match(
				(errors) => errors.length,
				() => 0,
			);
			expect(result).toBe(1);
		});
	});

	describe("getOrElse", () => {
		it("should return valid value", () => {
			expect(valid(2).getOrElse(() => 0)).toBe(2);
		});

		it("should return the fallback value when invalid", () => {
			expect(
				invalid<string, number>("error").getOrElse((errors) => errors.length),
			).toBe(1);
		});
	});

	describe("tap", () => {
		it("should run the side effect and return the same validation on valid value", () => {
			const sideEffect = vi.fn();
			const v = valid(2);
			const tapV = v.tap(sideEffect);
			expect(sideEffect).toBeCalledWith(2);
			expect(tapV).toBe(v);
		});

		it("should not call the side effect and return the same validation on invalid", () => {
			const sideEffect = vi.fn();
			const v = invalid("error");
			const tapV = v.tap(sideEffect);
			expect(sideEffect).not.toHaveBeenCalled();
			expect(tapV).toBe(v);
		});
	});

	describe(
		"functor laws",
		functorLawsSpec<Validation<never, number>>({
			of: (value) => valid(value),
			map: (v, mapper) => v.map(mapper),
			asTag: (v) => asTag(v),
		}),
	);

	describe(
		"applicative laws",
		applicativeLawsSpec<Validation<never, unknown>>({
			of: (value) => valid(value),
			ap: (v, arg) =>
				(v as Validation<never, (arg: unknown) => unknown>).ap(arg),
			asTag: (v) => asTag(v),
		}),
	);
});
