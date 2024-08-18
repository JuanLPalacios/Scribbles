/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useContext, useState, useEffect } from 'react';
import '../../css/Menu.css';
import '../../css/menu/EditBrushes.css';
import demoStroke from '../../demo/strokePreview.json';
import importIcon from '../../icons/brush-f-svgrepo-com.svg';
import { EditorContext } from '../../contexts/DrawingState';
import ReactModal from 'react-modal';
import { DrawableState } from '../../types/DrawableState';
import { MenuContext } from '../../contexts/MenuOptions';
import { createDrawable } from '../../generators/createDrawable';
import { Drawable } from '../Drawable';
import { uid } from '../../lib/uid';
//import { abrBrushes } from 'abr-js';
import Brush from '../../abstracts/Brush';
import { InputImage } from '../inputs/InputImage';

let previews:{previews:DrawableState[], selectedPreview:DrawableState}|undefined;
let lastBrushes: Brush[];

export const EditBrushes = () => {
    const menuContext = useContext(MenuContext);
    const [options] = menuContext;
    const {
        brushes
    } = options;
    const [id] = useState(uid());
    const [currentBrush, setBrush] = useState<any>({
        scribbleBrushType: 2,
        spacing: 15,
        antiAliasing: false,
        brushTipImage: {},
    });
    const [state2, onChange] = useState({ selectedBrush: 0 });
    const { selectedBrush } = state2;
    const [editor] = useContext(EditorContext);
    const [state, setState] = useState({ isOpen: false, isValid: false, errors: { name: new Array<string>(), width: new Array<string>(), height: new Array<string>() } });
    const { isOpen, isValid, errors } = state;
    const update = useCallback((e:React.ChangeEvent<HTMLInputElement>) => {
        let value;
        switch (e.target.type){
        case('number'):
            value = +e.target.value;
            break;
        case('checkbox'):
            value = e.target.checked;
            break;
        default:
            value = e.target.value;
            break;
        }
        setBrush({ ...currentBrush, [e.target?.name]: value });
    }, [state]);
    const close = useCallback(() => {
        setState({ ...state, isOpen: false });
    }, [state]);
    const openModal = useCallback(() => {
        setState({ ...state, isOpen: true });
    }, [editor, state]);
    useEffect(() => {
        setBrush(brushes[selectedBrush].toObj());
    }, [selectedBrush]);
    useEffect(() => {
        const errors = { name: new Array<string>(), width: new Array<string>(), height: new Array<string>() };
        if(('name' in currentBrush)&&(typeof currentBrush.name == 'string'))
            if(currentBrush.name.match(/[.,#%&{}\\<>*?/$!'":@+`|=]/gi))
                errors.name.push('Should not contain forbidden characters');
        const isValid = Object.values(errors).reduce((total, value)=> total + value.length, 0) === 0;
        if(isValid){
            brushes[selectedBrush].loadObj(currentBrush);
            if(previews)brushes[selectedBrush].renderPreview(previews.previews[selectedBrush], demoStroke as any, '#ffffff', .5 || 1, 15);
        }
        setState({ ...state, errors, isValid });
    }, [currentBrush]);
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
                <div style={{ display: 'flex' }}>
                    <div className='brush-list' style={{ width: '10rem', flex: '1 1 auto' }}>
                        <ul className='brushes'>
                            {previews?.previews.map(({ canvas }, i) => <li key={id+'-'+i}><Drawable canvas={canvas} className={i==selectedBrush ? 'selected' : ''} onMouseDown={()=>onChange({ ...state2, selectedBrush: i })} /></li>)}
                        </ul>
                    </div>
                    <div style={{ width: '8rem' }} className='brush-props'>
                        {('name' in currentBrush)&&(typeof currentBrush.name == 'string') &&
                            <label>
                                <div>
                                Name
                                </div>
                                <input type="text" name='name' autoComplete="off" value={currentBrush.name} onChange={update} />
                            </label>}
                        {('brushTipImage' in currentBrush)&&(typeof currentBrush.brushTipImage == 'string') &&
                            <label>
                                <div>
                                Tip
                                </div>
                                <InputImage name='brushTipImage' value={currentBrush.brushTipImage} onChange={update} style={{ width: '5rem' }} />
                            </label>
                        }
                        {('roundness' in currentBrush)&&(typeof currentBrush.roundness == 'number') &&
                            <label>
                                <div>
                                Roundness
                                </div>
                                <input type="number" name='roundness' value={currentBrush.roundness} min={0} max={1} step={0.01} onChange={update} style={{ width: '5rem' }} />
                            </label>
                        }
                        {('hardness' in currentBrush)&&(typeof currentBrush.hardness == 'number') &&
                            <label>
                                <div>
                                Hardness
                                </div>
                                <input type="number" name='hardness' value={currentBrush.hardness} min={0} max={1} step={0.01} onChange={update} style={{ width: '5rem' }} />
                            </label>
                        }
                        {('angle' in currentBrush)&&(typeof currentBrush.angle == 'number') &&
                            <label>
                                <div>
                                Angle
                                </div>
                                <input type="number" name='angle' value={currentBrush.angle} min={0} max={359} onChange={update} style={{ width: '5rem' }} />
                            </label>
                        }
                        {('diameter' in currentBrush)&&(typeof currentBrush.diameter == 'number') &&
                            <label>
                                <div>
                                Diameter
                                </div>
                                <input type="number" name='diameter' value={currentBrush.diameter} min={0} max={5} step={0.05} onChange={update} style={{ width: '5rem' }} />
                            </label>
                        }
                        {('spacing' in currentBrush)&&(typeof currentBrush.spacing == 'number') &&
                            <label>
                                <div>
                                Spacing
                                </div>
                                <input type="number" name='spacing' value={currentBrush.spacing} min={0} max={30} step={0.1} onChange={update} style={{ width: '5rem' }} />
                            </label>
                        }
                        {('antiAliasing' in currentBrush)&&(typeof currentBrush.antiAliasing == 'number') &&
                            <label>
                                <div>
                                Anti aliasing
                                </div>
                                <input type="checkbox" name='antiAliasing' value={currentBrush.antiAliasing} onChange={update} style={{ width: '5rem' }} />
                            </label>
                        }
                        antiAliasing
                    </div>
                </div>
                <div className='actions'>
                    <button disabled={!isValid}>save</button>
                    <button onClick={close}>cancel</button>
                </div>
            </div>
        </ReactModal>
    </>;
};

const createPreview = () => createDrawable({ size: [150, 30] });
