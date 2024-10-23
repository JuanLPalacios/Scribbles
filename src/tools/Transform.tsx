import { uid } from '../lib/uid';
import { scalePoint, sub } from '../lib/DOMMath';
import { Handle } from '../types/Handle';
import { EditorLayerState, LayerState2 } from '../types/LayerState';
import square from '../icons/square-svgrepo-com.svg';
import hSkew from '../icons/arrows-h-alt-svgrepo-com.svg';
import vSkew from '../icons/arrows-v-alt-svgrepo-com.svg';
import rotateBottomLeft from '../icons/corner-double-bottom-left-svgrepo-com.svg';
import rotateBottomRight from '../icons/corner-double-bottom-right-svgrepo-com.svg';
import rotateTopLeft from '../icons/corner-double-top-left-svgrepo-com.svg';
import rotateTopRight from '../icons/corner-double-top-right-svgrepo-com.svg';
import { CanvasEvent } from '../types/CanvasEvent';
import { useEffect, useMemo } from 'react';
import { Tool, ToolContext, ToolFunctions } from '../contexts/ToolContext';
import { useDrawing } from '../hooks/useDrawing';
import { EditorDrawingState } from '../contexts/EditorDrawingContext';
import { DrawingState } from '../contexts/DrawingContext';
import { useConfig } from '../hooks/useConfig';
import { RectCut } from './cut/RectCut';
import { LasoCut } from './cut/LasoCut';

const SKEW_ICONS = [
    rotateTopLeft,
    vSkew,
    rotateBottomLeft,
    hSkew,
    rotateBottomRight,
    vSkew,
    rotateTopRight,
    hSkew
];

export type CutActions = {
    startCut: ({ point }: CanvasEvent, _layer: LayerState2 & EditorLayerState) => void;
    endCut: (e: CanvasEvent, layer: LayerState2 & EditorLayerState) => boolean;
    cut: ({ point }: CanvasEvent, layer: LayerState2 & EditorLayerState) => void;
}

