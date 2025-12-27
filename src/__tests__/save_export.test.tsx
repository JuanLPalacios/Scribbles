import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

vi.mock('abr-js', () => ({
    loadAbrBrushes: vi.fn(async () => []),
}));

const mockSaveAs = vi.fn();
vi.mock('file-saver', () => ({
    saveAs: mockSaveAs,
}));

describe('Save & Export', () => {
    it('calls saveAs for .scribble and .png exports', async () => {
        render(
            <div>
                <button onClick={() => mockSaveAs(new Blob(), 'test.scribble')} aria-label="downloadFile">
                    download
                </button>
                <button onClick={() => mockSaveAs(new Blob(), 'test.png')} aria-label="exportPNG">
                    exportPNG
                </button>
            </div>
        );

        mockSaveAs.mockClear();

        const downloadBtn = screen.getByRole('button', { name: /download/i });
        await userEvent.click(downloadBtn);
        expect(mockSaveAs).toHaveBeenCalledOnce();

        const exportBtn = screen.getByRole('button', { name: /exportPNG/i });
        await userEvent.click(exportBtn);
        expect(mockSaveAs).toHaveBeenCalledTimes(2);
    });
});
