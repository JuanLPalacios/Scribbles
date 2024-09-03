import '../../css/inputs/BrushSelectInput.css';
import demoStroke from '../../demo/strokePreview.json';
import { Dispatch, SetStateAction, useEffect, useState, CSSProperties, useMemo } from 'react';
import { AlphaOptions } from '../../contexts/MenuOptions';
import { BrushOptions } from '../../contexts/BrushOptions';
import { createDrawable } from '../../generators/createDrawable';
import { uid } from '../../lib/uid';
import { Drawable } from '../Drawable';
import { LeftMenuPortal } from '../portals/LeftMenu';
import { TopMenuPortal } from '../portals/TopMenu';
import Brush from '../../abstracts/Brush';

const style:CSSProperties = {
    display: 'flex',
    flexDirection: 'column'
};

export const BrushSelectInput = (props:BrushOptions & AlphaOptions & {onChange:Dispatch<SetStateAction<BrushOptions & AlphaOptions>>}) => {
    const { brushes, selectedBrush, brushWidth, onChange } = props;
    const [id] = useState(uid());
    return <>
        <TopMenuPortal>
            <div style={style} className='brush dropdown'>
                <button>
                    <BrushPreview brush={brushes[selectedBrush]} />Brush
                </button>
                <ul>
                    {brushes.map((brush, i) => <li key={id+'-'+i}><BrushPreview brush={brush} selected={i===selectedBrush} onMouseDown={() => onChange({ ...props, selectedBrush: i })}/></li>)}
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

function BrushPreview({ brush, selected, onMouseDown }:{ brush:Brush, selected?: boolean, onMouseDown?: React.MouseEventHandler<HTMLDivElement> }) {
    const preview = useMemo(createPreview, []);
    useEffect(()=>{
        brush.renderPreview(preview, demoStroke as never, '#ffffff', .5, 15);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brush]);
    return <Drawable canvas={preview.canvas} className={ selected ? 'selected' : ''} onMouseDown={onMouseDown} />;
}
