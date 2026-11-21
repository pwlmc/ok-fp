import { describe, expect, it } from "vitest";
import type {
	Either as EitherType,
	Option as OptionType,
	TaskEither as TaskEitherType,
	Task as TaskType,
	Validation as ValidationType,
} from "./index.js";
import {
	Either,
	invalid,
	left,
	none,
	Option,
	right,
	some,
	Task,
	TaskEither,
	task,
	taskRight,
	Validation,
	valid,
} from "./index.js";

describe("public API", () => {
	it("should expose free constructors", async () => {
		const option: OptionType<number> = some(1);
		const either: EitherType<string, number> = right(1);
		const taskValue: TaskType<number> = task(1);
		const taskEitherValue: TaskEitherType<never, number> = taskRight(1);
		const validation: ValidationType<never, number> = valid(1);

		expect(option.toNullable()).toBe(1);
		expect(either.toResult()).toEqual({ ok: true, value: 1 });
		expect(await taskValue.run()).toBe(1);
		expect((await taskEitherValue.run()).toResult()).toEqual({
			ok: true,
			value: 1,
		});
		expect(validation.toResult()).toEqual({ ok: true, value: 1 });
		expect(none().toNullable()).toBe(null);
		expect(left("error").toResult()).toEqual({
			ok: false,
			error: "error",
		});
		expect(invalid("error").toResult()).toEqual({
			ok: false,
			errors: ["error"],
		});
		expect(Task).not.toHaveProperty("of");
		expect(TaskEither).not.toHaveProperty("of");
		expect(TaskEither).not.toHaveProperty("left");
		expect(TaskEither).not.toHaveProperty("right");
		expect(Option).not.toHaveProperty("some");
		expect(Option).not.toHaveProperty("none");
		expect(Either).not.toHaveProperty("left");
		expect(Either).not.toHaveProperty("right");
		expect(Validation).not.toHaveProperty("valid");
		expect(Validation).not.toHaveProperty("invalid");
	});

	it("should expose scoped sequence operations", () => {
		expect(Option.sequence([some(1), some(2)]).toNullable()).toEqual([1, 2]);
		expect(Either.sequence([right(1), right(2)]).toResult()).toEqual({
			ok: true,
			value: [1, 2],
		});
		expect(Validation.sequence([valid(1), valid(2)]).toResult()).toEqual({
			ok: true,
			value: [1, 2],
		});
	});
});
