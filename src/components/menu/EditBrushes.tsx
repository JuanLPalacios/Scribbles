
import { useCallback, useState, useEffect, useMemo } from 'react';
import '../../css/Menu.css';
import '../../css/menu/EditBrushes.css';
import brushIcon from '../../icons/brush-f-svgrepo-com.svg';
import importIcon from '../../icons/internal-svgrepo-com.svg';
import exportIcon from '../../icons/external-svgrepo-com.svg';
import plusIcon from '../../icons/math-plus-svgrepo-com.svg';
import trashIcon from '../../icons/trash-svgrepo-com.svg';
import clipboardIcon from '../../icons/duplicate-svgrepo-com.svg';
import ReactModal from 'react-modal';
import { DrawableState } from '../../types/DrawableState';
import { uid } from '../../lib/uid';
//import { abrBrushes } from 'abr-js';
import Brush from '../../abstracts/Brush';
import { InputImage } from '../inputs/InputImage';
import { useOpenFile } from '../../hooks/useOpenFile';
import { loadAbrBrushes } from 'abr-js';
import { abrToScribblesSerializable, brushFormObj, JSONValue, SerializedBrush } from '../../lib/Serialization';
import { SBR } from '../../lib/sbr';
import { saveAs } from 'file-saver';
import { CustomInput } from '../../types/CustomInput';
import { useStorage } from '../../hooks/useStorage';
import SolidBrush from '../../brushes/Solid';
import { useMenu } from '../../hooks/useMenu';
import { BrushPreview } from '../inputs/BrushPreview';
import { BrushList } from '../../lib/BrushList';

