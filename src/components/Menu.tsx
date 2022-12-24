import '../css/Menu.css';
import fileIcon from '../icons/file-svgrepo-com.svg';
import { NewFile } from './menu/NewFile';
import { ExportPNG } from './menu/ExportPNG';
import { Properties } from './menu/Properties';

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
                    <Properties />
                </ul>
            </li>
        </ul>
    );
}

export default Menu;

