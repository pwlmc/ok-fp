import { describe, expect, it, vi } from "vitest";
import { left, right } from "../either/constructors.js";
import { none, some } from "../option/constructors.js";
import { task } from "../task/constructors.js";
import { taskLeft, taskRight } from "../taskEither/constructors.js";
import { flatMap3 } from "./flatMap3.js";

describe("flatMap3", () => {
	it("should combine and flatten Options", () => {
		expect(
			flatMap3(some(2), some(3), some(4), (a, b, c) =>
				some(a * b * c),
			).toNullable(),
		).toBe(24);

		const mapper = vi.fn(() => some(0));
		expect(
			flatMap3(some(2), none<number>(), some(4), mapper).toNullable(),
		).toBeNull();
		expect(mapper).not.toHaveBeenCalled();
	});

	it("should combine and flatten Eithers", () => {
		expect(
			flatMap3(right(2), right(3), right(4), (a, b, c) =>
				right(a * b * c),
			).toResult(),
		).toEqual({ ok: true, value: 24 });

		const mapper = vi.fn(() => right(0));
		expect(
			flatMap3(right(2), left("second"), right(4), mapper).toResult(),
		).toEqual({ ok: false, error: "second" });
		expect(mapper).not.toHaveBeenCalled();
	});

	it("should combine and flatten Tasks", async () => {
		const result = flatMap3(task(2), task(3), task(4), (a, b, c) =>
			task(a * b * c),
		);

		expect(await result.run()).toBe(24);
	});

	it("should combine and flatten TaskEithers", async () => {
		const result = flatMap3(
			taskRight(2),
			taskRight(3),
			taskRight(4),
			(a, b, c) => taskRight(a * b * c),
		);
		expect((await result.run()).toResult()).toEqual({ ok: true, value: 24 });

		const mapper = vi.fn(() => taskRight(0));
		const failed = flatMap3(
			taskRight(2),
			taskLeft<string, number>("second"),
			taskRight(4),
			mapper,
		);
		expect((await failed.run()).toResult()).toEqual({
			ok: false,
			error: "second",
		});
		expect(mapper).not.toHaveBeenCalled();
	});
});
