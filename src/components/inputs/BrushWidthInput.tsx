import { useEffect, useState } from 'react';
import { useBrushesOptions } from '../../hooks/useBrushesOptions';
import { useEditor } from '../../hooks/useEditor';
import { LeftMenuPortal } from '../portals/LeftMenu';

export const BrushWidthInput = () => {
    const [brushesOptions, setBrushesOptions] = useBrushesOptions();
    const { brushWidth } = brushesOptions;
    const [{ drawing }] = useEditor();
    const { editorState: { transform } } = drawing || { editorState: { transform: new DOMMatrix() } };
    const [refState, setRefState] = useState<'hidden'|'vanishing'|'visible'>('hidden');
    useEffect(()=>{
        setRefState('visible');
        const vanishId = setTimeout(()=>{
            setRefState('vanishing');
        }, 100);
        const hideId = setTimeout(()=>{
            setRefState('hidden');
        }, 1100);
        return ()=>{
            clearTimeout(vanishId);
            clearTimeout(hideId);
        };
    }, [brushWidth]);
    return <LeftMenuPortal>
        <label className='BrushWidthInput'>
            <div>
                    brush width
            </div>
            <input {...{ orient: 'vertical' }} type="range" value={Math.sqrt(brushWidth)} step="0.1" min="1" max="16" onChange={(e) => setBrushesOptions({ ...brushesOptions, brushWidth: Math.pow(parseFloat(e.target.value), 2) })} />
            <div className={`brush-reference ${refState}`} style={{
                borderRadius: `${brushWidth*transform.a/2}px`,
                width: `${brushWidth*transform.a}px`,
                height: `${brushWidth*transform.a}px`,
                left: `max(var(--button-diameter), calc(2 * var(--button-diameter) - ${brushWidth*transform.a/2}px))` }}></div>
        </label>
    </LeftMenuPortal>;
};
