
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
import { InputImage } from '../inputs/InputImage';
import { useOpenFile } from '../../hooks/useOpenFile';
import { loadAbrBrushes } from 'abr-js';
import { abrToScribblesSerializable, isSerializedImageData, SerializedBrush, SerializedValue } from '../../lib/Serialization';
import { SBR } from '../../lib/sbr';
import { saveAs } from 'file-saver';
import { CustomInput } from '../../types/CustomInput';
import { BrushList } from '../../lib/BrushList';
import { BRUSH_TYPE_LIST, BrushC } from '../../abstracts/BrushC';
import { BrushPreview } from '../inputs/BrushPreview';
import { useBrushesOptions } from '../../hooks/useBrushesOptions';
import { useStoredBrushes } from '../../hooks/useStoredBrushes';

export const EditBrushes = () => {
    const [brushes, setBrushes] = useStoredBrushes();
    const [{ brushWidth, selectedBrush }, setBrushesOptions] = useBrushesOptions();
    const [tempBrushes, setTempBrushes] = useState<{ brush: SerializedBrush; preview?: DrawableState; }[]>([]);
    const [id] = useState(uid());
    const [currentBrush, setBrush] = useState<SerializedBrush>({
    } as SerializedBrush);
    const [selectedBrushIndex, setSelectedBrushIndex] = useState(0);
    const [state, setState] = useState({ isOpen: false, isValid: false, errors: { name: new Array<string>(), width: new Array<string>(), height: new Array<string>() } });
    const { isOpen, isValid, errors } = state;
    const editorSelectedBrush = tempBrushes[selectedBrushIndex] || { brush: BRUSH_TYPE_LIST[0][1] };
    const addBrush = useCallback(() => {
        setTempBrushes([
            ...tempBrushes,
            { brush: { scribbleBrushType: BrushList.Solid } as any }
        ]);
    }, [tempBrushes]);
    const deleteBrush = useCallback(() => {
        setTempBrushes(tempBrushes.filter((_x, i)=>i!=selectedBrushIndex));
    }, [selectedBrushIndex, tempBrushes]);
    const duplicateBrush = useCallback(() => {
        setTempBrushes([...tempBrushes, { brush: editorSelectedBrush.brush }]);
    }, [editorSelectedBrush.brush,  tempBrushes]);
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
        const blob = await SBR.binary(tempBrushes.map(pack=>pack.brush));
        saveAs(blob, 'brushes.sbr');
    };
    const update = useCallback((e:React.ChangeEvent<CustomInput<SerializedValue>|HTMLSelectElement>) => {
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
        setBrushesOptions({
            brushWidth,
            selectedBrush,
            brushesPacks: tempBrushes
                .map(x=>x.brush)
                .map(x=>(x as SerializedBrush))
                .map(brush=>({ brush }))
        });
        setBrushes(
            tempBrushes
                .map(x=>x.brush)
                .map(x=>(x as SerializedBrush))
        );
    }, [brushWidth, selectedBrush, setBrushes, setBrushesOptions, state, tempBrushes]);
    const close = useCallback(() => {
        setState({ ...state, isOpen: false });
    }, [state]);
    const openModal = useCallback(() => {
        setState({ ...state, isOpen: true });
        setTempBrushes(
            (brushes||[])
                .map(brush=>({ brush }))
        );
    }, [brushes, state]);
    useEffect(() => {
        setBrush(editorSelectedBrush.brush);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedBrushIndex]);
    const currentBrushProxy = useMemo(() => {
        const currentBrushProxy:SerializedBrush = { ...(BRUSH_TYPE_LIST.map(x=>x[1]).find(x=>x.scribbleBrushType==currentBrush.scribbleBrushType)|| BRUSH_TYPE_LIST[0][1]) };
        Object.keys(currentBrushProxy).forEach((x)=>{
            const key = x as keyof SerializedBrush;
            currentBrushProxy[key] = ((currentBrush[key]!==undefined)?currentBrush[key]:currentBrushProxy[key]) as never;
        });
        return currentBrushProxy;
    }, [currentBrush]);
    useMemo(() => {
        const errors = { name: new Array<string>(), width: new Array<string>(), height: new Array<string>() };
        if(('name' in currentBrush)&&(typeof currentBrush.name == 'string'))
            if(currentBrush.name.match(/[.,#%&{}\\<>*?/$!'":@+`|=]/gi))
                errors.name.push('Should not contain forbidden characters');
        const isValid = Object.values(errors).reduce((total, value)=> total + value.length, 0) === 0;
        if((isValid)&&(tempBrushes.length>selectedBrushIndex)){
            editorSelectedBrush.brush = currentBrushProxy;
        }
        if(isValid)setTempBrushes(tempBrushes.map((x, i)=>(selectedBrushIndex===i)?{ ...x, brush: currentBrush }:x));
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
                            {tempBrushes.map((brush, i) => <li key={id+'-'+i}>
                                <BrushC brush={brush.brush}>
                                    <BrushPreview brush={brush} selected={i==selectedBrushIndex} onMouseDown={()=>setSelectedBrushIndex(i)} />
                                </BrushC>
                            </li>)}
                        </ul>
                    </div>
                    <div style={{ width: '8rem' }} className='brush-props'>
                        {('scribbleBrushType' in currentBrushProxy)&&(typeof currentBrushProxy.scribbleBrushType == 'number') &&
                        <label>
                            <div>
                            Type
                            </div>
                            <select name="scribbleBrushType" value={currentBrushProxy.scribbleBrushType} onChange={update}>
                                {Object.values(BrushList)
                                    .filter(x=>(typeof x == 'number'))
                                    .map((value, i)=><option  key={id+'-options-'+i} value={value} >{BrushList[value]}</option>)}
                            </select>
                        </label>}
                        {('name' in currentBrushProxy)&&(typeof currentBrushProxy.name == 'string') &&
                        <label>
                            <div>
                            Name
                            </div>
                            <input type="text" name='name' autoComplete="off" value={currentBrushProxy.name} onChange={update} />
                        </label>}
                        {('brushTipImage' in currentBrushProxy)
                        &&(typeof currentBrushProxy.brushTipImage == 'object')
                        &&(isSerializedImageData(currentBrushProxy.brushTipImage))&&
                        <label>
                            <div>
                            Tip
                            </div>
                            <InputImage name='brushTipImage' value={currentBrushProxy.brushTipImage} onChange={update} style={{ width: '3rem', height: '3rem' }} />
                        </label>
                        }
                        {('brushPatternImage' in currentBrushProxy)
                        &&(typeof currentBrushProxy.brushPatternImage == 'object')
                        &&(isSerializedImageData(currentBrushProxy.brushPatternImage))&&
                        <label>
                            <div>
                            Pattern
                            </div>
                            <InputImage name='brushPatternImage' value={currentBrushProxy.brushPatternImage} onChange={update} style={{ width: '3rem', height: '3rem' }} />
                        </label>
                        }
                        {('roundness' in currentBrushProxy)&&(typeof currentBrushProxy.roundness == 'number') &&
                        <label>
                            <div>
                            Roundness
                            </div>
                            <input type="number" name='roundness' value={currentBrushProxy.roundness} min={0} max={1} step={0.01} onChange={update} style={{ width: '5rem' }} />
                        </label>
                        }
                        {('hardness' in currentBrushProxy)&&(typeof currentBrushProxy.hardness == 'number') &&
                        <label>
                            <div>
                            Hardness
                            </div>
                            <input type="number" name='hardness' value={currentBrushProxy.hardness} min={0} max={1} step={0.01} onChange={update} style={{ width: '5rem' }} />
                        </label>
                        }
                        {('angle' in currentBrushProxy)&&(typeof currentBrushProxy.angle == 'number') &&
                        <label>
                            <div>
                            Angle
                            </div>
                            <input type="number" name='angle' value={currentBrushProxy.angle} min={0} max={359} onChange={update} style={{ width: '5rem' }} />
                        </label>
                        }
                        {('diameter' in currentBrushProxy)&&(typeof currentBrushProxy.diameter == 'number') &&
                        <label>
                            <div>
                            Diameter
                            </div>
                            <input type="number" name='diameter' value={currentBrushProxy.diameter} min={0} max={5} step={0.05} onChange={update} style={{ width: '5rem' }} />
                        </label>
                        }
                        {('spacing' in currentBrushProxy)&&(typeof currentBrushProxy.spacing == 'number') &&
                        <label>
                            <div>
                            Spacing
                            </div>
                            <input type="number" name='spacing' value={currentBrushProxy.spacing} min={0} max={30} step={0.1} onChange={update} style={{ width: '5rem' }} />
                        </label>
                        }
                        {('antiAliasing' in currentBrushProxy)&&(typeof currentBrushProxy.antiAliasing == 'boolean') &&
                        <label>
                            <div>
                            Anti aliasing
                            </div>
                            <input type="checkbox" name='antiAliasing' checked={currentBrushProxy.antiAliasing} onChange={update} />
                        </label>
                        }
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

