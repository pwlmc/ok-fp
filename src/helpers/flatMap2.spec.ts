import { describe, expect, it, vi } from "vitest";
import { left, right } from "../either/constructors.js";
import { none, some } from "../option/constructors.js";
import { task } from "../task/constructors.js";
import { taskLeft, taskRight } from "../taskEither/constructors.js";
import { flatMap2 } from "./flatMap2.js";

describe("flatMap2", () => {
	it("should combine and flatten Options", () => {
		expect(flatMap2(some(2), some(3), (a, b) => some(a * b)).toNullable()).toBe(
			6,
		);

		const mapper = vi.fn(() => some(0));
		expect(flatMap2(none<number>(), some(3), mapper).toNullable()).toBeNull();
		expect(mapper).not.toHaveBeenCalled();
	});

	it("should combine and flatten Eithers", () => {
		expect(
			flatMap2(right(2), right(3), (a, b) => right(a * b)).toResult(),
		).toEqual({ ok: true, value: 6 });

		const mapper = vi.fn(() => right(0));
		expect(flatMap2(left("first"), right(3), mapper).toResult()).toEqual({
			ok: false,
			error: "first",
		});
		expect(mapper).not.toHaveBeenCalled();
	});

	it("should combine and flatten Tasks", async () => {
		const result = flatMap2(task(2), task(3), (a, b) => task(a * b));

		expect(await result.run()).toBe(6);
	});

	it("should combine and flatten TaskEithers", async () => {
		const result = flatMap2(taskRight(2), taskRight(3), (a, b) =>
			taskRight(a * b),
		);
		expect((await result.run()).toResult()).toEqual({ ok: true, value: 6 });

		const mapper = vi.fn(() => taskRight(0));
		const failed = flatMap2(
			taskLeft<string, number>("first"),
			taskRight(3),
			mapper,
		);
		expect((await failed.run()).toResult()).toEqual({
			ok: false,
			error: "first",
		});
		expect(mapper).not.toHaveBeenCalled();
	});
});
