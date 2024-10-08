import demoStroke from '../../demo/strokePreview.json';
import { useMemo } from 'react';
import { Drawable } from '../Drawable';
import { createDrawable } from '../../generators/createDrawable';
import { DrawableState } from '../../types/DrawableState';
import { useBrush } from '../../hooks/useBrush';
import { Point } from '../../types/Point';
import { SerializedBrush } from '../../lib/Serialization';

export function BrushPreview({ brush, selected, onMouseDown }:{ brush:{ brush: SerializedBrush; preview?: DrawableState | undefined; }, selected?: boolean, onMouseDown?: React.MouseEventHandler<HTMLDivElement> }) {
    const { startStroke, drawStroke, endStroke } = useBrush();
    useMemo(()=>{
        const preview = brush.preview || createPreview();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brush]);
    return <Drawable canvas={brush.preview?.canvas} className={ selected ? 'selected' : ''} onMouseDown={onMouseDown} />;
}

const createPreview = () => createDrawable({ size: [150, 30] });