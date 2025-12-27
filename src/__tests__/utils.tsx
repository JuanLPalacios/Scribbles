import { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { AppStateProvider } from '../contexts/AppContext';

export function renderWithProviders(ui: ReactNode) {
    return render(<AppStateProvider>{ui}</AppStateProvider>);
}
