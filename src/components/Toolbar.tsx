import { useContext } from 'react';
import { MenuContext } from '../contexts/MenuOptions';
import '../css/Toolbar.css';
import { ToolButton } from '../types/ToolButton';

interface ToolbarProps {
  toolButtons:ToolButton[]
  selectedTool:number
  onSelect:(index:number)=>void
}

function Toolbar(props:ToolbarProps) {
    const menuContext = useContext(MenuContext);
    const [options, onChange] = menuContext;
    const { toolButtons, selectedTool, onSelect } = props;
    const { Tool } = toolButtons[selectedTool];
    return (
        <div className="Toolbar">
            {toolButtons.map(({ key, icon, name }, i) => (
                <button key={`${key}-item`} className={`tool ${selectedTool === i ? 'selected' : ''}`} onClick={() => onSelect(i)}>
                    <img src={icon} alt={name} />
                </button>
            ))}
            <Tool.Menu config={options} onChange={onChange}/>
        </div>
    );
}

export default Toolbar;
