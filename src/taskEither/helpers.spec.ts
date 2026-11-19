import { describe, expect, it } from "vitest";
import { left, right } from "../either/constructors.js";
import { taskLeft, taskRight } from "./constructors.js";
import { allTaskEithers } from "./helpers.js";

describe("taskRight helpers", () => {
	describe("allTaskEithers", () => {
		it("should resolve all taskRights and return a right with an array of values", async () => {
			const result = await allTaskEithers([
				taskRight(1),
				taskRight(2),
				taskRight(3),
			]).run();
			expect(result.toResult()).toEqual(right([1, 2, 3]).toResult());
		});

		it("should return an empty right array for empty input", async () => {
			const result = await allTaskEithers([]).run();
			expect(result.toResult()).toEqual(right([]).toResult());
		});

		it("should return the first left if any taskRight is left", async () => {
			const error = new Error("test error");
			const result = await allTaskEithers([
				taskRight<number, Error>(1),
				taskLeft<Error, number>(error),
				taskRight<number, Error>(3),
			]).run();
			expect(result.toResult()).toEqual(left(error).toResult());
		});
	});
});
