import { Dispatch, SetStateAction } from 'react';

export type StatePair<T = any> = [T, Dispatch<SetStateAction<T>>];
