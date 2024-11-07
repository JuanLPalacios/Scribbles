import '../../css/Menu.css';
import undoIcon from '../../icons/mail-reply-svgrepo-com.svg';
import { useShortcut } from '../../hooks/useShortcut';
import { useDrawing } from '../../hooks/useDrawing';
import { DrawingRequired } from '../../hoc/DrawingRequired';

export const Undo = DrawingRequired(() => {
    const [, actions] = useDrawing();
    const { undo } = actions||{};
    useShortcut(()=>{ if(undo)undo(); }, ['CTRL+Z']);
    return <>
        <li>
            <button className='round-btn' onClick={undo} disabled={!undo}>
                <img src={undoIcon} alt="Undo" />
            </button>
        </li>
    </>;
});

