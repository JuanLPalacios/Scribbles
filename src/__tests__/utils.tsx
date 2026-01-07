import { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { AppStateProvider } from '../contexts/AppContext';
import { DemoRecorderProvider } from '../contexts/DemoRecorderContext';
import { VideoRecorderProvider } from '../contexts/VideoRecorderContext';

export function renderWithProviders(ui: ReactNode) {
    return render(
        <AppStateProvider>
            <DemoRecorderProvider>
                <VideoRecorderProvider>
                    {ui}
                </VideoRecorderProvider>
            </DemoRecorderProvider>
        </AppStateProvider>
    );
}
