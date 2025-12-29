import { vi, it, expect } from 'vitest';
vi.mock('abr-js', () => ({
    loadAbrBrushes: vi.fn(async () => []),
}));
vi.mock('../components/inputs/BrushSelectInput', () => ({
    BrushSelectInput: () => null,
}));
vi.mock('../components/components/BrushPreview', () => ({
    BrushPreview: () => null,
}));

// jsdom matchMedia mock for QuickStart
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: (query: string): any => ({
        matches: false,
        media: query,
        addListener: () => void 0,
        removeListener: () => void 0,
        addEventListener: () => void 0,
        removeEventListener: () => void 0,
        onchange: null,
        dispatchEvent: () => false,
    }),
});

import { screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { renderWithProviders } from './utils';

it('toggles selected tool via toolbar buttons', async () => {
    await act(async () => {
        renderWithProviders(<App />);
    });

    const openBlank = await screen.findByRole('button', { name: /Open blank scribble/i });
    await act(async () => {
        await userEvent.click(openBlank);
    });

    // Find all tool buttons
    const buttons = Array.from(document.querySelectorAll('.Toolbar .tool.round-btn')) as HTMLButtonElement[];
    expect(buttons.length).toBeGreaterThan(0);

    // Initial selection is first tool
    expect(buttons[0].classList.contains('selected')).toBe(true);

    // Click each tool and expect selection to move
    for (let i = 1; i < buttons.length; i++) {
        await act(async () => {
            await userEvent.click(buttons[i]);
        });
        expect(buttons[i].classList.contains('selected')).toBe(true);
        // previous should be unselected
        for (let j = 0; j < buttons.length; j++) {
            if (j !== i) {
                expect(buttons[j].classList.contains('selected')).toBe(false);
            }
        }
    }
});
