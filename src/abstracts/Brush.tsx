import { BrushList } from '../lib/BrushList';
import { SerializedBrush } from '../lib/Serialization';
import { Marker } from '../brushes/Marker';
import { Solid } from '../brushes/Solid';
import { BrushMapper } from '../contexts/BrushMapper';
import { Stiff } from '../brushes/Stiff';
import { Texture } from '../brushes/Texture';
import { BrushPair } from '../contexts/BrushRendererContext';
import { Pattern } from '../brushes/Pattern';

export const BRUSH_TYPE_LIST:BrushPair<SerializedBrush>[] = [
    [Solid, {
        scribbleBrushType: BrushList.Solid,
        name: 'SolidBrush',
        angle: 0,
        hardness: 1,
        roundness: 1,
        spacing: 30
    },],
    [Texture, {
        scribbleBrushType: BrushList.Texture,
        name: 'TextureBrush',
        brushTipImage: {
            colorSpace: 'srgb',
            height: 11,
            width: 11,
            data: [
                0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
                0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
                0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0,
                0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
            ].map((x)=>[0, 0, 0, x*255]).flat()
        },
        spacing: 0,
        antiAliasing: true,
    }],
    [Marker, {
        scribbleBrushType: BrushList.Marker,
        name: 'Marker',
        spacing: 5,
        hardness: 1
    }],
    [Stiff, {
        scribbleBrushType: BrushList.Stiff,
        name: 'Stiff',
        fibers: []
    }],
    [Pattern, {
        scribbleBrushType: BrushList.Pattern,
        name: 'Pattern',
        brushPatternImage: {
            colorSpace: 'srgb',
            height: 5,
            width: 5,
            data: [
                0, 1, 0, 1, 0,
                1, 0, 1, 0, 1,
                0, 1, 0, 1, 0,
                1, 0, 1, 0, 1,
                0, 1, 0, 1, 0,
            ].map((x)=>[0, 0, 0, x*255]).flat()
        },
        hardness: 1,
        spacing: 30
    }]
];

export const Brush = BrushMapper<SerializedBrush>(BRUSH_TYPE_LIST);
