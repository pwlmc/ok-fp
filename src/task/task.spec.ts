import { describe, expect, it, vi } from "vitest";
import { task } from "./constructors.js";
import type { Task } from "./task.js";

describe("task", () => {
	describe("map", () => {
		it("should transform the resolved value", async () => {
			const t = task(5).map((x) => x * 2);
			expect(await t.run()).toBe(10);
		});

		it("should be composable", async () => {
			const t = task(5)
				.map((x) => x + 1)
				.map((x) => x * 2);
			expect(await t.run()).toBe(12);
		});
	});

	describe("ap", () => {
		it("should apply a function task to a value task", async () => {
			const add = (x: number) => (y: number) => x + y;
			const result = task(add(5)).ap(task(3));
			expect(await result.run()).toBe(8);
		});

		it("should run both tasks", async () => {
			const fn = vi.fn((y: number) => y * 2);
			const result = task(fn).ap(task(4));
			expect(await result.run()).toBe(8);
			expect(fn).toHaveBeenCalledWith(4);
		});
	});

	describe("zip", () => {
		it("should combine two tasks into a tuple", async () => {
			const result = task("Alice").zip(task(30));
			expect(await result.run()).toEqual(["Alice", 30]);
		});
	});

	describe("flatten", () => {
		it("should remove one level of task nesting", async () => {
			const nested = task(task(42));
			expect(await nested.flatten().run()).toBe(42);
		});
	});

	describe("flatMap", () => {
		it("should chain task-returning operations", async () => {
			const result = task(10).flatMap((x) => task(x * 2));
			expect(await result.run()).toBe(20);
		});

		it("should chain multiple flatMaps", async () => {
			const result = task(1)
				.flatMap((x) => task(x + 1))
				.flatMap((x) => task(x * 3));
			expect(await result.run()).toBe(6);
		});
	});

	describe("tap", () => {
		it("should run the side effect with the resolved value and return the same value", async () => {
			const sideEffect = vi.fn();
			const t = task(42).tap(sideEffect);
			const result = await t.run();
			expect(sideEffect).toHaveBeenCalledWith(42);
			expect(result).toBe(42);
		});

		it("should not affect the resolved value", async () => {
			const t = task(42).tap(() => "ignored");
			expect(await t.run()).toBe(42);
		});
	});

	describe("run", () => {
		it("should return a Promise", () => {
			const result = task(42).run();
			expect(result).toBeInstanceOf(Promise);
		});

		it("should resolve with the task value", async () => {
			expect(await task("hello").run()).toBe("hello");
		});
	});

	describe("functor laws", () => {
		it("should obey the identity law: t.map(id) resolves to same value as t", async () => {
			const id = <T>(x: T) => x;
			const t = task(123);
			expect(await t.map(id).run()).toBe(await t.run());
		});

		it("should obey the composition law: t.map(f).map(g) == t.map(x => g(f(x)))", async () => {
			const f = (x: number) => x + 1;
			const g = (x: number) => x * 2;
			const t = task(10);
			expect(await t.map(f).map(g).run()).toBe(
				await t.map((x) => g(f(x))).run(),
			);
		});
	});

	describe("monad laws", () => {
		it("should obey the left identity law: task(a).flatMap(f) resolves same as f(a)", async () => {
			const f = (x: number): Task<number> => task(x * 2);
			const a = 42;
			expect(await task(a).flatMap(f).run()).toBe(await f(a).run());
		});

		it("should obey the right identity law: t.flatMap(task) resolves same as t", async () => {
			const t = task(7);
			expect(await t.flatMap(task).run()).toBe(await t.run());
		});

		it("should obey the associativity law", async () => {
			const f = (x: number): Task<number> => task(x * 2);
			const g = (x: number): Task<number> => task(x + 1);
			const t = task(5);
			expect(await t.flatMap(f).flatMap(g).run()).toBe(
				await t.flatMap((x) => f(x).flatMap(g)).run(),
			);
		});
	});
});
