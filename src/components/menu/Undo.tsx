import { useCallback, useContext } from 'react';
import '../../css/Menu.css';
import undoIcon from '../../icons/mail-reply-svgrepo-com.svg';
import { EditorContext } from '../../contexts/DrawingState';
import { useShortcut } from '../../hooks/useShortcut';

export const Undo = () => {
    const [, editorDispatch] = useContext(EditorContext);
    const undo = useCallback(() => {
        editorDispatch({
            type: 'editor/undo'
        });
    }, [editorDispatch]);
    useShortcut(undo, ['CTRL+Z']);
    return <>
        <li>
            <button className='round-btn' onClick={undo}>
                <img src={undoIcon} alt="Undo" />
            </button>
        </li>
    </>;
};

