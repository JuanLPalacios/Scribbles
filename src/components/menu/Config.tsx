import { useCallback, useState } from 'react';
import '../../css/Menu.css';
import optionsIcon from '../../icons/options-svgrepo-com.svg';
import ReactModal from 'react-modal';
import { useConfig } from '../../hooks/useConfig';
import { TimeDisplay } from '../components/TimeDisplay';
import { EditPalettes } from './EditPalettes';
import { EditBrushes } from './EditBrushes';

export const Config = () => {
    const [config, setConfig] = useConfig();
    const [state, setState] = useState({ isOpen: false, name: '', width: 600, height: 600 });
    const { autoSave, doubleClickTimeOut } = config;
    const { isOpen, name } = state;
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
        setConfig({ ...config, [e.target?.name]: value });
    }, [config, setConfig]);
    const close = useCallback(() => {
        setState({ ...state, isOpen: false });
    }, [state]);
    const openModal = useCallback(() => {
        setState({ ...state, isOpen: true, name });
    }, [name, state]);
    const updateFile = useCallback(() => {
        close();
    }, [close]);
    return <>
        <li>
            <button className='round-btn' onClick={openModal}>
                <img src={optionsIcon} alt="Properties" />
            </button>
            <div className="text">Configuration</div>
        </li>
        <ReactModal isOpen={isOpen} onRequestClose={close}>
            <div className="Config fields" style={{ width: '400px' }}>
                <h2>Scribble Config</h2>
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
                <div className='actions'>
                    {
                        <EditBrushes />
                    }
                    <EditPalettes />
                </div>
                <div className='actions'>
                    <button onClick={updateFile}>update</button>
                    <button onClick={close}>cancel</button>
                </div>
            </div>
        </ReactModal>
    </>;
};

