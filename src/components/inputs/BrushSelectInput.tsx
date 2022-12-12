import { Dispatch, SetStateAction } from 'react';
import { BrushOptions } from '../../contexts/MenuOptions';

export const BrushSelectInput = (props:BrushOptions & {onChange:Dispatch<SetStateAction<BrushOptions>>}) => {
    const { brushes, selectedBrush, brushWidth, onChange } = props;
    return <div>
        <label>
            brush
            <select value={selectedBrush} onChange={(e) => onChange({ ...props, selectedBrush: parseInt(e.target.value) })}>
                {brushes.map((brush, i) => <option key={i} value={i}>{i}</option>)}
            </select>
        </label>
        <label>
            Brush width
            <label>
                 alpha
                <input type="range" value={Math.sqrt(brushWidth)} step="0.1" min="1" max="32" onChange={(e) => onChange({ ...props, brushWidth: Math.pow(parseFloat(e.target.value), 2) })} />
            </label>
        </label>
    </div>;
};