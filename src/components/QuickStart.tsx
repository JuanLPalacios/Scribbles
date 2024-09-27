import '../css/QuickStart.css';
import { useEditor } from '../hooks/useEditor';

export const QuickStart = () => {
    const [, { newFile }] = useEditor();
    const quickNewFile = () => {
        newFile({
            name: 'new Scribble',
            width: 600,
            height: 600
        });
    };

    return <div className='QuickStart'>
        <h1>Quick Start</h1>
        <button onClick={quickNewFile}>open New Scribble</button>
    </div>;
};
