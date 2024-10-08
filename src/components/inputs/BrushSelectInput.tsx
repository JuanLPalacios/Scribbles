import '../../css/inputs/BrushSelectInput.css';
import { useState, CSSProperties, useMemo, useEffect } from 'react';
import { uid } from '../../lib/uid';
import { LeftMenuPortal } from '../portals/LeftMenu';
import { TopMenuPortal } from '../portals/TopMenu';
import { BrushPreview } from './BrushPreview';
import { DrawableState } from '../../types/DrawableState';
import { BrushC } from '../../abstracts/BrushC';
import { useBrushesOptions } from '../../hooks/useBrushesOptions';
import { SerializedBrush } from '../../lib/Serialization';

const style:CSSProperties = {
    display: 'flex',
    flexDirection: 'column'
};

export const BrushSelectInput = () => {
    const [{ brushesPacks, selectedBrush, brushWidth }, onChange] = useBrushesOptions();
    const [currentSelectedBrush, setCurrentSelectedBrush] = useState<{
        brush: SerializedBrush;
        preview?: DrawableState;
    }>({ brush: brushesPacks[selectedBrush].brush });
    const { preview } = currentSelectedBrush;
    const [id] = useState(uid());
    const memoBrushes = useMemo(()=>brushesPacks.map((brush, i) => ({
        key: id+'-'+i,
        brush: brush,
        selected: i===selectedBrush,
        onMouseDown: ()=>onChange({ brushesPacks, brushWidth, selectedBrush: i })
    })), [brushWidth, brushesPacks, id, onChange, selectedBrush]);
    useEffect(()=>{
        setCurrentSelectedBrush({ brush: brushesPacks[selectedBrush].brush, preview });
    }, [brushesPacks, preview, selectedBrush]);
    return <>
        <TopMenuPortal>
            <div style={style} className='brush dropdown'>
                <button>
                    <BrushC brush={currentSelectedBrush.brush}>
                        <BrushPreview brush={currentSelectedBrush} />Brush
                    </BrushC>
                </button>
                <ul>
                    {memoBrushes.map(({ brush, key, onMouseDown, selected }) => <li key={key}>
                        <BrushC brush={brush.brush}>
                            <BrushPreview brush={brush} selected={selected} onMouseDown={onMouseDown} />
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
