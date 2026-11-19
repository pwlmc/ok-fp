import { describe, expect, it } from "vitest";
import { none, some } from "./constructors.js";
import { sequenceOptions } from "./helpers.js";

describe("option helpers", () => {
	describe("sequenceOptions", () => {
		it("should return an option with the array of values when no none", () => {
			const res = sequenceOptions([some(1), some(2), some(3)]);
			expect(res.toNullable()).toEqual([1, 2, 3]);
		});

		it("should return none if one array items is none", () => {
			const res = sequenceOptions([some(1), none<number>(), some(3)]);
			expect(res.toNullable()).toBe(null);
		});
	});
});
