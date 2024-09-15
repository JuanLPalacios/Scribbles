import { Dispatch, SetStateAction, useEffect } from 'react';
import { AlphaOptions } from '../../contexts/MenuOptions';
import { LeftMenuPortal } from '../portals/LeftMenu';

export const AlphaInput = (props:AlphaOptions & {onChange:Dispatch<SetStateAction<AlphaOptions>>}) => {
    const { alpha, onChange, ...config } = props;
    useEffect(()=>{
        const c = 'AlphaInput';
        console.log(c+'.mount');
        return ()=>{
            console.log(c+'.unmount');
        };
    }, []);
    return <LeftMenuPortal>
        <label>
                 alpha
            <input type="range" value={alpha*255} min="0" max="255" onChange={(e) => onChange({ ...config, alpha: parseInt(e.target.value)/255 })} />
        </label>
    </LeftMenuPortal>;
};