export const EditBrushes = () => {
    const [brushes, setBrushes] = useStorage<SerializedBrush[]>('brushes');
    const [options, setOptions] = useMenu();
    const [tempBrushes, setTempBrushes] = useState<{ brush: Brush; preview?: DrawableState; }[]>([]);
    const [id] = useState(uid());
    const [currentBrush, setBrush] = useState<SerializedBrush>({
    } as SerializedBrush);
    const [selectedBrushIndex, setSelectedBrushIndex] = useState(0);
    const [state, setState] = useState({ isOpen: false, isValid: false, errors: { name: new Array<string>(), width: new Array<string>(), height: new Array<string>() } });
    const { isOpen, isValid, errors } = state;
    const selectedBrush = tempBrushes[selectedBrushIndex] || { brush: new SolidBrush() };
    const addBrush = useCallback(() => {
        setTempBrushes([
            ...tempBrushes,
            { brush: new SolidBrush() }
        ]);
    }, [tempBrushes]);
    const deleteBrush = useCallback(() => {
        setTempBrushes(tempBrushes.filter((_x, i)=>i!=selectedBrushIndex));
    }, [selectedBrushIndex, tempBrushes]);
    const duplicateBrush = useCallback(() => {
        setTempBrushes([...tempBrushes, { brush: brushFormObj(selectedBrush.brush.toObj() as SerializedBrush) }]);
    }, [selectedBrush.brush,  tempBrushes]);
    const importBrush = useOpenFile((files)=>{
        if(files.length==0)return;
        const file = files[0];
        const extension = file.name.split('.').pop();
        switch (extension) {
        case 'abr':
            loadAbrBrushes(file)
                .then(brushesData=>{
                    setTempBrushes([
                        ...tempBrushes,
                        ...brushesData
                            .map(x=>(x as AbrBrush))
                            .map(abrToScribblesSerializable)
                            .map(brushFormObj)
                            .map(brush=>({ brush }))
                    ]);
                })
                .catch(e=>console.error(e));

            break;
        case 'sbr':
            SBR.jsonObj(file)
                .then(brushesData=>{
                    setTempBrushes([
                        ...tempBrushes,
                        ...brushesData
                            .map(x=>(x as SerializedBrush))
                            .map(brushFormObj)
                            .map(brush=>({ brush }))
                    ]);
                })
                .catch(e=>console.error(e));

            break;
        }
    }, [tempBrushes],
    { accept: '.abr, .sbr' }
    );
    const exportBrush = async ()=>{
        const blob = await SBR.binary(tempBrushes.map(pack=>pack.brush.toObj()));
        saveAs(blob, 'brushes.sbr');
    };
    const update = useCallback((e:React.ChangeEvent<CustomInput<JSONValue>|HTMLSelectElement>) => {
        let value;
        if(e.target.name!='scribbleBrushType')
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
        else
            value = +e.target.value;
        setBrush({ ...currentBrush, [e.target?.name]: value });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);
    const save = useCallback(() => {
        setState({ ...state, isOpen: false });
        setOptions({
            ...options,
            brushesPacks: tempBrushes
                .map(x=>x.brush.toObj())
                .map(x=>(x as SerializedBrush))
                .map(brushFormObj)
                .map(brush=>({ brush }))
        });
        setBrushes(
            tempBrushes
                .map(x=>x.brush.toObj())
                .map(x=>(x as SerializedBrush))
        );
    }, [options, setBrushes, setOptions, state, tempBrushes]);
    const close = useCallback(() => {
        setState({ ...state, isOpen: false });
    }, [state]);
    const openModal = useCallback(() => {
        setState({ ...state, isOpen: true });
        setTempBrushes(
            (brushes||[]).map(brushFormObj)
                .map(brush=>({ brush }))
        );
    }, [brushes, state]);
    useEffect(() => {
        setBrush(selectedBrush.brush.toObj() as SerializedBrush);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedBrushIndex]);
    useMemo(() => {
        const errors = { name: new Array<string>(), width: new Array<string>(), height: new Array<string>() };
        if(('name' in currentBrush)&&(typeof currentBrush.name == 'string'))
            if(currentBrush.name.match(/[.,#%&{}\\<>*?/$!'":@+`|=]/gi))
                errors.name.push('Should not contain forbidden characters');
        const isValid = Object.values(errors).reduce((total, value)=> total + value.length, 0) === 0;
        if((isValid)&&(tempBrushes.length>selectedBrushIndex)){
            selectedBrush.brush.loadObj(currentBrush);
        }
        if(isValid)setTempBrushes(tempBrushes.map((x, i)=>(selectedBrushIndex===i)?{ ...x, brush: brushFormObj(currentBrush as SerializedBrush) }:x));
        setState({ ...state, errors, isValid });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentBrush]);
    return <>
        <li>
            <button className='round-btn' onClick={openModal}>
                <img src={brushIcon} alt="Import Brushes" />
            </button>
            <div className="text">Import Brushes</div>
        </li>
        <ReactModal isOpen={isOpen} onRequestClose={close} style={{ content: { width: '20rem' } }}>
            <div className="fields import-brush">
                <h2>Brushes</h2>
                <div>
                    <button onClick={addBrush}><img src={plusIcon} alt="Add Brush" /></button>
                    <button onClick={duplicateBrush}><img src={clipboardIcon} alt="Duplicate Brush" /></button>
                    <button onClick={deleteBrush}><img src={trashIcon} alt="Delete Brush" /></button>
                    <button onClick={importBrush}><img src={importIcon} alt="Import Brushes" /></button>
                    <button onClick={exportBrush}><img src={exportIcon} alt="Export Brushes" /></button>
                </div>
                <div className='errors'>
                    {errors.name.map((error, i) => <div key={'error.name-'+i} className='error'>Name: {error}</div>)}
                </div>
                <div style={{ display: 'flex' }}>
                    <div className='brush-list' style={{ width: '10rem', flex: '1 1 auto' }}>
                        <ul className='brushes'>
                            {tempBrushes.map((brush, i) => <li key={id+'-'+i}><BrushPreview brush={brush} selected={i==selectedBrushIndex} onMouseDown={()=>setSelectedBrushIndex(i)} /></li>)}
                        </ul>
                    </div>
                    <div style={{ width: '8rem' }} className='brush-props'>
                        {('scribbleBrushType' in currentBrush)&&(typeof currentBrush.scribbleBrushType == 'number') &&
                            <label>
                                <div>
                                Type
                                </div>
                                <select name="scribbleBrushType" value={currentBrush.scribbleBrushType} onChange={update}>
                                    {Object.values(BrushList)
                                        .filter(x=>(typeof x == 'number'))
                                        .map((key)=><option value={key} >{BrushList[key]}</option>)}
                                </select>
                            </label>}
                        {('name' in currentBrush)&&(typeof currentBrush.name == 'string') &&
                            <label>
                                <div>
                                Name
                                </div>
                                <input type="text" name='name' autoComplete="off" value={currentBrush.name} onChange={update} />
                            </label>}
                        {('brushTipImage' in currentBrush)
                        &&(typeof currentBrush.brushTipImage == 'object')
                        &&('type' in currentBrush.brushTipImage)
                        &&(currentBrush.brushTipImage.type == 'img')&&
                            <label>
                                <div>
                                Tip
                                </div>
                                <InputImage name='brushTipImage' value={currentBrush.brushTipImage} onChange={update} style={{ width: '3rem', height: '3rem' }} />
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
                    <button disabled={!isValid} onClick={save}>save</button>
                    <button onClick={close}>cancel</button>
                </div>
            </div>
        </ReactModal>
    </>;
};