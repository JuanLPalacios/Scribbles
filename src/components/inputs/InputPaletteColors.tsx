import '../../css/inputs/InputPaletteColors.css';
import plusIcon from '../../icons/math-plus-svgrepo-com.svg';
import trashIcon from '../../icons/trash-svgrepo-com.svg';
import { useState, useRef } from 'react';
import { SerializedValue } from '../../lib/Serialization';
import { uid } from '../../lib/uid';
import { CustomInput } from '../../types/CustomInput';

export function InputPaletteColors({ value, name, className, onChange }: {
    value: string[];
    name: string;
    className?: string;
    onChange?: (e: React.ChangeEvent<CustomInput<SerializedValue>>) => void;
}) {
    const [color, setColor] = useState(value[0]||'#000000');
    const [selectedColor, setSelectedColor] = useState(0);
    const ref2 = useRef<HTMLInputElement>(null);
    const setPalette = (palette: string[]) => {
        if (ref2.current && onChange) {
            const target: EventTarget & PaletteInput = {
                ...ref2.current,
                value: palette,
                name: name || ''
            };
            const nativeEvent = new Event('change', { bubbles: false, cancelable: false, composed: true });
            const { bubbles, type, cancelable, defaultPrevented, eventPhase, isTrusted, preventDefault, stopPropagation, timeStamp } = nativeEvent;
            onChange({
                nativeEvent,
                currentTarget: target,
                target,
                bubbles,
                cancelable,
                defaultPrevented,
                eventPhase,
                isTrusted,
                preventDefault,
                isDefaultPrevented: () => false,
                stopPropagation,
                isPropagationStopped: () => false,
                persist: () => { },
                timeStamp,
                type
            });
        }
    };
    function addColor(color: string) {
        setPalette([...value, color]);
    }
    const [id] = useState(uid());
    return <div className={'InputPaletteColors ' + className}>
        <div className='InputColor' style={{ background: color }}>
            <input className='InputColor' type="color" onClick={(e)=>e.currentTarget.value = color} onChange={(e) => { setColor(e.target.value); setPalette(value.map((x,i)=>(i==selectedColor)?e.target.value:x)); }}/>
        </div>
        <div>
            <button onClick={()=>{ addColor(color); setSelectedColor(value.length); }}><img src={plusIcon} alt="Add Palette" /></button>
            <button onClick={()=>{ setPalette(value.filter((e, i)=>i!=selectedColor));setSelectedColor(Math.min(selectedColor, value.length-2)); }}><img src={trashIcon} alt="Delete Palette" /></button>
        </div>
        <input type="text" value={color} ref={ref2} style={{ display: 'none' }} />
        <ul className='color-list select-list'>
            {value.map((color, i) => <li key={id + '-' + i} className={(i==selectedColor)?'selected':''}>
                <div className='color' style={{ background: color }} onClick={(e) => { setColor(color); setSelectedColor(i); } }></div>
            </li>)}
        </ul>
    </div>;
}
export type PaletteInput = CustomInput<string[]>;
