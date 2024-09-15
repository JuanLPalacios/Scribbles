import { Dispatch, SetStateAction, useEffect } from 'react';
import { ToleranceOptions } from '../../contexts/MenuOptions';
import { BottomMenuPortal } from '../portals/BottomMenu';

export const ToleranceInput = (props:ToleranceOptions & {onChange:Dispatch<SetStateAction<ToleranceOptions>>}) => {
    const { tolerance, onChange, ...config } = props;
    useEffect(()=>{
        const c = 'ToleranceInput';
        console.log(c+'.mount');
        return ()=>{
            console.log(c+'.unmount');
        };
    }, []);
    return <BottomMenuPortal>
        <label>
                 tolerance
            <input type="range" value={tolerance}  step="0.01" min="0.01" max="1" onChange={(e) => onChange({ ...config, tolerance: parseFloat(e.target.value) })} />
        </label>
    </BottomMenuPortal>;
};