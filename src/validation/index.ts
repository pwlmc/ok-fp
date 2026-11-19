import { fromEither, fromOption, invalid, valid } from "./constructors.js";
import { sequence } from "./helpers.js";
import type { Validation as ValidationType } from "./validation.js";

export * from "./constructors.js";
export * from "./model.js";

export const Validation = {
	valid,
	invalid,
	fromEither,
	fromOption,
	sequence,
};

export type Validation<E, T> = ValidationType<E, T>;
