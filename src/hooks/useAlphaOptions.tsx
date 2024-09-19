import { useContext } from 'react';
import { AlphaOptionsContext } from '../contexts/AlphaOptionsContext';

export const useAlphaOptions = () => useContext(AlphaOptionsContext);
