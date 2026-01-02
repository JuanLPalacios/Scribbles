import '../../css/inputs/AlphaInput.css';
import { LeftMenuPortal } from '../portals/LeftMenu';
import { useAlphaOptions } from '../../hooks/useAlphaOptions';
import { useConfig } from '../../hooks/useConfig';

export const AlphaInput = () => {
    const [props, onChange] = useAlphaOptions();
    const { alpha } = props;
    const [config] = useConfig();
    const alphaInputMode = config?.alphaInput ?? 'slider';
    return <LeftMenuPortal>
        <label className={`AlphaInput display-${alphaInputMode}`}>
            <div>
                alpha
            </div>
            {alphaInputMode === 'slider' && <input type="range" value={alpha*255} min="0" max="255" onChange={(e) => onChange({ alpha: parseInt(e.target.value)/255 })} />}
            {alphaInputMode === 'list' && <select value={Math.round(alpha*255)} onChange={(e)=>onChange({ alpha: parseInt(e.target.value)/255 })} size={9}>
                {[0, 32, 64, 96, 128, 160, 192, 224, 255].map(value =>
                    <option
                        key={value}
                        value={value}
                        style={{
                            fontSize: 'var(--button-diameter)',
                            color: `rgba(255, 255, 255, ${value/255})`,
                            paddingInline: 'var(--button-diameter)',
                        }}>
                        ⬤
                    </option>)}
            </select>}
        </label>
    </LeftMenuPortal>;
};