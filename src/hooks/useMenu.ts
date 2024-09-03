import { useContext } from 'react';
import { MenuContext } from '../contexts/MenuOptions';

export const useMenu = ()=> useContext(MenuContext);
