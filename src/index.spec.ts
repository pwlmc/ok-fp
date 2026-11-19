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
	left,
	none,
	Option,
	right,
	some,
	Task,
	TaskEither,
	task,
	taskLeft,
	taskRight,
	Validation,
} from "./index.js";

describe("public companion API", () => {
	it("exposes scoped constructors and direct constructors", async () => {
		const option: OptionType<number> = some(1);
		const either: EitherType<string, number> = right(1);
		const taskValue: TaskType<number> = task(1);
		const taskEitherValue: TaskEitherType<never, number> = taskRight(1);
		const validation: ValidationType<never, number> = Validation.valid(1);

		expect(option.toNullable()).toBe(1);
		expect(either.toResult()).toEqual({ ok: true, value: 1 });
		expect(await taskValue.run()).toBe(1);
		expect((await taskEitherValue.run()).toResult()).toEqual({
			ok: true,
			value: 1,
		});
		expect(validation.toResult()).toEqual({ ok: true, value: 1 });
		expect(Option.none().toNullable()).toBe(null);
		expect(Either.left("error").toResult()).toEqual({
			ok: false,
			error: "error",
		});
		expect(left("error").toResult()).toEqual({
			ok: false,
			error: "error",
		});
		expect(Task.of).toBe(task);
		expect(TaskEither.of).toBe(taskRight);
		expect(TaskEither.left).toBe(taskLeft);
		expect(none().toNullable()).toBe(null);
	});

	it("exposes scoped sequence operations", () => {
		expect(Option.sequence([some(1), some(2)]).toNullable()).toEqual([1, 2]);
		expect(Either.sequence([right(1), right(2)]).toResult()).toEqual({
			ok: true,
			value: [1, 2],
		});
		expect(
			Validation.sequence([
				Validation.valid(1),
				Validation.valid(2),
			]).toResult(),
		).toEqual({
			ok: true,
			value: [1, 2],
		});
	});
});
