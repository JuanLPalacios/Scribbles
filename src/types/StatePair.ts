import { Dispatch, SetStateAction } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StatePair<T = any> = [T, Dispatch<SetStateAction<T>>];
