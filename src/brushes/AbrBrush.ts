import { SequentialDataView } from '../lib/SequentialDataView';

export const INT16_MAX = 65535;
// FIXME: this needs to be not empty
const defaultBrushTipImage = document.createElement('canvas');

export const abrBrushes = {
    map: <{ [key: string]: AbrBrush; }>{},
    get(key: string): AbrBrush {
        return this.map[key];
    },
    set(key: string, value: AbrBrush) {
        this.map[key] = value;
    },
    clear() {
        this.map = {};
    },
    list() {
        return Object.values(this.map);
    }
};

function getDefaultSampledBrush(name: string): AbrSampledBrush {
    return { brushType: 2, brushTipImage: defaultBrushTipImage, md5Sum: new ArrayBuffer(0), name, valid: false, spacing: 1, antiAliasing: true };
}

export async function loadAbrBrushes(file: File) {
    const buffer:ArrayBuffer = await (new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = function(event) {
            if(event.target&&event.target.result&&(typeof event.target.result != 'string')) resolve(event.target.result);
            else reject();
        };
        fileReader.readAsArrayBuffer(file);
    }));
    return loadAbrFromArrayBuffer(buffer, file.name);
}

export async function loadAbrFromArrayBuffer(buffer: ArrayBuffer, filename:string) {
    const abrSdv = new SequentialDataView(buffer);
    try {
        const abrHeader:AbrHeader = abrReadContent(abrSdv);
        if (!abrSupportedContent(abrHeader)) {
            throw new Error(`ERROR: unable to decode abr format version ${abrHeader.version}(subver ${abrHeader.subversion})`);
        }
        if (abrHeader.count == 0) {
            throw new Error(`ERROR: no brushes found in ${filename}`);
        }
        const imageId = 123456;
        for (let i = 0; i < abrHeader.count; i++) {
            const layerId = await loadAbrBrush(abrSdv, abrHeader, filename, imageId, i + 1);
            if (layerId == -1) {
                console.warn(`Warning: problem loading brush #${i} in ${filename}`);
            }
        }
        return true;
    } catch (error) {
        throw new Error(`Error: cannot parse ABR file: ${filename}`, { cause: error });
    }
}

export const abrReadContent=(abrSdv:SequentialDataView):AbrHeader=>{
    const abrHeader:AbrHeader = { count: 0, subversion: 0, version: 0 };
    abrHeader.version = abrSdv.getUint16();
    abrHeader.subversion = 0;
    abrHeader.count = 0;

    switch (abrHeader.version) {
    case 1:
    case 2:
        // ver:1-2
        abrHeader.count = abrSdv.getUint16();
        break;
    case 6:
        // ver:6
        abrHeader.subversion = abrSdv.getUint16();
        abrHeader.count = findSampleCountV6(abrSdv, abrHeader);
        break;
    default:
        // unknown versions
        break;
    }

    // next bytes in abr are samples data
    return abrHeader;
};

function findSampleCountV6(abrSdv: SequentialDataView, abrHeader: AbrHeader): number {
    let brushSize:number;
    let brushEnd:number;

    if (!abrSupportedContent(abrHeader))
        return 0;
    const origin = abrSdv.getPos();
    try {
        abrReach8BimSection(abrSdv, 'samp');
    } catch (error) {
        abrSdv.setPos(origin);
        return 0;
    }
    // long
    const sampleSectionSize = abrSdv.getUint32();
    const sampleSectionEnd = sampleSectionSize + abrSdv.getPos();
    if(sampleSectionEnd < 0 || sampleSectionEnd > abrSdv.size())
        return 0;
    const dataStart = abrSdv.getPos();
    let samples = 0;
    while ((!abrSdv.atEnd()) && (abrSdv.getPos() < sampleSectionEnd)) {
        // read long
        brushSize = abrSdv.getUint32();
        brushEnd = brushSize;
        // complement to 4
        while (brushEnd % 4 != 0) brushEnd++;
        const newPos = abrSdv.getPos() + brushEnd;
        if(newPos > 0 && newPos < abrSdv.size()) {
            abrSdv.setPos(newPos);
        }
        else
            return 0;
        samples++;
    }
    // set StreamDataViewer to samples data
    abrSdv.setPos(dataStart);
    return samples;
}

