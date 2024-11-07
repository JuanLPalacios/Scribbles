
import { useCallback, useState, useMemo } from 'react';
import '../../css/Menu.css';
import '../../css/menu/EditPalettes.css';
import paletteIcon from '../../icons/palette-svgrepo-com.svg';
import plusIcon from '../../icons/math-plus-svgrepo-com.svg';
import trashIcon from '../../icons/trash-svgrepo-com.svg';
import clipboardIcon from '../../icons/duplicate-svgrepo-com.svg';
import ReactModal from 'react-modal';
import { uid } from '../../lib/uid';
import { SerializedValue } from '../../lib/Serialization';
import { CustomInput } from '../../types/CustomInput';
import { usePalette } from '../../hooks/usePalette';
import { usePalettes } from '../../hooks/usePalettes';
import { useColorOptions } from '../../hooks/useColorOptions';
import { InputPaletteColors } from '../inputs/InputPaletteColors';
import { PalettePreview } from '../components/PalettePreview';

export const EditPalettes = () => {
    const [palettes, setPalettes] = usePalettes();
    const [palette, { setPalette }] = usePalette();
    const [, setColor] = useColorOptions();
    const [id] = useState(uid());
    const [{ currentPalette, selectedPaletteIndex, tempPalette }, setCurrentPaletteState] = useState<{
        currentPalette:{
            colors: string[];
            name: string;
        }
        selectedPaletteIndex:number,
        tempPalette:{
            colors: string[];
            name: string;
        }[]
    }>({ currentPalette: { colors: [], name: '' }, selectedPaletteIndex: 0, tempPalette: [{ colors: [], name: '' }] });
    const { setCurrentPalette, setSelectedPaletteIndex, setTempPalette, deletePalette } = useMemo(()=>({
        setCurrentPalette(currentPalette:{
            colors: string[];
            name: string;
        }){
            setCurrentPaletteState({
                currentPalette,
                selectedPaletteIndex,
                tempPalette: tempPalette.map((x, i)=>(i==selectedPaletteIndex)?currentPalette:x)
            });
        },
        setSelectedPaletteIndex(selectedPaletteIndex:number){
            setCurrentPaletteState({
                currentPalette: tempPalette[selectedPaletteIndex],
                selectedPaletteIndex,
                tempPalette
            });
        },
        setTempPalette(tempPalette:{
            colors: string[];
            name: string;
        }[]){
            setCurrentPaletteState({
                currentPalette: tempPalette[selectedPaletteIndex],
                selectedPaletteIndex,
                tempPalette
            });
        },
        deletePalette(){
            if(tempPalette.length<2)return;
            const newSelectedPaletteIndex = Math.min(selectedPaletteIndex, tempPalette.length-2);
            setCurrentPaletteState({
                currentPalette: tempPalette[newSelectedPaletteIndex],
                selectedPaletteIndex: newSelectedPaletteIndex,
                tempPalette: tempPalette.filter((_x, i)=>i!=selectedPaletteIndex)
            });
        }
    }), [selectedPaletteIndex, tempPalette]);
    const [state, setState] = useState({ isOpen: false });
    const { isOpen } = state;

    const newName = useCallback(function(name: string): string {
        if(!tempPalette.find(x=>x.name==name))return name;
        let num = 2;
        while (tempPalette.find(x=>x.name==name+` (${num})`)) {
            num++;
        }
        return name+` (${num})`;
    }, [tempPalette]);

    const addPalette = useCallback(() => {
        setTempPalette([
            ...tempPalette,
            { name: newName('palette'), colors: [] }
        ]);
    }, [newName, setTempPalette, tempPalette]);
    const duplicatePalette = useCallback(() => {
        setTempPalette([...tempPalette, { ...currentPalette, name: newName(currentPalette.name) }]);
    }, [currentPalette, newName, setTempPalette, tempPalette]);
    const update = useCallback((e:React.ChangeEvent<CustomInput<SerializedValue>|HTMLSelectElement>) => {
        let value;
        if(e.target.name!='scribblePaletteType')
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
        setCurrentPalette({ ...currentPalette, [e.target?.name]: value });
    }, [currentPalette, setCurrentPalette]);
    const save = useCallback(() => {
        setState({ ...state, isOpen: false });
        setColor({ color: currentPalette.colors[0] || '#000000' });
        setPalette(
            currentPalette.colors
        );
        setPalettes(
            tempPalette
        );
    }, [currentPalette.colors, setColor, setPalette, setPalettes, state, tempPalette]);
    const close = useCallback(() => {
        setState({ ...state, isOpen: false });
    }, [state]);
    const openModal = useCallback(() => {
        setState({ ...state, isOpen: true });
        setTempPalette([palettes.find(x=>x.colors.toString()==palette.toString())||{ name: newName('current palette'), colors: palette }, ...palettes.filter(x=>x.colors.toString()!=palette.toString())]);
    }, [newName, palette, palettes, setTempPalette, state]);
    return <>
        <button onClick={openModal}>
            <img src={paletteIcon} alt="" />
                Change palette
        </button>
        <ReactModal isOpen={isOpen} onRequestClose={close}>
            <div className="EditPalettes fields import-palette">
                <h2>Palettes</h2>
                <div>
                    <button onClick={addPalette}><img src={plusIcon} alt="Add Palette" /></button>
                    <button onClick={duplicatePalette}><img src={clipboardIcon} alt="Duplicate Palette" /></button>
                    <button onClick={deletePalette} disabled={(tempPalette.length<2)}><img src={trashIcon} alt="Delete Palette" /></button>
                </div>
                <div className='cols'>
                    <div className='palette-list select-list'>
                        <ul className='palettes'>
                            {tempPalette.map((palette, i) => <li key={id+'-'+i}>
                                <PalettePreview palette={palette} className={i==selectedPaletteIndex?'selected':''} onMouseDown={()=>setSelectedPaletteIndex(i)}/>
                            </li>)}
                        </ul>
                    </div>
                    <div className='palette-props'>
                        <label>
                            <div>
                            Name
                            </div>
                            <input type="text" name='name' autoComplete="off" value={currentPalette.name} onChange={update} />
                        </label>
                        <InputPaletteColors name='colors' value={currentPalette.colors} onChange={update} />
                    </div>
                </div>
                <div className='actions'>
                    <button onClick={save}>save</button>
                    <button onClick={close}>cancel</button>
                </div>
            </div>
        </ReactModal>
    </>;
};

