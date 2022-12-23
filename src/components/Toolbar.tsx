import { useContext } from 'react';
import { MenuContext } from '../contexts/MenuOptions';
import '../css/Toolbar.css';

function Toolbar() {
    const menuContext = useContext(MenuContext);
    const [options, onChange] = menuContext;
    const {
        tools, selectedTool
    } = options;
    const  onSelect= (selectedTool: number)=>onChange({ ...options, selectedTool });
    const { Tool } = tools[selectedTool];
    return (
        <div className="Toolbar">
            {tools.map(({ key, icon, name }, i) => (
                <button key={`${key}-item`} className={`tool ${selectedTool === i ? 'selected' : ''}`} onClick={() => onSelect(i)}>
                    <img src={icon} alt={name} />
                </button>
            ))}
            <Tool.Menu config={options} onChange={onChange}/>
        </div>
    );
}

export default Toolbar;
