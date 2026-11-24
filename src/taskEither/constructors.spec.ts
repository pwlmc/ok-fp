import { describe, expect, it, vi } from "vitest";
import { left, right } from "../either/constructors.js";
import { task } from "../task/constructors.js";
import {
	fromEither,
	fromTask,
	taskLeft,
	taskRight,
	tryCatch,
} from "./constructors.js";

describe("taskRight constructors", () => {
	describe("taskRight", () => {
		it("should create a taskRight that resolves with a right value", async () => {
			const te = taskRight(42);
			expect((await te.run()).toResult()).toEqual(right(42).toResult());
		});
	});

	describe("taskLeft", () => {
		it("should create a taskRight that resolves with a left value", async () => {
			const error = new Error("test error");
			const te = taskLeft(error);
			expect((await te.run()).toResult()).toEqual(left(error).toResult());
		});
	});

	describe("fromEither", () => {
		it("should wrap a right either in a taskRight", async () => {
			const either = right(42);
			const te = fromEither(either);
			expect((await te.run()).toResult()).toEqual(right(42).toResult());
		});

		it("should wrap a left either in a taskRight", async () => {
			const error = new Error("test error");
			const either = left(error);
			const te = fromEither(either);
			expect((await te.run()).toResult()).toEqual(left(error).toResult());
		});
	});

	describe("fromTask", () => {
		it("should wrap a task value in a right taskRight", async () => {
			const t = task(42);
			const te = fromTask(t);
			expect((await te.run()).toResult()).toEqual(right(42).toResult());
		});
	});

	describe("tryCatch", () => {
		it("should create a right taskRight when promise resolves", async () => {
			const te = tryCatch(() => Promise.resolve(42));

			expect((await te.run()).toResult()).toEqual(right(42).toResult());
		});

		it("should map a rejected value when onThrow is provided", async () => {
			const te = tryCatch(
				() => Promise.reject(new Error("async error")),
				(err) => String(err),
			);

			expect((await te.run()).toResult()).toEqual(
				left("Error: async error").toResult(),
			);
		});

		it("should preserve a rejected value when onThrow is omitted", async () => {
			const error = { code: "async" };
			const te = tryCatch(() => Promise.reject(error));

			expect((await te.run()).toResult()).toEqual(left(error).toResult());
		});

		it("should call the thunk only when run() is called", async () => {
			const fn = vi.fn(() => Promise.resolve(1));
			const te = tryCatch(fn, (err) => err);
			expect(fn).not.toHaveBeenCalled();
			await te.run();
			expect(fn).toHaveBeenCalledOnce();
		});
	});
});
