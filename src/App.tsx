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
import { FullScreenToggle } from './components/FullScreenToggle';

function App() {
    const [editor] = useEditor();
    return (
        <>
            <div className="App">
                <TopMenu>
                    <Menu />
                </TopMenu>
                <LeftMenu></LeftMenu>
                <ToolContextProvider>
                    {editor.drawing?
                        <Canvas/>
                        :<QuickStart/>}
                </ToolContextProvider>
                <RightMenu>
                    <FullScreenToggle/>
                    <Toolbar />
                    <LayerMenu />
                </RightMenu>
                <BottomMenu></BottomMenu>
            </div>
        </>
    );
}

export default App;
