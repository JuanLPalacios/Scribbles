import { BrushList } from '../lib/BrushList';
import { SerializedBrush } from '../lib/Serialization';
import { MarkerC } from './MarkerC';
import { SolidC } from './SolidC';
import { BrushMapper } from '../contexts/BrushMapper';
import { StiffC } from './StiffC';
import { TextureC } from './TextureC';

export const BrushC = BrushMapper<SerializedBrush>([
    [SolidC, {
        scribbleBrushType: BrushList.Solid,
        name: 'SolidBrush',
        angle: 0,
        diameter: 1,
        hardness: 1,
        roundness: 1,
        spacing: 300
    },],
    [TextureC, {
        scribbleBrushType: BrushList.Texture,
        name: 'TextureBrush',
        brushTipImage: {
            colorSpace: 'srgb',
            height: 1,
            width: 1,
            data: [0, 0, 0, 0]
        },
        spacing: 0,
        antiAliasing: true,
    }],
    [MarkerC, {
        scribbleBrushType: BrushList.Marker,
        name: 'Marker'
    }],
    [StiffC, {
        scribbleBrushType: BrushList.Stiff,
        name: 'Stiff',
        fibers: []
    }]
]);
