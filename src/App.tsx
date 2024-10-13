import './css/App.css';
import Menu from './components/Menu';
import Toolbar from './components/Toolbar';
import LayerMenu from './components/LayerMenu';
import { TopMenu } from './components/portals/TopMenu';
import { LeftMenu } from './components/portals/LeftMenu';
import { RightMenu } from './components/portals/RightMenu';
import { BottomMenu } from './components/portals/BottomMenu';
import { ToolContextProvider } from './contexts/ToolContextProvider';
import { useEditor } from './hooks/useEditor';
import { QuickStart } from './components/QuickStart';
import { Canvas } from './components/Canvas';

function App() {
    const [editor] = useEditor();
    return (
        <>
            <div className="App">
                <TopMenu>
                    <Menu />
                    <h1 className='filename'>{editor.drawing?.data.name}</h1>
                </TopMenu>
                <LeftMenu></LeftMenu>
                <ToolContextProvider>
                    {editor.drawing?
                        <Canvas/>
                        :<QuickStart/>}
                </ToolContextProvider>
                <RightMenu>
                    <Toolbar />
                    <LayerMenu />
                </RightMenu>
                <BottomMenu></BottomMenu>
            </div>
        </>
    );
}

export default App;
