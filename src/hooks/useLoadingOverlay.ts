import { useContext } from 'react';
import { LoadingOverlayContext } from '../contexts/LoadingOverlayContext';

export const useLoadingOverlay = () => useContext(LoadingOverlayContext);