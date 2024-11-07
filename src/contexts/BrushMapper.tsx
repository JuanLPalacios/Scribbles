import { useMemo } from 'react';
import { BrushPair, IsSerialized, BrushFunctions } from './BrushRendererContext';
import { Serialized } from '../lib/Serialization';

export function BrushMapper<S extends Serialized & { name: string; scribbleBrushType: number; }>(list: BrushPair<IsSerialized<S>>[]) {
    const Brush = ({ brush, children }: BrushFunctions<S>) => {
        const [WrappedComponent, defaultThat] = useMemo(() => {
            const i = list.findIndex(x => x[1].scribbleBrushType == brush.scribbleBrushType);
            return list[i];
        }, [brush.scribbleBrushType]);
        const paddedBrush = useMemo(() => ({ ...defaultThat, ...brush }), [defaultThat, brush]);
        return <WrappedComponent brush={paddedBrush}>{children}</WrappedComponent>;
    };

    Brush.displayName = `Brush(${list.map(([WrappedComponent]) => `Brush(${WrappedComponent.name})`).join('|')})`;
    return Brush;
}