export const Transform = ({ children }: ToolFunctions) => {
    const drawingController = useDrawing();
    const [{ doubleClickTimeOut }] = useConfig();
    const r = useMemo<Tool>(() => {
        let drawing: EditorDrawingState,
            updateLayer: (...[index, layer]: [number, Partial<LayerState2>] | [Partial<LayerState2>]) => void,
            forceUpdate: ({ data, editorState }: {
            data?: Partial<DrawingState>;
            editorState?: Partial<EditorDrawingState['editorState']>;
        })=>void;
        let cutActions:CutActions;
        let lastClickTime = 0;
        let center = new DOMPoint();
        let handleH: Handle[] = [];
        let pivot = new DOMPoint();
        let initAngle = 0;
        let handles:DOMPoint[] = [];
        let prevMatrix = new DOMMatrix();
        let inverseMatrix = new DOMMatrix();
        let matrix = new DOMMatrix();
        let axis: [boolean, boolean] = [false, false];
        let skewMode = false;
        let action: 'none' | 'scale' | 'rotate' | 'skew' | 'translate' | 'rect-cut' | 'transform' = 'none';

        const startTranslation = function(e: CanvasEvent, _layer: LayerState2){
            inverseMatrix = DOMMatrix.fromFloat32Array(matrix.inverse().toFloat32Array());
            const { point }  = e;
            const { x: projectionX, y: projectionY } = point.matrixTransform(inverseMatrix);
            const { x: width, y: height }  = handles[4];
            if(
                (projectionX<0)
            ||(projectionY<0)
            ||(projectionX>width)
            ||(projectionY>height)
            ) {
                action = 'none';
                return;
            }
            center = new DOMPoint(point.x, point.y);
            pivot = new DOMPoint(0, 0).matrixTransform(inverseMatrix);
            prevMatrix = matrix;
            action = 'translate';
        };

        const translate = function({ point: e }: CanvasEvent, layer:LayerState2&EditorLayerState){
            const movement =
        sub(
            pivot,
            new DOMPoint(
                e.x - center.x,
                e.y - center.y
            ).matrixTransform(inverseMatrix)
        );
            matrix =prevMatrix.translate(movement.x, movement.y);
            render(layer);
        };

        const startSkewering = function({ point: e }: CanvasEvent, _layer: LayerState2){
            inverseMatrix = DOMMatrix.fromFloat32Array(matrix.inverse().toFloat32Array());
            center = pivot.matrixTransform(matrix);
            prevMatrix = matrix;

            initAngle = Math.atan2(e.y - center.y, e.x - center.x);

            action = 'skew';
        };

        const skew = function({ point: e }: CanvasEvent, layer:LayerState2&EditorLayerState){
            const angle = Math.atan2(e.y - center.y, e.x - center.x) - initAngle;

            if(axis[0])
                matrix = prevMatrix.translate(pivot.x, pivot.y).skewY(
                    angle * 180 / Math.PI
                )
                    .translate(-pivot.x, -pivot.y);
            else
                matrix = prevMatrix.translate(pivot.x, pivot.y).skewX(
                    -angle * 180 / Math.PI
                )
                    .translate(-pivot.x, -pivot.y);
            render(layer);
        };

        const startScaling = function({ point: e }: CanvasEvent, layer:LayerState2&EditorLayerState){
            inverseMatrix = DOMMatrix.fromFloat32Array(matrix.inverse().toFloat32Array());
            center = pivot.matrixTransform(matrix);
            const dv = sub(
                new DOMPoint(0, 0).matrixTransform(inverseMatrix),
                new DOMPoint(e.x -center.x, e.y -center.y).matrixTransform(inverseMatrix)
            );
            const { x: w, y: h } = handles[4];
            prevMatrix = matrix;
            matrix = prevMatrix
                .scale(
                    axis[0] ? Math.abs(dv.x/w) : 1,
                    axis[1] ? Math.abs(dv.y/h) : 1,
                    1,
                    pivot.x,
                    pivot.y,
                    0
                );
            render(layer);
            action = 'scale';
        };

        const scale = function({ point: e }: CanvasEvent, layer:LayerState2&EditorLayerState){
            const dv = sub(
                new DOMPoint(0, 0).matrixTransform(inverseMatrix),
                new DOMPoint(e.x -center.x, e.y -center.y).matrixTransform(inverseMatrix)
            );
            const { x: w, y: h } = handles[4];
            matrix = prevMatrix
                .scale(
                    axis[0] ? Math.abs(dv.x/w) : 1,
                    axis[1] ? Math.abs(dv.y/h) : 1,
                    1,
                    pivot.x,
                    pivot.y,
                    0
                )
            ;
            render(layer);
        };

        const startRotation = function({ point: e }: CanvasEvent, _layer: LayerState2&EditorLayerState){
            inverseMatrix = DOMMatrix.fromFloat32Array(matrix.inverse().toFloat32Array());
            center = pivot.matrixTransform(matrix);
            prevMatrix = matrix;

            initAngle = Math.atan2(e.y - center.y, e.x - center.x);

            action = 'rotate';
        };

        const rotate = function({ point: e }: CanvasEvent, layer:LayerState2&EditorLayerState){
            const angle = Math.atan2(e.y - center.y, e.x - center.x) - initAngle;
            const subPivot = pivot.matrixTransform(prevMatrix);

            matrix = new DOMMatrix().translate(subPivot.x, subPivot.y)
                .rotate(
                    angle * 180 / Math.PI
                )
                .translate(-subPivot.x, -subPivot.y)
                .multiply(prevMatrix);
            render(layer);
        };

        const startRectCut = function(e: CanvasEvent, layer:LayerState2&EditorLayerState){
            action = 'rect-cut';
            cutActions = RectCut({
                callback([x, y]){
                    action = 'transform';
                    startTransform(e, layer, x, y);
                },
                drawing
            });
            cutActions = LasoCut({
                callback([x, y]){
                    action = 'transform';
                    startTransform(e, layer, x, y);
                },
                drawing
            });
            cutActions.startCut(e, layer);
        };

        const endRectCut = function(e: CanvasEvent, layer:LayerState2&EditorLayerState){
            if(!cutActions.endCut(e, layer)){
                action = 'none';
                return;
            }
        };

        const rectCut = function(e: CanvasEvent, layer:LayerState2&EditorLayerState){
            cutActions.cut(e, layer);
        };

        const startTransform = function(_e: CanvasEvent, layer:LayerState2&EditorLayerState, dx = 0, dy = 0){
            const { canvas } = layer;
            const { buffer } = drawing.editorState;
            const mw = buffer.canvas.width/2;
            const mh = buffer.canvas.height/2;

            center = new DOMPoint();
            pivot = new DOMPoint();
            initAngle = 0;
            prevMatrix = new DOMMatrix();
            inverseMatrix = new DOMMatrix();
            matrix = new DOMMatrix().translate(dx, dy);
            axis = [false, false];
            skewMode = false;
            action = 'transform';
            handles = [
                new DOMPoint(0, 0),
                new DOMPoint(0, mh),
                new DOMPoint(0, 2*mh),
                new DOMPoint(mw, 2*mh),
                new DOMPoint(2*mw, 2*mh),
                new DOMPoint(2*mw, mh),
                new DOMPoint(2*mw, 0),
                new DOMPoint(mw, 0)
            ];
            buffer.canvas.style.transformOrigin = 'top left';
            const createHandle = (position: DOMPoint, i: number):Handle => ({
                key: uid(),
                icon: '',
                position,
                rotation: new DOMMatrix(),
                onMouseDown: (i%2 === 0)?(e) => {
                    const { layers } = drawing.data;
                    const { selectedLayer, layers: editorLayers } = drawing.editorState;
                    const layer = { ...layers[selectedLayer], ...editorLayers[selectedLayer] };
                    axis = [true, true];
                    if(skewMode){
                        pivot = scalePoint(handles[4], .5);
                        startRotation(e, layer);
                    }
                    else{
                        pivot = handles[(i+4)%8];
                        startScaling(e, layer);
                    }
                    forceUpdate({ ...drawing });
                }:(e) => {
                    const { layers } = drawing.data;
                    const { selectedLayer, layers: editorLayers } = drawing.editorState;
                    const layer = { ...layers[selectedLayer], ...editorLayers[selectedLayer] };
                    axis = [(i%4 === 1), (i%4 !== 1)];
                    pivot = handles[(i+4)%8];
                    if(skewMode){
                        startSkewering(e, layer);
                    }
                    else{
                        startScaling(e, layer);
                    }
                    forceUpdate({ ...drawing });
                }
            });
            handleH = handles.map(createHandle);
            canvas.canvas.style.transform =
        new DOMMatrix()
            .translate(0, 0)
            .toString();
            render(layer);
            forceUpdate({ ...drawing });
        };

        const endTransform = function(_e: CanvasEvent, layer: LayerState2&EditorLayerState) {
            const { width, height } = drawing.data;
            const { buffer } = drawing.editorState;
            const { canvas } = layer;
            canvas.ctx.globalCompositeOperation = 'source-over';
            canvas.ctx.globalAlpha = 1;
            canvas.ctx.setTransform(matrix);
            canvas.ctx.drawImage(buffer.canvas, 0, 0);
            canvas.ctx.resetTransform();
            canvas.canvas.style.transform = '';
            buffer.canvas.width = canvas.canvas.width;
            buffer.canvas.height = canvas.canvas.height;
            buffer.canvas.style.transform = '';
            buffer.canvas.style.transformOrigin = 'top left';
            buffer.ctx?.clearRect(0, 0, buffer.canvas.width, buffer.canvas.width);
            drawing.editorState.handles = [];
            action = 'none';
            const imageData = canvas.ctx.getImageData(0, 0, width, height);
            updateLayer({ imageData });
        };

        const render = function(_layer: LayerState2) {
            const hx = Math.sqrt(matrix.b*matrix.b+matrix.a*matrix.a);
            const hy = Math.sqrt(matrix.d*matrix.d+matrix.c*matrix.c);
            const handleMatrix = new DOMMatrix([
                matrix.a, matrix.b,
                matrix.c, matrix.d,
                0, 0
            ]).scale(1/hx, 1/hy);
            drawing.editorState.handles = handleH.map((handle, i)=>({
                ...handle,
                icon: skewMode? SKEW_ICONS[i] : square,
                position: handles[i].matrixTransform(matrix),
                rotation: handleMatrix }));
            drawing.editorState.buffer.canvas.style.transform = matrix.toString();
        };
        return {
            setup(v?:ReturnType<typeof useDrawing>){
                if(!v)return;
                const [d, { updateLayer: u, forceUpdate: f }] = v;
                drawing = d;
                updateLayer = u;
                forceUpdate = f;
            },
            dispose(){
                const { layers } = drawing.data;
                const { selectedLayer, layers: editorLayers } = drawing.editorState;
                const layer = { ...layers[selectedLayer], ...editorLayers[selectedLayer] };
                if(action!='none')endTransform({ point: new DOMPoint() }, layer);
            },
            click({ point }){
                const { layers } = drawing.data;
                const { selectedLayer, layers: editorLayers } = drawing.editorState;
                const layer = { ...layers[selectedLayer], ...editorLayers[selectedLayer] };
                inverseMatrix = DOMMatrix.fromFloat32Array(matrix.inverse().toFloat32Array());
                const { x: projectionX, y: projectionY } = point.matrixTransform(inverseMatrix);
                const { x: width, y: height }  = handles[4];
                if(
                    (projectionX<0)
                ||(projectionY<0)
                ||(projectionX>width)
                ||(projectionY>height)
                ) return;
                const dt = Date.now() - lastClickTime;
                lastClickTime += dt;
                if(dt > doubleClickTimeOut) return;
                skewMode = !skewMode;
                render(layer);
                forceUpdate({ ...drawing });
            },
            mouseDown(e){
                const { layers } = drawing.data;
                const { selectedLayer, layers: editorLayers } = drawing.editorState;
                const layer = { ...layers[selectedLayer], ...editorLayers[selectedLayer] };
                switch(action){
                case 'none':
                    startRectCut(e, layer);
                    break;
                case 'transform':
                    startTranslation(e, layer);
                    break;
                }
            },
            mouseMove(e){
                const { layers } = drawing.data;
                const { selectedLayer, layers: editorLayers } = drawing.editorState;
                const layer = { ...layers[selectedLayer], ...editorLayers[selectedLayer] };

                switch(action){
                case 'scale':
                    scale(e, layer);
                    break;
                case 'skew':
                    skew(e, layer);
                    break;
                case 'rotate':
                    rotate(e, layer);
                    break;
                case 'translate':
                    translate(e, layer);
                    break;
                case 'rect-cut':
                    rectCut(e, layer);
                    break;
                }

                forceUpdate({ ...drawing });
            },
            mouseUp(e){
                const { layers } = drawing.data;
                const { selectedLayer, layers: editorLayers } = drawing.editorState;
                const layer = { ...layers[selectedLayer], ...editorLayers[selectedLayer] };
                switch(action){
                case 'rect-cut':
                    endRectCut(e, layer);
                    break;
                case 'none':
                    endTransform(e, layer);
                    break;
                default:
                    action = 'transform';
                    break;
                }

                //setDrawing({ type: 'editor/forceUpdate', payload: { ...drawing } });
            }
        };
    }, [doubleClickTimeOut]);
    useEffect(()=>{
        // FIXME this should use a reference instead
        r.setup(...([drawingController] as unknown as []));
    }, [drawingController, r]);
    useEffect(()=>{
        r.setup();
        return ()=>{
            r.dispose();
        };
    }, [r]);
    return <ToolContext.Provider value={r}>
        {children}
    </ToolContext.Provider>;
};