export function abrSupportedContent(abrHeader: AbrHeader): boolean {
    switch (abrHeader.version) {
    case 1:
    case 2:
        return true;
    case 6:
        if (abrHeader.subversion == 1 || abrHeader.subversion == 2)
            return true;
        break;
    }
    return false;
}

export function abrReach8BimSection(abrSdv: SequentialDataView, name: string):void {
    let sectionSize = 0;
    // find 8BIMname section
    while (!abrSdv.atEnd()) {
        const tag: number[] = [];
        const tagname: number[] = [];
        let r;
        r = abrSdv.readRawData(tag, 4);
        if (r != 4) {
            throw new Error('Error: Cannot read 8BIM tag ');
        }
        if (charCodeComparison(tag, '8BIM', 4)) {
            throw new Error(`Error: Start tag not 8BIM but ${String.fromCharCode(...tag)} at position ${abrSdv.getPos()}`);
        }
        r = abrSdv.readRawData(tagname, 4);
        if (r != 4) {
            throw new Error('Error: Cannot read 8BIM tag name');
        }
        const s1: string = String.fromCharCode(...tagname);
        if (s1 == name) {
            return;
        }
        // long
        sectionSize = abrSdv.getUint32();
        abrSdv.setPos(abrSdv.getPos() + sectionSize);
    }
    return;
}

export function charCodeComparison(buffer: number[], str: string, num: number): boolean {
    if ((buffer.length < num) || (str.length < num)) return true;
    for (let i = 0; i < num; i++) {
        if (str.charCodeAt(i) !== buffer[i]) return true;
    }
    return false;
}

export async function loadAbrBrush(abrSdv: SequentialDataView, abrHeader: AbrHeader, filename: string, imageId: number, id: number){
    let layerId = -1;
    switch (abrHeader.version) {
    case 1:
        // fall through, version 1 and 2 are compatible
    case 2:
        layerId = await loadAbrBrushV12(abrSdv, abrHeader, filename, imageId, id);
        break;
    case 6:
        layerId = await loadAbrBrushV6(abrSdv, abrHeader, filename, imageId, id);
        break;
    }
    return layerId;
}

async function loadAbrBrushV6(abrSdv: SequentialDataView, abrHeader: AbrHeader, filename: string, imageId: number, id: number): Promise<number> {
    throw new Error('Function not implemented.');
}

async function loadAbrBrushV12(abrSdv: SequentialDataView, abrHeader: AbrHeader, filename: string, imageId: number, id: number): Promise<number> {
    let name = '';
    let layerId = -1;

    // short
    const brushType = abrSdv.getUint16();
    // long
    const brushSize = abrSdv.getUint32();
    const nextBrush = abrSdv.getPos() + brushSize;
    if (brushType == 1) {
        // computed brush
        abrSdv.setPos(abrSdv.getPos() + 4); //miscellaneous Long integer. Ignored
        const spacing = abrSdv.getUint16(); // 2 bytes Short integer from 0...999 where 0=no spacing.
        const diameter = abrSdv.getUint16(); // 2 bytes Short integer from 1...999.
        const roundness = abrSdv.getUint16(); // 2 bytes Short integer from 0...100.
        const angle = abrSdv.getInt16(); // 2 bytes Short integer from -180...180.
        const hardness = abrSdv.getUint16(); // 2 bytes Short integer from 0...100.
        name = abrV1BrushName(filename, id);
        abrBrushes.set(name, { brushType: brushType, spacing, diameter, roundness, angle, hardness, name });
        abrSdv.setPos(nextBrush);
        layerId = 1;
    }
    else if (brushType == 2) {
        // sampled brush
        // discard 4 misc bytes
        abrSdv.setPos(abrSdv.getPos() + 4);
        const spacing = abrSdv.getUint16();
        if (abrHeader.version == 2)
            name = readAbrUcs2Text(abrSdv);
        if (name === null) {
            name = abrV1BrushName(filename, id);
        }
        const antiAliasing = !!abrSdv.getUint8();
        // discard 4 short for short bounds
        abrSdv.setPos(abrSdv.getPos() + 8);
        // long bounds
        const top = abrSdv.getUint32();
        const left = abrSdv.getUint32();
        const bottom = abrSdv.getUint32();
        const right = abrSdv.getUint32();
        // short
        const depth = abrSdv.getUint16();
        // char
        const compression = abrSdv.getUint8();
        const width = right - left;
        const height = bottom - top;
        const size = width * (depth >> 3) * height;
        // FIXME: support wide brushes
        if (height > 16384) {
            console.warn('WARNING: wide brushes not supported');
            abrSdv.setPos(nextBrush);
        }
        else {
            const buffer: number[] = [];
            if (!compression) {
                // not compressed - read raw bytes as brush data
                abrSdv.readRawData(buffer, size);
            } else {
                rleDecode(abrSdv, buffer, height);
            }
            let abrBrush: AbrSampledBrush;
            const brushTipImage = convertCanvas(buffer, width, height);
            if (Object.keys(abrBrushes.map).includes(name)) {
                abrBrush = getDefaultSampledBrush(name);
            }
            else {
                abrBrush = getDefaultSampledBrush(name);
                const buf = new SequentialDataView(new ArrayBuffer(0));
                // FIXME: it should use a slice containing the brush sample to be useful
                abrBrush = { ...abrBrush, md5Sum: await crypto.subtle.digest('SHA-256', buf.data()) };
            }
            abrBrush = { ...abrBrush, brushTipImage };
            abrBrush = { ...abrBrush, valid: true };
            abrBrush = { ...abrBrush, name, spacing, antiAliasing };
            abrBrushes.set(name, abrBrush);
            layerId = 1;
        }
    }
    else {
        console.warn('Unknown ABR brush type, skipping.');
        abrSdv.setPos(nextBrush);
    }
    return layerId;
}

