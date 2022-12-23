import { useCallback, useContext, useState } from 'react';
import '../../css/Menu.css';
import optionsIcon from '../../icons/options-svgrepo-com.svg';
import { DrawingContext } from '../../contexts/DrawingState';
import ReactModal from 'react-modal';

export const Properties = () => {
    const [drawing, setDrawing] = useContext(DrawingContext);
    const [state, setState] = useState({ isOpen: false, name: '', width: 600, height: 600 });
    const { isOpen, name } = state;
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
        if(!drawing) return;
        const { name } = drawing;
        setState({ ...state, isOpen: true, name });
    }, [drawing, state]);
    const updateFile = useCallback(() => {
        if(drawing)setDrawing({ ...drawing,
            name
        });
        close();
    }, [close, drawing, name, setDrawing]);
    return <>
        <li><button onClick={openModal}>
            <img src={optionsIcon} alt="Properties" />
        </button></li>
        <ReactModal isOpen={isOpen} onRequestClose={close}>
            <label>
                name
                <input type="text" name='name' value={name} onChange={update} />
            </label>
            <button onClick={updateFile}>update</button>
            <button onClick={close}>cancel</button>
        </ReactModal>
    </>;
};

