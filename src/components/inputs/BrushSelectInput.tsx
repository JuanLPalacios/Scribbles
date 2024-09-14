import '../../css/inputs/BrushSelectInput.css';
import { Dispatch, SetStateAction, useState, CSSProperties, useMemo } from 'react';
import { AlphaOptions } from '../../contexts/MenuOptions';
import { BrushOptions } from '../../contexts/BrushOptions';
import { uid } from '../../lib/uid';
import { LeftMenuPortal } from '../portals/LeftMenu';
import { TopMenuPortal } from '../portals/TopMenu';
import { BrushPreview } from './BrushPreview';
import Brush from '../../abstracts/Brush';
import { DrawableState } from '../../types/DrawableState';
import { BrushC } from '../../brushes/SolidC';

const style:CSSProperties = {
    display: 'flex',
    flexDirection: 'column'
};

export const BrushSelectInput = (props:BrushOptions & AlphaOptions & {onChange:Dispatch<SetStateAction<BrushOptions & AlphaOptions>>}) => {
    const { brushesPacks: brushes, selectedBrush, brushWidth, onChange } = props;
    const [currentSelectedBrush, setCurrentSelectedBrush] = useState<{
        brush: Brush;
        preview?: DrawableState;
    }>({ brush: brushes[selectedBrush].brush });
    const { preview } = currentSelectedBrush;
    useMemo(()=>{
        setCurrentSelectedBrush({ brush: brushes[selectedBrush].brush, preview });
    }, [brushes, preview, selectedBrush]);
    const [id] = useState(uid());
    return <>
        <TopMenuPortal>
            <div style={style} className='brush dropdown'>
                <button>
                    <BrushC that={currentSelectedBrush.brush.toObj()as any}>
                        <BrushPreview brush={currentSelectedBrush} />Brush
                    </BrushC>
                </button>
                <ul>
                    {brushes.map((brush, i) => <li key={id+'-'+i}>
                        <BrushC that={brush.brush.toObj()as any}>
                            <BrushPreview brush={brush} selected={i===selectedBrush} onMouseDown={() => onChange({ ...props, selectedBrush: i })} />
                        </BrushC>
                    </li>)}
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
