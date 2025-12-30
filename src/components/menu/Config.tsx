import { useCallback, useState, useMemo } from 'react';
import '../../css/Config.css';
import optionsIcon from '../../icons/options-svgrepo-com.svg';
import ReactModal from 'react-modal';
import { useConfig } from '../../hooks/useConfig';
import { TimeDisplay } from '../components/TimeDisplay';
import { EditBrushes } from './EditBrushes';
import { EditPalettes } from './EditPalettes';
import { GoogleDriveConfig } from './GoogleDriveConfig';
import { InputColor } from '../inputs/InputColor';

export const Config = () => {
    const [config, setConfig] = useConfig();
    const [configCopy, setConfigCopy] = useState(config);
    const [state, setState] = useState({ isOpen: false, name: '', width: 600, height: 600 });
    const { autoSave, doubleClickTimeOut } = configCopy;
    const canvasColor = useMemo(() => configCopy?.canvasColor || { r: 255, g: 255, b: 255, a: 1 }, [configCopy]);
    const { isOpen, name } = state;

    const rgbaToHex = (r: number, g: number, b: number) => {
        return '#' + [r, g, b]
            .map(x => x.toString(16).padStart(2, '0')
                .toUpperCase())
            .join('');
    };

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return null;
        return {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        };
    };

    const update = useCallback((e:React.ChangeEvent<HTMLInputElement>) => {
        let value;
        switch (e.target.type){
        case('range'):
        case('number'):
            value = +e.target.value;
            break;
        default:
            value = e.target.value;
            break;
        }
        setConfigCopy({ ...configCopy, [e.target?.name]: value });
    }, [configCopy, setConfigCopy]);

    const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const hex = e.target.value;
        const rgb = hexToRgb(hex);
        if (rgb) {
            setConfigCopy({
                ...configCopy,
                canvasColor: {
                    ...canvasColor,
                    ...rgb
                }
            });
        }
    }, [configCopy, canvasColor]);

    const handleAlphaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const alpha = parseFloat(e.target.value);
        setConfigCopy({
            ...configCopy,
            canvasColor: {
                ...canvasColor,
                a: alpha
            }
        });
    }, [configCopy, canvasColor]);

    const close = useCallback(() => {
        setState({ ...state, isOpen: false });
    }, [state]);
    const openModal = useCallback(() => {
        setState({ ...state, isOpen: true, name });
    }, [name, state]);
    const save = useCallback(() => {
        setConfig(configCopy);
        close();
    }, [close, configCopy, setConfig]);
    return <>
        <li>
            <button className='round-btn' onClick={openModal}>
                <img src={optionsIcon} alt="Properties" />
            </button>
            <div className="text">Configuration</div>
        </li>
        <ReactModal isOpen={isOpen} onRequestClose={close}>
            <div className="Config fields" >
                <h2>Scribbles Configuration</h2>
                <label htmlFor='autoSave' className={(autoSave==0)?'disabled':''}>
                    Auto-save session after
                    (<TimeDisplay value={autoSave}/>{(autoSave==0)?'disabled':''})
                </label>
                <input id='autoSave' type="range" name='autoSave' min='0' max='3600000' step='60000' value={autoSave} onChange={update} />
                <label htmlFor='doubleClickTimeOut'>
                    Double-Click time window
                    (<TimeDisplay value={doubleClickTimeOut}/>)
                </label>
                <input id='doubleClickTimeOut' type="range" name='doubleClickTimeOut' min='100' max='10000' step='100' value={doubleClickTimeOut} onChange={update} />
                <GoogleDriveConfig />
                <fieldset>
                    <legend>New Image Background Color</legend>
                    <label htmlFor='canvasColor'>
                        Color
                    </label>
                    <InputColor
                        value={rgbaToHex(canvasColor.r, canvasColor.g, canvasColor.b)}
                        onChange={handleColorChange}
                        dropper={false}
                    />
                    <label htmlFor='canvasAlpha'>
                        Opacity
                        ({Math.round(canvasColor.a * 100)}%)
                    </label>
                    <input
                        id='canvasAlpha'
                        type="range"
                        name='canvasAlpha'
                        min='0'
                        max='1'
                        step='0.01'
                        value={canvasColor.a}
                        onChange={handleAlphaChange}
                    />
                </fieldset>
                <div className='actions'>
                    <EditBrushes />
                    <EditPalettes />
                </div>
                <div className='actions'>
                    <button onClick={save}>save</button>
                    <button onClick={close}>cancel</button>
                </div>
            </div>
        </ReactModal>
    </>;
};

