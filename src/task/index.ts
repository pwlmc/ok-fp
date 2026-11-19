import { fromPromise } from "./constructors.js";
import { allTasks } from "./helpers.js";
import type { Task as TaskType } from "./task.js";

export * from "./constructors.js";
export * from "./helpers.js";
export type { TaskValue } from "./model.js";

export const Task = {
	fromPromise,
	all: allTasks,
};

export type Task<T> = TaskType<T>;
