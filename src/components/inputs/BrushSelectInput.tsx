import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { AlphaOptions, BrushOptions } from '../../contexts/MenuOptions';
import { createDrawable } from '../../hooks/createDrawable';
import { uid } from '../../lib/uid';
import { DrawableState } from '../../types/DrawableState';
import { Drawable } from '../Drawable';

export const BrushSelectInput = (props:BrushOptions & (AlphaOptions | Record<string, never>) & {onChange:Dispatch<SetStateAction<BrushOptions & (AlphaOptions | Record<string, never>)>>}) => {
    const { brushes, selectedBrush, brushWidth, alpha, onChange } = props;
    const [previews, setPreviews] = useState<DrawableState[]>([]);
    const [id] = useState(uid());
    useEffect(()=>{
        setPreviews(brushes.map(() => createDrawable({ size: [120, 20] })));
    }, [brushes]);
    useEffect(()=>{
        previews.forEach((preview, i) => brushes[i].renderPreview(preview, [[10, 10], [110, 10]], '#000000', alpha || 1, brushWidth));
    }, [brushes, previews]);
    return <div>
        {previews.map((prev, i) => <Drawable key={id+'-'+i} canvas={prev.canvas} onClick={()=>onChange({})} />)}
        <label>
            brush
            <select value={selectedBrush} onChange={(e) => onChange({ ...props, selectedBrush: parseInt(e.target.value) })}>
                {brushes.map((brush, i) => <option key={i} value={i}>{i}</option>)}
            </select>
        </label>
        <label>
            Brush width
            <label>
                 alpha
                <input type="range" value={Math.sqrt(brushWidth)} step="0.1" min="1" max="32" onChange={(e) => onChange({ ...props, brushWidth: Math.pow(parseFloat(e.target.value), 2) })} />
            </label>
        </label>
    </div>;
};