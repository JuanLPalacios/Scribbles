import { useBrushesOptions } from '../../hooks/useBrushesOptions';
import { LeftMenuPortal } from '../portals/LeftMenu';

export const BrushWidthInput = () => {
    const [brushesOptions, setBrushesOptions] = useBrushesOptions();
    const { brushWidth } = brushesOptions;
    return <LeftMenuPortal>
        <label>
            <div>
                    brush width
            </div>
            <input {...{ orient: 'vertical' }} type="range" value={Math.sqrt(brushWidth)} step="0.1" min="1" max="16" onChange={(e) => setBrushesOptions({ ...brushesOptions, brushWidth: Math.pow(parseFloat(e.target.value), 2) })} />
        </label>
    </LeftMenuPortal>;
};
