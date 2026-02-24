import { describe, expect, it, vi } from "vitest";
import { fromPromise, task } from "./constructors.js";

describe("task constructors", () => {
	describe("task", () => {
		it("should create a task that resolves with the given value", async () => {
			const t = task(42);
			expect(await t.run()).toBe(42);
		});

		it("should be lazy and not run until run() is called", () => {
			const fn = vi.fn(() => Promise.resolve(42));
			fromPromise(fn);
			expect(fn).not.toHaveBeenCalled();
		});
	});

	describe("fromPromise", () => {
		it("should create a task from a promise-returning thunk", async () => {
			const t = fromPromise(() => Promise.resolve("hello"));
			expect(await t.run()).toBe("hello");
		});

		it("should call the thunk only when run() is called", async () => {
			const fn = vi.fn(() => Promise.resolve(1));
			const t = fromPromise(fn);
			expect(fn).not.toHaveBeenCalled();
			await t.run();
			expect(fn).toHaveBeenCalledOnce();
		});

		it("should call the thunk each time run() is called", async () => {
			const fn = vi.fn(() => Promise.resolve(1));
			const t = fromPromise(fn);
			await t.run();
			await t.run();
			expect(fn).toHaveBeenCalledTimes(2);
		});
	});
});
