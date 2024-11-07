import { BottomMenuPortal } from '../portals/BottomMenu';
import { useToleranceOptions } from '../../hooks/useToleranceOptions';

export const ToleranceInput = () => {
    const [props, onChange] = useToleranceOptions();
    const { tolerance } = props;
    return <BottomMenuPortal>
        <label>
                 tolerance
            <input type="range" value={tolerance}  step="0.01" min="0.01" max="1" onChange={(e) => onChange({ tolerance: parseFloat(e.target.value) })} />
        </label>
    </BottomMenuPortal>;
};