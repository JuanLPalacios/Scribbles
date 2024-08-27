import JSZip from 'jszip';
import { SerializedBrush } from './Serialization';

type SbrVersionInfo = {
    version:number
    subVersion:number
};

type Serialized = {[key:string]:JSONValue};
type JSONValue = number | string | boolean | Obj;
type Obj = { type: 'img', value:string };
type Cont = {
    zip: JSZip
    types:{
        [key:string]: {dir:JSZip; count:number }
    }
};

const CANVAS:HTMLCanvasElement = document.createElement('canvas');
const CTX = CANVAS.getContext('2d');

export const SBR = {
    async jsonObj(file: File) {
        return new JSZip()
            .loadAsync(file)
            .then((zip)=>
                zip.files['version.json'].async('string')
                    .then(JSON.parse)
                    .then((version:SbrVersionInfo)=>
                        zip.files['content.json'].async('string')
                            .then(JSON.parse)
                            .then(async (brushes:Serialized[])=>{
                                const context:Cont = { zip, types: {} };
                                const unzipData = getUnzipData(version);
                                for (let i = 0; i < brushes.length; i++) {
                                    const
                                        brush:Serialized = brushes[i],
                                        zipedBrush:Serialized = {};
                                    for (const key in brush) {
                                        if (Object.prototype.hasOwnProperty.call(brush, key)) {
                                            zipedBrush[key] = await unzipData(brush[key], context);
                                        }
                                    }
                                }
                            })
                    )
            );
    },

    async binary(brushes: SerializedBrush[]) {
        const zip = new JSZip();
        const dir = zip.folder('images');
        if((!dir))throw new Error('JSZip folder could not be created');
        const context = { zip, types: { img: { dir, count: 0 } } };
        for (let i = 0; i < brushes.length; i++) {
            const
                brush:Serialized = brushes[i],
                zipedBrush:Serialized = {};
            for (const key in brush) {
                if (Object.prototype.hasOwnProperty.call(brush, key)) {
                    zipedBrush[key] = await zipDataV1(brush[key], context);
                }
            }
        }
        return zip.generateAsync({ type: 'blob' });
    }
};

function zipDataV1(value: JSONValue, context: Cont):Promise<JSONValue> {
    return new Promise<JSONValue>((resolve, reject) => {
        if(typeof value !=  'object')return resolve(value);
        if(!isDataUrl(value.value))return resolve(value);
        const extension = getExtension(value.value);
        const fileNumber = context.types.img.count++;
        const filename = `${fileNumber}.${extension}`;
        if(!CTX) return;
        const img = new Image;
        img.onload = async ()=>{
            CANVAS.width = 0; //forces the canvas to clear
            CANVAS.width = img.width;
            CANVAS.height = img.height;
            CTX.globalCompositeOperation = 'source-over';
            CTX.drawImage(img, 0, 0);
            context.types.img.dir.file(filename, await new Promise<Blob>(res => CANVAS.toBlob(t=>{ if(t)res(t); })));
            resolve({ type: 'img', value: `data:img/${filename}` });
        };
        img.onerror = reject;
        img.src = value.value;
    });
}

function getUnzipData({ version, subVersion }: SbrVersionInfo): ((value: JSONValue, context: Cont) => Promise<JSONValue>) {
    switch (version) {
    case 1:
        return getUnzipDataV1(subVersion);
    default:
        throw new Error('Version not supported');
    }
}

function getUnzipDataV1(subVersion : number): ((value: JSONValue, context: Cont) => Promise<JSONValue>) {
    switch (subVersion) {
    case 1:
        return unzipDataV1S1;
    default:
        throw new Error('Version not supported');
    }
}

function unzipDataV1S1(value : JSONValue, context:Cont): Promise<JSONValue> {
    return new Promise<JSONValue>((resolve, reject) => {
        if(typeof value !=  'object')return resolve(value);
        if(!CTX) return;
        const file = value.value.substring(5);
        const contentType = getContentType(file);
        return context.zip
            .files[file]
            .async('base64')
            .then(base64=>dataURLFormat(contentType, base64));
    });
}

function getContentType(file: string):string {
    throw new Error('Function not implemented.');
}

function dataURLFormat(contentType: string, base64: string): string | PromiseLike<string> {
    return `data:${contentType};base64,${base64}`;
}

function getExtension(value:string):string {
    throw new Error('Function not implemented.');
}

function isDataUrl(value:string):boolean {
    throw new Error('Function not implemented.');
}

