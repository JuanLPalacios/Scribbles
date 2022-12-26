import { useCallback, useContext, useState } from 'react';
import '../../css/Menu.css';
import addFileIcon from '../../icons/file-add-svgrepo-com.svg';
import { createLayer } from '../../hooks/createLayer';
import { DrawingContext } from '../../contexts/DrawingState';
import ReactModal from 'react-modal';

export const NewFile = () => {
    const [drawing, setDrawing] = useContext(DrawingContext);
    const [state, setState] = useState({ isOpen: false, name: '', width: 600, height: 600 });
    const { isOpen, name, width, height } = state;
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
        const { width, height } = drawing || { width: 600, height: 600 };
        setState({ ...state, isOpen: true, width, height });
    }, [drawing, state]);
    const newfile = useCallback(() => {
        setDrawing({
            name,
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
        });
        close();
    }, [close, height, name, setDrawing, width]);
    return <>
        <li><button className='round-btn' onClick={openModal}>
            <img src={addFileIcon} alt="New scribble" />
        </button></li>
        <ReactModal isOpen={isOpen} onRequestClose={close}>
            <div className="fields">
                <h2>New Scribble</h2>
                <label>
                name
                    <input type="text" name='name' value={name} onChange={update} />
                </label>
                <label>
                width
                    <input type="number" name='width' value={width} onChange={update} />
                </label>
                <label>
                height
                    <input type="number" name='height' value={height} onChange={update} />
                </label>
                <div className='actions'>
                    <button onClick={newfile}>create</button>
                    <button onClick={close}>cancel</button>
                </div>
            </div>
        </ReactModal>
    </>;
};

