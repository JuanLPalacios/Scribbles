import  '../../css/inputs/ColorInput.css';
import { LeftMenuPortal } from '../portals/LeftMenu';
import { useColorOptions } from '../../hooks/useColorOptions';

export const ColorInput = () => {
    const [props, onChange] = useColorOptions();
    const { color } = props;
    return <LeftMenuPortal>
        <label className='ColorInput'>
                color
            <div className='color' style={{ background: color }}>
                <input type="color" value={color} onChange={(e) => onChange({ color: e.target.value })} />
            </div>
        </label>
    </LeftMenuPortal>;
};