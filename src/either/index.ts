import {
	fromNullable,
	fromOption,
	left,
	right,
	tryCatch,
} from "./constructors.js";
import type { Either as EitherType } from "./either.js";
import { sequence } from "./helpers.js";

export * from "./constructors.js";
export type Either<E, T> = EitherType<E, T>;
export * from "./model.js";

export const Either = {
	left,
	right,
	fromNullable,
	fromOption,
	tryCatch,
	sequence,
};
