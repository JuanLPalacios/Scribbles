import '../../css/Menu.css';
import redoIcon from '../../icons/mail-forward-svgrepo-com.svg';
import { useShortcut } from '../../hooks/useShortcut';
import { useDrawing } from '../../hooks/useDrawing';
import { DrawingRequired } from '../../hoc/DrawingRequired';

export const Redo = DrawingRequired(() => {
    const [, actions] = useDrawing();
    const { redo } = actions||{};
    useShortcut(()=>{ if(redo)redo(); }, ['CTRL+Y']);
    return <>
        <li>
            <button className='round-btn' onClick={redo} disabled={!redo}>
                <img src={redoIcon} alt="Re-do" />
            </button>
        </li>
    </>;
});

