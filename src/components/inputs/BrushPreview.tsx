import demoStroke from '../../demo/strokePreview.json';
import { useMemo } from 'react';
import { Drawable } from '../Drawable';
import { createDrawable } from '../../generators/createDrawable';
import Brush from '../../abstracts/Brush';
import { DrawableState } from '../../types/DrawableState';

export function BrushPreview({ brush, selected, onMouseDown }:{ brush:{ brush: Brush; preview?: DrawableState | undefined; }, selected?: boolean, onMouseDown?: React.MouseEventHandler<HTMLDivElement> }) {
    useMemo(()=>{
        console.log(brush.brush.name);
        const preview = brush.preview || createPreview();
        brush.brush.renderPreview(preview, demoStroke as never, '#ffffff', .5, 15);
        brush.preview = preview;
    }, [brush]);
    return <Drawable canvas={brush.preview?.canvas} className={ selected ? 'selected' : ''} onMouseDown={onMouseDown} />;
}

const createPreview = () => createDrawable({ size: [150, 30] });