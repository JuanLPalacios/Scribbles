import { Dispatch, SetStateAction } from 'react';
import { ColorOptions } from '../../contexts/MenuOptions';
import { LeftMenuPortal } from '../portals/LeftMenu';

export const ColorInput = (props:ColorOptions & {onChange:Dispatch<SetStateAction<ColorOptions>>}) => {
    const { color, onChange, ...config } = props;
    return <LeftMenuPortal>
        <label>
                color
            <input type="color" value={color} onChange={(e) => onChange({ ...config, color: e.target.value })} />
        </label>
    </LeftMenuPortal>;
};