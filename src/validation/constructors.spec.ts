import { describe, expect, it } from "vitest";
import { left, right } from "../either.js";
import { fromEither, invalid, valid } from "./constructors.js";

const asTag = <E, T>(v: {
	match: <U>(onInvalid: (e: readonly E[]) => U, onValid: (v: T) => U) => U;
}) =>
	v.match(
		(errors) => ({ tag: "INVALID" as const, invalid: errors }),
		(value) => ({ tag: "VALID" as const, valid: value }),
	);

describe("validation constructors", () => {
	describe("valid", () => {
		it("should create validation with valid value", () => {
			const v = valid(42);
			expect(asTag(v)).toEqual({ tag: "VALID", valid: 42 });
		});
	});

	describe("invalid", () => {
		it("should create validation with a single error", () => {
			const v = invalid("something went wrong");
			expect(asTag(v)).toEqual({
				tag: "INVALID",
				invalid: ["something went wrong"],
			});
		});
	});

	describe("fromEither", () => {
		it("should create valid from right", () => {
			const v = fromEither(right(42));
			expect(asTag(v)).toEqual({ tag: "VALID", valid: 42 });
		});

		it("should create invalid with single error from left", () => {
			const error = new Error("test error");
			const v = fromEither(left(error));
			expect(asTag(v)).toEqual({ tag: "INVALID", invalid: [error] });
		});
	});
});
