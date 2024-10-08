import { createContext, ReactNode } from 'react';
import { Serialized } from '../lib/Serialization';
import { DrawableState } from '../types/DrawableState';
import { Point } from '../types/Point';

export const BrushRendererContext = createContext<BrushRenderer>({ drawStroke: () => { }, endStroke: () => { }, startStroke: () => { } });export type IsSerialized<S extends Serialized & { name: string; scribbleBrushType: number; }> = S;

export type BrushRenderer = {
    startStroke: (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => void;
    drawStroke: (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => void;
    endStroke: (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => void;
};

export type BrushFunctions<B extends { name: string; scribbleBrushType: number; }> = {
    brush: B;
    children: ReactNode;
};

export type BrushPair<B extends Serialized & { name: string; scribbleBrushType: number; }> = [(props: BrushFunctions<any>) => ReactNode, B];

