import { fromEither, fromTask, tryCatch } from "./constructors.js";
import { allTaskEithers } from "./helpers.js";
import type { TaskEither as TaskEitherType } from "./taskEither.js";

export * from "./constructors.js";
export * from "./helpers.js";
export type { TaskEitherValue } from "./model.js";

export const TaskEither = {
	fromEither,
	fromTask,
	tryCatch,
	all: allTaskEithers,
};

export type TaskEither<E, T> = TaskEitherType<E, T>;
