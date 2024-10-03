import Brush from '../abstracts/Brush';
import Marker, { SerializedMarkerBrush } from '../brushes/Marker';
import SolidBrush, { SerializedSolidBrush } from '../brushes/Solid';
import StiffBrush, { SerializedStiffBrush } from '../brushes/StiffBrush';
import TextureBrush, { SerializedTextureBrush } from '../brushes/TextureBrush';
import { BrushList } from './BrushList';
import { SerializedImageData } from '../brushes/SerializedImageData';
import { CompressedOject } from '../brushes/CompressedOject';
import { serializeImageData } from './serializeJSON';

export type SerializedBrush =
| SerializedSolidBrush
| SerializedTextureBrush
| SerializedStiffBrush
| SerializedMarkerBrush;
export type Compressed = {[key:string]:CompressedValue};
export type CompressedValue = number | string | boolean | CompressedOject  | CompressedValue[];

export type Serialized = {[key:string]:SerializedValue};
export type SerializedValue = number | string | boolean | Serialized | SerializedImageData | SerializedValue[];

export function isSerializedImageData(value: SerializedImageData | Serialized): value is SerializedImageData {
    return (value as SerializedImageData).colorSpace !== undefined;
}

export const abrToScribblesSerializable = (abrBrush: AbrBrush): SerializedBrush => {
    const { brushType } = abrBrush;
    switch (brushType) {
    case 1:
        return abrComputedBrushToSolid(abrBrush);
    case 2:
        return abrSampledBrushToTextured(abrBrush);
    default:
        return new SolidBrush().toObj();
    }
};
function abrComputedBrushToSolid({ angle, diameter, hardness, name, roundness, spacing }: AbrComputedBrush): SerializedSolidBrush {
    return { scribbleBrushType: BrushList.Solid, angle, diameter, hardness, name, roundness, spacing };
}

function abrSampledBrushToTextured({ antiAliasing, brushTipImage, name, spacing }: AbrSampledBrush): SerializedTextureBrush {
    const ctx = brushTipImage.getContext('2d');
    if(!ctx)throw new Error('can\'t create image context');
    const imageData = ctx.getImageData(0, 0, brushTipImage.width, brushTipImage.height);
    for (let i = 0; i < (imageData.data.length||0); i+=4) {
        imageData.data[i+3] = 255 - imageData.data[i];
        imageData.data[i] = 0;
        imageData.data[i+1] = 0;
        imageData.data[i+2] = 0;
    }
    return { scribbleBrushType: BrushList.Texture, antiAliasing, brushTipImage: serializeImageData(imageData), name, spacing };
}

export const brushFormObj = (brushObj:SerializedBrush): Brush => {
    const { scribbleBrushType } = brushObj;
    switch (scribbleBrushType) {
    case BrushList.Solid:
        return SolidBrush.formObj(brushObj);
    case BrushList.Texture:
        return TextureBrush.formObj(brushObj);
    case BrushList.Marker:
        return Marker.formObj(brushObj);
    case BrushList.Stiff:
        return StiffBrush.formObj(brushObj);
    default:
        return new SolidBrush();
    }
};

