import '../../css/inputs/BrushSelectInput.css';
import { useState, CSSProperties, useMemo, useEffect } from 'react';
import { uid } from '../../lib/uid';
import { TopMenuPortal } from '../portals/TopMenu';
import { BrushPreview } from './BrushPreview';
import { DrawableState } from '../../types/DrawableState';
import { Brush } from '../../abstracts/Brush';
import { useBrushesOptions } from '../../hooks/useBrushesOptions';
import { SerializedBrush } from '../../lib/Serialization';
import { BrushWidthInput } from './BrushWidthInput';

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
                    <Brush brush={currentSelectedBrush.brush}>
                        <BrushPreview brush={currentSelectedBrush} />Brush
                    </Brush>
                </button>
                <ul>
                    {memoBrushes.map(({ brush, key, onMouseDown, selected }) => <li key={key}>
                        <Brush brush={brush.brush}>
                            <BrushPreview brush={brush} selected={selected} onMouseDown={onMouseDown} />
                        </Brush>
                    </li>)}
                </ul>
            </div>
        </TopMenuPortal>
        <BrushWidthInput/>
    </>;
};
