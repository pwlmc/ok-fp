import { describe, expect, it } from "vitest";
import { left, right } from "../either/constructors.js";
import { taskEither, taskLeft } from "./constructors.js";
import { allTaskEithers } from "./helpers.js";

describe("taskEither helpers", () => {
	describe("allTaskEithers", () => {
		it("should resolve all taskEithers and return a right with an array of values", async () => {
			const result = await allTaskEithers([
				taskEither(1),
				taskEither(2),
				taskEither(3),
			]).run();
			expect(result.toResult()).toEqual(right([1, 2, 3]).toResult());
		});

		it("should return an empty right array for empty input", async () => {
			const result = await allTaskEithers([]).run();
			expect(result.toResult()).toEqual(right([]).toResult());
		});

		it("should return the first left if any taskEither is left", async () => {
			const error = new Error("test error");
			const result = await allTaskEithers([
				taskEither<number, Error>(1),
				taskLeft<Error, number>(error),
				taskEither<number, Error>(3),
			]).run();
			expect(result.toResult()).toEqual(left(error).toResult());
		});
	});
});
