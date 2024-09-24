import { useCallback, useState, useEffect } from 'react';
import '../../css/Menu.css';
import addFileIcon from '../../icons/file-add-svgrepo-com.svg';
import ReactModal from 'react-modal';
import { useEditor } from '../../hooks/useEditor';

export const NewFile = () => {
    const [editor, { newFile }] = useEditor();
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
        const { width, height } = editor.drawing?.data || { width: 600, height: 600 };
        setState({ ...state, isOpen: true, width, height });
    }, [editor, state]);
    const createNewFile = useCallback(() => {
        newFile({ name, width, height });
        close();
    }, [newFile, name, width, height, close]);
    useEffect(() => {
        const errors = { name: new Array<string>(), width: new Array<string>(), height: new Array<string>() };
        if(name.length<1)
            errors.name.push('Must have at least 1 character');
        if(name.match(/[.,#%&{}\\<>*?/$!'":@+`|=]/gi))
            errors.name.push('Should not contain forbidden characters');
        setState({ ...state, errors, isValid: Object.values(errors).reduce((total, value)=> total + value.length, 0) === 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [height, name, width]);
    return <>
        <li>
            <button className='round-btn' onClick={openModal}>
                <img src={addFileIcon} alt="New scribble" />
            </button>
            <div className="text">New scribble</div>
        </li>
        <ReactModal isOpen={isOpen} onRequestClose={close} style={{ content: { width: '14rem' } }}>
            <div className="fields">
                <h2>New Scribble</h2>
                <div className='errors'>
                    {errors.name.map((error, i) => <div key={'error.name-'+i} className='error'>Name: {error}</div>)}
                </div>
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
                <div className='actions'>
                    <button onClick={createNewFile} disabled={!isValid}>create</button>
                    <button onClick={close}>cancel</button>
                </div>
            </div>
        </ReactModal>
    </>;
};

