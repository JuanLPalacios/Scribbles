import { useContext } from 'react';
import { ColorOptionsContext } from '../contexts/ColorOptionsContext';

export const useColorOptions = () => useContext(ColorOptionsContext);
