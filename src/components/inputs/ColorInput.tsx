import  '../../css/inputs/ColorInput.css';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { ColorOptions } from '../../contexts/MenuOptions';
import { LeftMenuPortal } from '../portals/LeftMenu';

export const ColorInput = (props:ColorOptions & {onChange:Dispatch<SetStateAction<ColorOptions>>}) => {
    const { color, onChange, ...config } = props;
    useEffect(()=>{
        const c = 'ColorInput';
        console.log(c+'.mount');
        return ()=>{
            console.log(c+'.unmount');
        };
    }, []);
    return <LeftMenuPortal>
        <label className='ColorInput'>
                color
            <div className='color' style={{ background: color }}>
                <input type="color" value={color} onChange={(e) => onChange({ ...config, color: e.target.value })} />
            </div>
        </label>
    </LeftMenuPortal>;
};