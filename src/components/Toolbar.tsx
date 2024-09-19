import '../css/Toolbar.css';
import { useToolOptions } from '../hooks/useToolOptions';

function Toolbar() {
    const [{ selectedTool, tools }, setToolOptions] = useToolOptions();
    const  onSelect= (selectedTool: number)=>setToolOptions({ selectedTool, tools });
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
