import { useRef } from 'react';
import { CanvasEvent } from '../types/CanvasEvent';
import { MenuOptions } from '../contexts/MenuOptions';
import Layer from './Layer';
import { EditorState } from '../contexts/EditorContext';

export function Drawing({ drawing: { data, editor }, getPointer }:{ drawing: NonNullable<EditorState['drawing']>, getPointer: (e: React.PointerEvent<HTMLDivElement>) => CanvasEvent<MenuOptions> }) {
    const { width, height, layers } = data;
    const { selectedLayer, layers: editorLayers, buffer } = editor;
    const ref = useRef<HTMLDivElement>(null);
    return <div
        ref={ref}
        style={{ width: `${width}px`, height: `${height}px` }}
    >
        {layers.map((layer, i)=>({ layer, editorLayer: editorLayers[i] })).map(({ layer, editorLayer }, i) => <Layer key={editorLayer.key} values={layer} buffer={(selectedLayer==i)?buffer:undefined} editor={editorLayer} />)}
        {editorLayers[selectedLayer].handles.map(({ key, icon, position, rotation, onMouseDown }) => <img
            key={key}
            src={icon}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: '24px',
                height: '24px',
                transform: `translate(${-12}px, ${-12}px) ${rotation}`
            }}
            alt=""
            draggable="false"
            onPointerDown={e => onMouseDown(getPointer(e))} />)}
    </div>;
}

