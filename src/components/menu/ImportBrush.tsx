import { useCallback, useContext, useState, useEffect } from 'react';
import '../../css/Menu.css';
import demoStroke from '../../demo/strokePreview.json';
import importIcon from '../../icons/brush-f-svgrepo-com.svg';
import { createLayer } from '../../generators/createLayer';
import { EditorContext } from '../../contexts/DrawingState';
import ReactModal from 'react-modal';
import { DrawableState } from '../../types/DrawableState';
import { MenuContext } from '../../contexts/MenuOptions';
import { createDrawable } from '../../generators/createDrawable';
import Brush from '../../abstracts/Brush';
import { Drawable } from '../Drawable';
import { uid } from '../../lib/uid';

let previews:{previews:DrawableState[], selectedPreview:DrawableState}|undefined;
let lastBrushes: Brush[];

export const ImportBrush = () => {
    const menuContext = useContext(MenuContext);
    const [options] = menuContext;
    const {
        brushes
    } = options;
    const [id] = useState(uid());
    const [state2, onChange] = useState({ selectedBrush: 0 });
    const { selectedBrush } = state2;
    const [editor, editorDispatch] = useContext(EditorContext);
    const [state, setState] = useState({ isOpen: false, name: '', width: 600, height: 600, isValid: false, errors: { name: new Array<string>(), width: new Array<string>(), height: new Array<string>() } });
    const { isOpen, name, width, height, isValid, errors } = state;
    const update = useCallback((e:React.ChangeEvent<HTMLInputElement>) => {
        let value;
        switch (e.target.type){
        case('number'):
            value = +e.target.value;
            break;
        default:
            value = e.target.value;
            break;
        }
        setState({ ...state, [e.target?.name]: value });
    }, [state]);
    const close = useCallback(() => {
        setState({ ...state, isOpen: false });
    }, [state]);
    const openModal = useCallback(() => {
        const { width, height } = editor.drawing || { width: 600, height: 600 };
        setState({ ...state, isOpen: true, width, height });
    }, [editor, state]);
    const newfile = useCallback(() => {
        editorDispatch({
            type: 'editor/load',
            payload: {
                name,
                drawing: {
                    width,
                    height,
                    layers: [
                        createLayer(
                            'Image',
                            {
                                position: [0, 0],
                                size: [width, height]
                            }
                        ),
                    ],
                    selectedLayer: 0
                }
            }
        });
        close();
    }, [close, height, name, editorDispatch, width]);
    useEffect(() => {
        const errors = { name: new Array<string>(), width: new Array<string>(), height: new Array<string>() };
        if(name.length<1)
            errors.name.push('Must have at least 1 character');
        if(name.match(/[.,#%&{}\\<>*?/$!'":@+`|=]/gi))
            errors.name.push('Shuld not contain forbidden characters');
        setState({ ...state, errors, isValid: Object.values(errors).reduce((total, value)=> total + value.length, 0) === 0 });
    }, [height, name, width]);
    useEffect(()=>{
        if(lastBrushes !== brushes){
            lastBrushes = brushes;
            console.log('render previews');
            previews = { previews: brushes.map(() => createPreview()), selectedPreview: createPreview() };
            previews.previews.forEach((preview, i) => brushes[i].renderPreview(preview, demoStroke as any, '#ffffff', .5 || 1, 15));
        }
    }, [brushes]);
    return <>
        <li>
            <button className='round-btn' onClick={openModal}>
                <img src={importIcon} alt="Import Brushes" />
            </button>
            <div className="text">Import Brushes</div>
        </li>
        <ReactModal isOpen={isOpen} onRequestClose={close} style={{ content: { width: '20rem' } }}>
            <div className="fields import-brush">
                <h2>Brushes</h2>
                <div className='errors'>
                    {errors.name.map((error, i) => <div key={'error.name-'+i} className='error'>Name: {error}</div>)}
                </div>
                <div style={{ width: '19rem', display: 'flex' }}>
                    <div className='brush-list' style={{ width: '10rem', flex: '1 1 auto' }}>
                        <ul className='brushes'>
                            {previews?.previews.map(({ canvas }, i) => <li key={id+'-'+i}><Drawable canvas={canvas} className={i==selectedBrush ? 'selected' : ''} onMouseDown={()=>onChange({ ...state2, selectedBrush: i })} /></li>)}
                        </ul>
                    </div>
                    <div style={{ width: '7rem' }}>
                        <label>
                            Name
                            <input type="text" name='name' autoComplete="off" value={name} onChange={update} />
                        </label>
                        <label>
                            Width
                            <input type="number" min={1} name='width' value={width} onChange={update} />
                        </label>
                        <label>
                            Height
                            <input type="number" min={1} name='height' value={height} onChange={update} />
                        </label>

                    </div>
                </div>
                <div className='actions'>
                    <button onClick={newfile} disabled={!isValid}>create</button>
                    <button onClick={close}>cancel</button>
                </div>
            </div>
        </ReactModal>
    </>;
};

const createPreview = () => createDrawable({ size: [150, 30] });
