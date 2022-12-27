import { Dispatch, SetStateAction } from 'react';
import { AlphaOptions } from '../../contexts/MenuOptions';
import { LeftMenuPortal } from '../portals/LeftMenu';

export const AlphaInput = (props:AlphaOptions & {onChange:Dispatch<SetStateAction<AlphaOptions>>}) => {
    const { alpha, onChange, ...config } = props;
    return <LeftMenuPortal>
        <label>
                 alpha
            <input type="range" value={alpha*255} min="0" max="255" onChange={(e) => onChange({ ...config, alpha: parseInt(e.target.value)/255 })} />
        </label>
    </LeftMenuPortal>;
};