import  '../../css/inputs/ColorInput.css';
import { LeftMenuPortal } from '../portals/LeftMenu';
import { useColorOptions } from '../../hooks/useColorOptions';
import { uid } from '../../lib/uid';
import { useMemo, useRef, useState } from 'react';
import { usePalette } from '../../hooks/usePalette';
import { InputColor } from './InputColor';

export const ColorInput = () => {
    const [props, onChange] = useColorOptions();
    const [palette, { addColor }] = usePalette();
    const [alreadyOpen, setAlreadyOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const id = useMemo(()=>uid(), []);
    const { color } = props;
    return <LeftMenuPortal>
        <label className='ColorInput dropdown'>

            <button ref={buttonRef} onMouseDown={(e)=>{
                // Toggle: if already focused within this dropdown
                const dropdown = e.currentTarget.closest('.dropdown');
                if (dropdown?.matches(':focus-within')) {
                    setAlreadyOpen(true);                    return;
                }
            }} onClick={e=>{
                // blur to close
                if (alreadyOpen){
                    e.currentTarget.blur();
                    setAlreadyOpen(false);
                }
            }}>
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
                        <InputColor value={color} onChange={e=>{ onChange({ color: e.target.value }); }}  onBlur={(e)=>{ addColor(e.target.value); onChange({ color: e.target.value }); }} />
                    </div>
                </li>
            </ul>
        </label>
    </LeftMenuPortal>;
};