function abrV1BrushName(filename: string, id: number): string {
    const result = filename.split('');
    const pos = filename.lastIndexOf('.');
    result.splice(pos, 4);
    return result.join('') + '_' + id;
}

function rleDecode(abrSdv: SequentialDataView, data: number[], height: number) {
    // read compressed size foreach scan line
    const scanLines = Array.from({ length: height }, () => 0);
    for (let i = 0; i < height; i++) {
        // short
        scanLines[i] = abrSdv.getUint16();
    }
    // unpack each scan line data
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < scanLines[i];) {
            // char
            if (abrSdv.atEnd()) {
                break;
            }
            let n = abrSdv.getUint8();
            j++;
            if (n >= 128) // force sign
                n -= 256;
            if (n < 0) { // copy the following char -n + 1 times
                if (n == -128) // it's a nop
                    continue;
                n = -n + 1;
                // char
                const ch = abrSdv.getUint8();
                if (abrSdv.atEnd()) {
                    break;
                }
                j++;
                for (let k = 0; k < n; k++) {
                    data.push(ch);
                }
            }
            else {
                // read the following n + 1 chars (no compr)
                for (let c = 0; c < n + 1; c++, j++) {
                    // char
                    const ct = abrSdv.getUint8();
                    data.push(ct);
                    //data.pos++;
                    if (abrSdv.atEnd()) {
                        break;
                    }
                }
            }
        }
    }
    return 0;
}

function convertCanvas(buffer: number[], width: number, height: number): HTMLCanvasElement {
    const img = document.createElement('canvas');
    img.width = width;
    img.height = height;
    const ctx = img.getContext('2d');
    if (!ctx) throw new Error('Failed to construct context.');
    const pixel = ctx.getImageData(0, 0, width, height);
    let pos = 0;
    let value = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++, pos++) {
            value = 255 - buffer[pos];
            for (let i = 0; i < 3; i++) {
                pixel.data[y * width * 4 + x * 4 + i] = value;
            }
            pixel.data[y * width * 4 + x * 4 + 3] = 255;
        }
    }
    ctx.putImageData(pixel, 0, 0);
    return img;
}

function readAbrUcs2Text(abrSdv: SequentialDataView): string {
    let i: number;
    /* two-bytes characters encoded (UCS-2)
    *  format:
    *   long : size - number of characters in string
    *   data : zero terminated UCS-2 string
    */
    // long
    const nameSize = abrSdv.getUint32();
    if (nameSize == 0) {
        return '';
    }
    const bufSize = nameSize;
    const nameUcs2: number[] = [];
    for (i = 0; i < bufSize; i++) {
        //* char*/
        // I will use uint16 as that is input to fromUtf16
        nameUcs2[i] = abrSdv.getUint16();
    }
    const nameUtf8 = String.fromCharCode(...nameUcs2);
    return nameUtf8;
}