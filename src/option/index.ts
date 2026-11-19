import { fromEither, fromNullable, none, some } from "./constructors.js";
import { sequence } from "./helpers.js";
import type { Option as OptionType } from "./option.js";

export * from "./constructors.js";
export * from "./model.js";

export const Option = {
	some,
	none,
	fromNullable,
	fromEither,
	sequence,
};

export type Option<T> = OptionType<T>;
