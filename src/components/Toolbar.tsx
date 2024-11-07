import '../css/Toolbar.css';
import { useShortcut } from '../hooks/useShortcut';
import { useToolOptions } from '../hooks/useToolOptions';

function Toolbar() {
    const [{ selectedTool, tools }, setToolOptions] = useToolOptions();
    const  onSelect= (selectedTool: number)=>setToolOptions({ selectedTool, tools });
    useShortcut((shortcut)=>{ onSelect(tools.findIndex(x=>x.shortcut==shortcut)); }, (tools.filter(x=>x.shortcut!==undefined).map(x=>x.shortcut) as string[]));
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
