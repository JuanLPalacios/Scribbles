import '../css/Toolbar.css';
import { ToolButton } from '../types/ToolButton';

interface ToolbarProps {
  toolButtons:ToolButton[]
  selectedTool:number
  onSelect:(index:number)=>void
}

function Toolbar(props:ToolbarProps) {
    const {toolButtons, selectedTool, onSelect} = props;
    return (
        <div className="Toolbar">
            {toolButtons.map((toolButton, i) => (
                <button key={`${toolButton.key}-item`} className={`tool ${selectedTool === i ? 'selected' : ''}`} onClick={() => onSelect(i)}>
                    {toolButton.name}
                </button>
            ))}
        </div>
    );
}

export default Toolbar;
