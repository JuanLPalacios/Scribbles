import '../css/Toolbar.css';
import { useMenu } from '../hooks/useMenu';

function Toolbar() {
    const menuContext = useMenu();
    const [options, onChange] = menuContext;
    const {
        tools, selectedTool
    } = options;
    const  onSelect= (selectedTool: number)=>onChange({ ...options, selectedTool });
    //const { Tool } = tools[selectedTool];
    //<Tool.Menu config={options} onChange={onChange}/>
    return (
        <div className="Toolbar">
            {tools.map(({ key, icon, name }, i) => (
                <button key={`${key}-item`} className={`tool round-btn ${selectedTool === i ? 'selected' : ''}`} onClick={() => onSelect(i)}>
                    <img src={icon} alt={name} />
                </button>
            ))}
        </div>
    );
}

export default Toolbar;
