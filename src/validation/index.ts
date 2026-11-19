import { fromEither, fromOption } from "./constructors.js";
import { sequence } from "./helpers.js";
import type { Validation as ValidationType } from "./validation.js";

export * from "./constructors.js";
export * from "./model.js";

export const Validation = {
	fromEither,
	fromOption,
	sequence,
};

export type Validation<E, T> = ValidationType<E, T>;
