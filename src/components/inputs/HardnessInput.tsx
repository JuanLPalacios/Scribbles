import { useHardnessOptions } from '../../hooks/useHardnessOptions';
import { BottomMenuPortal } from '../portals/BottomMenu';

export const HardnessInput = () => {
    const [props, setHardness] = useHardnessOptions();
    const { hardness } = props;
    return <>
        <BottomMenuPortal>
            <label>
            hardness
                <input type="range" value={''+hardness} min="0" max="1" step="0.01" onChange={(e) => setHardness({
                    hardness: parseFloat(e.target.value)
                })} />
            </label>
        </BottomMenuPortal>
    </>;
};

