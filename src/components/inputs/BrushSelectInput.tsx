import { Dispatch, SetStateAction, useEffect, useState, CSSProperties } from 'react';
import { AlphaOptions, BrushOptions } from '../../contexts/MenuOptions';
import { createDrawable } from '../../hooks/createDrawable';
import { uid } from '../../lib/uid';
import { DrawableState } from '../../types/DrawableState';
import { Drawable } from '../Drawable';
import { LeftMenuPortal } from '../portals/LeftMenu';
import { TopMenuPortal } from '../portals/TopMenu';

const style:CSSProperties = {
    display: 'flex',
    flexDirection: 'column'
};

export const BrushSelectInput = (props:BrushOptions & AlphaOptions & {onChange:Dispatch<SetStateAction<BrushOptions & AlphaOptions>>}) => {
    const { brushes, selectedBrush, brushWidth, alpha, onChange } = props;
    const [{ previews, selectedPreview }, setPreviews] = useState<{previews:DrawableState[], selectedPreview:DrawableState}>({ previews: [], selectedPreview: createPreview() });
    const [id] = useState(uid());
    useEffect(()=>{
        if(brushWidth === undefined)onChange({ ...props, brushWidth: 20 });
    }, [brushWidth]);
    useEffect(()=>{
        setPreviews({ previews: brushes.map(() => createPreview()), selectedPreview });
    }, [brushes]);
    useEffect(()=>{
        previews.forEach((preview, i) => brushes[i].renderPreview(preview, [[10, 10], [110, 10]], '#000000', alpha || 1, Math.min(20, brushWidth)));
    }, [alpha, Math.min(20, brushWidth), brushes, previews, selectedBrush]);
    useEffect(()=>{
        brushes[selectedBrush]?.renderPreview(selectedPreview, [[10, 10], [110, 10]], '#000000', alpha || 1, Math.min(20, brushWidth));
    }, [alpha, Math.min(20, brushWidth), selectedBrush]);
    return <>
        <TopMenuPortal>
            <div style={style} className='dropdown'>
                <button>
                    <Drawable canvas={selectedPreview.canvas} />Brush
                </button>
                <ul>
                    {previews.map(({ canvas }, i) => <li key={id+'-'+i}><Drawable canvas={canvas} className={i==selectedBrush ? 'selected' : ''} onMouseDown={()=>onChange({ ...props, selectedBrush: i })} /></li>)}
                </ul>
            </div>
        </TopMenuPortal>
        <LeftMenuPortal>
            <label>
                <div>
                    brush width
                </div>
                <input {...{ orient: 'vertical' }} type="range" value={Math.sqrt(brushWidth)} step="0.1" min="1" max="16" onChange={(e) => onChange({ ...props, brushWidth: Math.pow(parseFloat(e.target.value), 2) })} />
            </label>
        </LeftMenuPortal>
    </>;
};

const createPreview = () => createDrawable({ size: [120, 20] });