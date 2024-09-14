import demoStroke from '../../demo/strokePreview.json';
import { useMemo } from 'react';
import { Drawable } from '../Drawable';
import { createDrawable } from '../../generators/createDrawable';
import Brush from '../../abstracts/Brush';
import { DrawableState } from '../../types/DrawableState';
import { useBrush } from '../../brushes/SolidC';
import { Point } from '../../types/Point';

export function BrushPreview({ brush, selected, onMouseDown }:{ brush:{ brush: Brush; preview?: DrawableState | undefined; }, selected?: boolean, onMouseDown?: React.MouseEventHandler<HTMLDivElement> }) {
    const { startStroke, drawStroke, endStroke } = useBrush();
    console.log(brush.brush.name);
    useMemo(()=>{
        console.log('re-rendered');
        const preview = brush.preview || createPreview();
        //brush.brush.renderPreview(preview, demoStroke as never, '#ffffff', .5, 15);
        const
            color = '#ffffff',
            alpha=.5,
            width=15;
        const { canvas, ctx } = preview;
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        (demoStroke as Point[]).forEach((point, i) => {
            if (i === 0) startStroke(preview, point, color, alpha, width);
            else drawStroke(preview, point, color, alpha, width);
        });
        endStroke(preview, (demoStroke as Point[])[demoStroke.length - 1], color, alpha, width);
        brush.preview = preview;
    }, [brush, drawStroke, endStroke, startStroke]);
    return <Drawable canvas={brush.preview?.canvas} className={ selected ? 'selected' : ''} onMouseDown={onMouseDown} />;
}

const createPreview = () => createDrawable({ size: [150, 30] });