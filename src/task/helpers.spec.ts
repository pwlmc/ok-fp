import { describe, expect, it, vi } from "vitest";
import { task } from "./constructors.js";
import { all, sequence, traverse } from "./helpers.js";

describe("task helpers", () => {
	describe("all", () => {
		it("should resolve all tasks concurrently and return an array of results", async () => {
			const result = await all([task(1), task(2), task(3)]).run();
			expect(result).toEqual([1, 2, 3]);
		});

		it("should return an empty array for empty input", async () => {
			const result = await all([]).run();
			expect(result).toEqual([]);
		});

		it("should run all tasks", async () => {
			const fn1 = vi.fn(() => Promise.resolve(1));
			const fn2 = vi.fn(() => Promise.resolve(2));
			await all([
				{
					run: fn1,
					map: vi.fn(),
					ap: vi.fn(),
					zip: vi.fn(),
					flatten: vi.fn(),
					flatMap: vi.fn(),
					tap: vi.fn(),
				},
				{
					run: fn2,
					map: vi.fn(),
					ap: vi.fn(),
					zip: vi.fn(),
					flatten: vi.fn(),
					flatMap: vi.fn(),
					tap: vi.fn(),
				},
			]).run();
			expect(fn1).toHaveBeenCalledOnce();
			expect(fn2).toHaveBeenCalledOnce();
		});
	});

	describe("traverse", () => {
		it("should map items to tasks and collect results", async () => {
			const result = await traverse([1, 2, 3], (x) => task(x * 2)).run();
			expect(result).toEqual([2, 4, 6]);
		});

		it("should return empty array for empty input", async () => {
			const result = await traverse([], (x: number) => task(x)).run();
			expect(result).toEqual([]);
		});
	});

	describe("sequence", () => {
		it("should sequence tasks and return an array of results", async () => {
			const result = await sequence([task(1), task(2), task(3)]).run();
			expect(result).toEqual([1, 2, 3]);
		});

		it("should return empty array for empty input", async () => {
			const result = await sequence([]).run();
			expect(result).toEqual([]);
		});
	});
});
