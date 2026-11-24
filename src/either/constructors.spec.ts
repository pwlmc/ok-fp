import { describe, expect, it } from "vitest";
import { none, some } from "../option/constructors.js";
import {
	fromNullable,
	fromOption,
	left,
	right,
	tryCatch,
} from "./constructors.js";

describe("either constructors", () => {
	describe("left", () => {
		it("should create either with left value", () => {
			const error = new Error("test error");
			const either = left(error);
			expect(either.toResult()).toEqual({
				ok: false,
				error,
			});
		});
	});

	describe("right", () => {
		it("should create either with right value", () => {
			const either = right(2);
			expect(either.toResult()).toEqual({
				ok: true,
				value: 2,
			});
		});
	});

	describe("fromNullable", () => {
		it("should create right value when value is not null nor undefined", () => {
			const either = fromNullable(2, () => {});
			expect(either.toResult()).toEqual(right(2).toResult());
		});

		it("should create left value when value is null nor undefined", () => {
			const error = new Error("test error");
			const either1 = fromNullable(null, () => error);
			const either2 = fromNullable(undefined, () => error);

			expect(either1.toResult()).toEqual(left(error).toResult());
			expect(either2.toResult()).toEqual(left(error).toResult());
		});
	});

	describe("tryCatch", () => {
		it("should create right value when function returns a result", () => {
			const either = tryCatch(() => 2);

			expect(either.toResult()).toEqual(right(2).toResult());
		});

		it("should map a thrown value when onThrow is provided", () => {
			const either = tryCatch(
				() => {
					throw new Error("test error");
				},
				(err) => String(err),
			);

			expect(either.toResult()).toEqual(left("Error: test error").toResult());
		});

		it("should preserve a thrown value when onThrow is omitted", () => {
			const error = { code: "test" };
			const either = tryCatch(() => {
				throw error;
			});

			expect(either.toResult()).toEqual(left(error).toResult());
		});
	});

	describe("fromOption", () => {
		it("should create right value from some option", () => {
			const either = fromOption(some(2), () => {});
			expect(either.toResult()).toEqual(right(2).toResult());
		});

		it("should create left value from none option", () => {
			const error = new Error("test error");
			const either = fromOption(none(), () => error);
			expect(either.toResult()).toEqual(left(error).toResult());
		});
	});
});
