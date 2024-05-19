import '../css/Menu.css';
import fileIcon from '../icons/file-svgrepo-com.svg';
import { NewFile } from './menu/NewFile';
import { ExportPNG } from './menu/ExportPNG';
import { Properties } from './menu/Properties';
import { ImportBrush } from './menu/ImportBrush';
import { Undo } from './menu/Undo';
import { Redo } from './menu/Redo';

function Menu() {
    return (
        <ul className="Menu">
            <li className='dropdown'>
                <button className='round-btn'>
                    <img src={fileIcon} alt="File" />
                </button>
                <ul>
                    <NewFile />
                    <ExportPNG />
                    <ImportBrush />
                    <Properties />
                </ul>
            </li>
            <Undo />
            <Redo />
        </ul>
    );
}

export default Menu;

