export type Valid<T> = {
	readonly valid: T;
};

export type Invalid<E> = {
	readonly invalid: readonly E[];
};

export type ValidationV<E, T> = Valid<T> | Invalid<E>;
