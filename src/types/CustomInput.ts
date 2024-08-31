export type CustomInput<T = unknown> = Omit<HTMLInputElement, 'value'> & { value: T; };
