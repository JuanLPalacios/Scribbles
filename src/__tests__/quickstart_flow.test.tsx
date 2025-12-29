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

import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { renderWithProviders } from './utils';

// Verify QuickStart opens a new scribble and Canvas appears
it('opens blank scribble and renders Canvas', async () => {
    await act(async () => {
        renderWithProviders(<App />);
    });

    // Quick Start modal is visible
    expect(await screen.findByText(/Quick Start/i)).toBeInTheDocument();

    const openBlank = await screen.findByRole('button', { name: /Open blank scribble/i });
    await act(async () => {
        await userEvent.click(openBlank);
    });

    // The Canvas container shows up
    const viewport = await new Promise<HTMLDivElement | null>((resolve) => {
        const check = () => {
            const el = document.querySelector('.Canvas .viewport') as HTMLDivElement | null;
            if (el) resolve(el);
            else setTimeout(check, 10);
        };
        check();
    });
    expect(viewport).toBeTruthy();

    // Simulate a simple stroke
    const { left = 0, top = 0, width = 300, height = 300 } = viewport?.getBoundingClientRect() || {};
    const x = left + width / 2;
    const y = top + height / 2;

    const pointerId = 1;
    await act(async () => {
        viewport?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: x, clientY: y, buttons: 1, pointerId }));
        viewport?.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: x + 5, clientY: y + 5, buttons: 1, pointerId }));
        viewport?.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: x + 10, clientY: y + 10, buttons: 0, pointerId }));
    });

    // After stroke, at least one canvas should be present
    await waitFor(() => {
        const canvases = document.querySelectorAll('canvas');
        expect(canvases.length).toBeGreaterThan(0);
    });
});
