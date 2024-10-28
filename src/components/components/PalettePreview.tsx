import '../../css/components/PalettePreview.css';
import { useState } from 'react';
import { uid } from '../../lib/uid';

export function PalettePreview({ palette, className, onMouseDown }: {
    palette: {
        colors: string[];
        name: string;
    };
    className?: string;
    onMouseDown?: () => void;
}) {
    const [id] = useState(uid());
    return <div className={'PalettePreview ' + className} onMouseDown={onMouseDown}>
        <div className='name'>
            {palette.name}
        </div>
        <ul>
            {palette.colors.map((color, i) => <li key={id + '-' + i}>
                <div className='color' style={{ background: color }}></div>
            </li>)}
        </ul>
    </div>;
}
