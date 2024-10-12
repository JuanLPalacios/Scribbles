import  '../../css/inputs/ColorInput.css';
import { LeftMenuPortal } from '../portals/LeftMenu';
import { useColorOptions } from '../../hooks/useColorOptions';
import { uid } from '../../lib/uid';
import { useMemo } from 'react';
import { usePalette } from '../../hooks/usePalette';

export const ColorInput = () => {
    const [props, onChange] = useColorOptions();
    const [palette, { addColor }] = usePalette();
    const id = useMemo(()=>uid(), []);
    const { color } = props;
    return <LeftMenuPortal>
        <label className='ColorInput dropdown'>

            <button>
                color
                <div className='color' style={{ background: color }}>
                </div>
            </button>
            <ul>
                {palette.map((color, i) => <li key={id+'-'+i}>
                    <div className='color' style={{ background: color }} onMouseDown={()=>onChange({ color })}></div>
                </li>)}
                <li>
                    <div className='color'>
                        +
                        <input type="color" value={color} onMouseDown={(e)=>{ e.currentTarget.click(); }} onChange={(e) => onChange({ color: e.target.value })} onBlur={()=>addColor(color)} />
                    </div>
                </li>
            </ul>
        </label>
    </LeftMenuPortal>;
};

