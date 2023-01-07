import { useCallback, useContext } from 'react';
import '../../css/Menu.css';
import redoIcon from '../../icons/mail-forward-svgrepo-com.svg';
import { EditorContext } from '../../contexts/EditorState';
import { useShortcut } from '../../hooks/useShortcut';

export const Redo = () => {
    const [, editorDispatch] = useContext(EditorContext);
    const redo = useCallback(() => {
        editorDispatch({
            type: 'editor/redo'
        });
    }, [editorDispatch]);
    useShortcut(redo, ['CTRL+Y']);
    return <>
        <li>
            <button className='round-btn' onClick={redo}>
                <img src={redoIcon} alt="Re-do" />
            </button>
        </li>
    </>;
};

