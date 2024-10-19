import '../css/Menu.css';
import fileIcon from '../icons/file-svgrepo-com.svg';
import { NewFile } from './menu/NewFile';
import { SaveFile } from './menu/SaveFile';
import { Properties } from './menu/Properties';
import { EditBrushes } from './menu/EditBrushes';
import { Undo } from './menu/Undo';
import { Redo } from './menu/Redo';
import { LoadFile } from './menu/LoadFile';

function Menu() {
    return (
        <ul className="Menu">
            <li className='dropdown'>
                <button className='round-btn'>
                    <img src={fileIcon} alt="File" />
                </button>
                <ul>
                    <NewFile />
                    <LoadFile />
                    <SaveFile />
                    <EditBrushes />
                    <Properties />
                </ul>
            </li>
            <Undo />
            <Redo />
        </ul>
    );
}

export default Menu;

