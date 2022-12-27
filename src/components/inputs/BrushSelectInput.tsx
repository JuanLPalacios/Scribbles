import '../../css/inputs/BrushSelectInput.css';
import demoStroke from '../../demo/strokePreview.json';
import { Dispatch, SetStateAction, useEffect, useState, CSSProperties } from 'react';
import { AlphaOptions, BrushOptions } from '../../contexts/MenuOptions';
import { createDrawable } from '../../generators/createDrawable';
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
    const { brushes, selectedBrush, brushWidth, onChange } = props;
    const [{ previews, selectedPreview }, setPreviews] = useState<{previews:DrawableState[], selectedPreview:DrawableState}>({ previews: [], selectedPreview: createPreview() });
    const [id] = useState(uid());
    useEffect(()=>{
        setPreviews({ previews: brushes.map(() => createPreview()), selectedPreview });
    }, [brushes, selectedPreview]);
    useEffect(()=>{
        previews.forEach((preview, i) => brushes[i].renderPreview(preview, demoStroke as any, '#ffffff', .5 || 1, 15));
    }, [brushes, previews, selectedBrush]);
    useEffect(()=>{
        brushes[selectedBrush]?.renderPreview(selectedPreview, demoStroke as any, '#ffffff', .5 || 1, 15);
    }, [brushes, selectedBrush, selectedPreview]);
    return <>
        <TopMenuPortal>
            <div style={style} className='brush dropdown'>
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

const createPreview = () => createDrawable({ size: [150, 30] });