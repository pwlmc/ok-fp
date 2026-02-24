import { describe, expect, it, vi } from "vitest";
import { task } from "./constructors.js";
import { all } from "./helpers.js";

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
});
