import { useRef } from 'react';
import { DrawingState } from '../contexts/DrawingState';
import { CanvasEvent } from '../types/CanvasEvent';
import { MenuOptions } from '../contexts/MenuOptions';
import Layer from './Layer';

export function Drawing({ drawing, getPointer }:{ drawing: DrawingState, getPointer: (e: React.PointerEvent<HTMLDivElement>) => CanvasEvent<MenuOptions> }) {
    const { width, height, layers, selectedLayer } = drawing;
    const ref = useRef<HTMLDivElement>(null);
    return <div
        ref={ref}
        style={{ width: `${width}px`, height: `${height}px` }}
    >
        {layers.map((layer) => <Layer values={layer} key={layer.key} />)}
        {layers[selectedLayer].handles.map(({ key, icon, position, rotation, onMouseDown }) => <img
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

