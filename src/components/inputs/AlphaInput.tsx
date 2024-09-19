import { LeftMenuPortal } from '../portals/LeftMenu';
import { useAlphaOptions } from '../../hooks/useAlphaOptions';

export const AlphaInput = () => {
    const [props, onChange] = useAlphaOptions();
    const { alpha } = props;
    return <LeftMenuPortal>
        <label>
                 alpha
            <input type="range" value={alpha*255} min="0" max="255" onChange={(e) => onChange({ alpha: parseInt(e.target.value)/255 })} />
        </label>
    </LeftMenuPortal>;
};