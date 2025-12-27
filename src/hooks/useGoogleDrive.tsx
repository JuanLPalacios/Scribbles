import { useContext } from 'react';
import { GoogleDriveContext } from '../contexts/GoogleDriveContext';

export const useGoogleDrive = () => {
    const context = useContext(GoogleDriveContext);
    if (!context) {
        throw new Error(
            'useGoogleDrive must be used within GoogleDriveContextProvider'
        );
    }
    return context;
};
