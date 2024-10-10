import '../css/Canvas.css';
import { QuickStart } from './QuickStart';
import { Drawing } from './Drawing';
import { useEditor } from '../hooks/useEditor';

function Canvas() {
    const [editor,] = useEditor();
    return (editor.drawing?
        <Drawing drawing={editor.drawing} />
        :<QuickStart/>
    );
}

export default Canvas;