import { fromNullable, fromOption, tryCatch } from "./constructors.js";
import type { Either as EitherType } from "./either.js";
import { sequence, traverse } from "./helpers.js";

export * from "./constructors.js";
export type Either<E, T> = EitherType<E, T>;
export * from "./model.js";

export const Either = {
	fromNullable,
	fromOption,
	tryCatch,
	sequence,
	traverse,
};
