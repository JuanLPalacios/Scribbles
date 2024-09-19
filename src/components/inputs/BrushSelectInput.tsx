import '../../css/inputs/BrushSelectInput.css';
import { useState, CSSProperties, useMemo } from 'react';
import { uid } from '../../lib/uid';
import { LeftMenuPortal } from '../portals/LeftMenu';
import { TopMenuPortal } from '../portals/TopMenu';
import { BrushPreview } from './BrushPreview';
import Brush from '../../abstracts/Brush';
import { DrawableState } from '../../types/DrawableState';
import { BrushC } from '../../brushes/BrushC';
import { useBrushesOptions } from '../../hooks/useBrushesOptions';

const style:CSSProperties = {
    display: 'flex',
    flexDirection: 'column'
};

export const BrushSelectInput = () => {
    const [{ brushesPacks, selectedBrush, brushWidth }, onChange] = useBrushesOptions();
    const [currentSelectedBrush, setCurrentSelectedBrush] = useState<{
        brush: Brush;
        preview?: DrawableState;
    }>({ brush: brushesPacks[selectedBrush].brush });
    const { preview } = currentSelectedBrush;
    useMemo(()=>{
        setCurrentSelectedBrush({ brush: brushesPacks[selectedBrush].brush, preview });
    }, [brushesPacks, preview, selectedBrush]);
    const [id] = useState(uid());
    return <>
        <TopMenuPortal>
            <div style={style} className='brush dropdown'>
                <button>
                    <BrushC brush={currentSelectedBrush.brush.toObj()as any}>
                        <BrushPreview brush={currentSelectedBrush} />Brush
                    </BrushC>
                </button>
                <ul>
                    {brushesPacks.map((brush, i) => <li key={id+'-'+i}>
                        <BrushC brush={brush.brush.toObj()as any}>
                            <BrushPreview brush={brush} selected={i===selectedBrush} onMouseDown={() => onChange({ brushesPacks, brushWidth, selectedBrush: i })} />
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
                <input {...{ orient: 'vertical' }} type="range" value={Math.sqrt(brushWidth)} step="0.1" min="1" max="16" onChange={(e) => onChange({ brushesPacks, selectedBrush, brushWidth: Math.pow(parseFloat(e.target.value), 2) })} />
            </label>
        </LeftMenuPortal>
    </>;
};
