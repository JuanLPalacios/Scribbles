import JSZip from 'jszip';
import { Serialized, SerializedValue, CompressedValue, Compressed, isSerializedImageData } from './Serialization';
import { serializeImageData, deserializeImageData } from './serializeJSON';

type SbrVersionInfo = {
    version:number
    subVersion:number
};

type Context = {
    zip: JSZip
    types:{
        [key:string]: {dir:JSZip; count:number }
    }
};

const CANVAS:HTMLCanvasElement = document.createElement('canvas');
const CTX = CANVAS.getContext('2d');

export const SBR = {
    jsonObj(file: File) {
        const zip = new JSZip();
        return zip.loadAsync(file)
            .then((zip)=>
                zip.files['version.json'].async('string')
                    .then(JSON.parse)
                    .then((version:SbrVersionInfo)=>
                        zip.files['content.json'].async('string')
                            .then(JSON.parse)
                            .then(async (zippedBrushes:Compressed[])=>{
                                const context:Context = { zip, types: {} };
                                const unzipDataFunction = getUnzipDataFunction(version);
                                const brushes:Serialized[] = [];
                                for (let i = 0; i < zippedBrushes.length; i++) {
                                    const
                                        zippedBrush:Compressed = zippedBrushes[i],
                                        brush:Serialized = {};
                                    for (const key in zippedBrush) {
                                        if (Object.prototype.hasOwnProperty.call(zippedBrush, key)) {
                                            brush[key] = await unzipDataFunction(zippedBrush[key], context);
                                        }
                                    }
                                    brushes.push(brush);
                                }
                                return brushes;
                            })
                    )
            );
    },

    async binary(brushes: Serialized[]) {
        const zip = new JSZip();
        const dir = zip.folder('img');
        if((!dir))throw new Error('JSZip folder could not be created');
        const version:SbrVersionInfo = {
            version: 1,
            subVersion: 1
        };
        zip.file('version.json', JSON.stringify(version));
        const context = { zip, types: { img: { dir, count: 0 } } };
        const zippedBrushes:Compressed[] = [];
        for (let i = 0; i < brushes.length; i++) {
            const
                brush:Serialized = brushes[i],
                zippedBrush:Compressed = {};
            for (const key in brush) {
                if (Object.prototype.hasOwnProperty.call(brush, key)) {
                    zippedBrush[key] = await zipDataV1S1(brush[key], context);
                }
            }
            zippedBrushes.push(zippedBrush);
        }
        zip.file('content.json', JSON.stringify(zippedBrushes));
        return zip.generateAsync({ type: 'blob' });
    }
};

function zipDataV1S1(value: SerializedValue, context: Context):Promise<CompressedValue> {
    return (async ():Promise<CompressedValue> => {
        if(typeof value !==  'object')return value;
        if(Array.isArray(value))return Promise.all(value.map(x=>zipDataV1S1(x, context)));
        if(!isSerializedImageData(value)) return { type: 'json', value: JSON.stringify(value) };
        if(!CTX) return '';
        const imageData = deserializeImageData(value, CANVAS, CTX);
        CANVAS.width = value.width;
        CANVAS.height = value.height;
        CTX.putImageData(imageData, 0, 0);
        const fileNumber = context.types.img.count++;
        const filename = `${fileNumber}.png`;
        context.types.img.dir.file(filename, await new Promise<Blob>(res => CANVAS.toBlob(t=>{ if(t)res(t); }, 'image/png')));
        return ({ type: 'img', value: `data:img/${filename}` });
    })();
}

function getUnzipDataFunction({ version, subVersion }: SbrVersionInfo): ((value: CompressedValue, context: Context) => Promise<SerializedValue>) {
    switch (version) {
    case 1:
        return getUnzipDataV1(subVersion);
    default:
        throw new Error('Version not supported');
    }
}

function getUnzipDataV1(subVersion : number): ((value: CompressedValue, context: Context) => Promise<SerializedValue>) {
    switch (subVersion) {
    case 1:
        return unzipDataV1S1;
    default:
        throw new Error('Version not supported');
    }
}

function unzipDataV1S1(value : CompressedValue, context:Context): Promise<SerializedValue> {
    return new Promise<SerializedValue>((resolve, reject) => {
        if(typeof value !=  'object')return resolve(value);
        if(Array.isArray(value))return resolve(Promise.all(value.map(x=>unzipDataV1S1(x, context))));
        if(value.type === 'json')return resolve(value);
        if(!CTX) return reject();
        const file = value.value.substring(5);
        const contentType = getContentType(file);
        return resolve(context.zip
            .files[file]
            .async('base64')
            .then(base64=>(dataURLFormat(contentType, base64)))
            .then(url=>(new Promise<SerializedValue>((resolve, reject) => {
                if(!CTX) return reject();
                const img = new Image;
                img.onload = async ()=>{
                    CANVAS.width = 0; //forces the canvas to clear
                    CANVAS.width = img.width;
                    CANVAS.height = img.height;
                    CTX.globalCompositeOperation = 'source-over';
                    CTX.drawImage(img, 0, 0);
                    resolve(serializeImageData(CTX.getImageData(0, 0, CANVAS.width, CANVAS.height)));
                };
                img.onerror = reject;
                img.src = url;
            }))
            )
        );
    });
}

function getContentType(file: string) {
    //FIXME: some extensions may need to parse contents identify if they are audio or video.
    const extension = file.split('.').pop();
    switch (extension) {
    case 'aac':
        return 'audio/aac';
    case 'abw':
        return 'application/x-abiword';
    case 'apng':
        return 'image/apng';
    case 'arc':
        return 'application/x-freearc';
    case 'avif':
        return 'image/avif';
    case 'avi':
        return 'video/x-msvideo';
    case 'azw':
        return 'application/vnd.amazon.ebook';
    case 'bin':
        return 'application/octet-stream';
    case 'bmp':
        return 'image/bmp';
    case 'bz':
        return 'application/x-bzip';
    case 'bz2':
        return 'application/x-bzip2';
    case 'cda':
        return 'application/x-cdf';
    case 'csh':
        return 'application/x-csh';
    case 'css':
        return 'text/css';
    case 'csv':
        return 'text/csv';
    case 'doc':
        return 'application/msword';
    case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'eot':
        return 'application/vnd.ms-fontobject';
    case 'epub':
        return 'application/epub+zip';
    case 'gz':
        return 'application/gzip';
    case 'gif':
        return 'image/gif';
    case 'htm':
    case 'html':
        return 'text/html';
    case 'ico':
        return 'image/vnd.microsoft.icon';
    case 'ics':
        return 'text/calendar';
    case 'jar':
        return 'application/java-archive';
    case 'jpeg':
    case 'jpg':
        return 'image/jpeg';
    case 'js':
        return 'text/javascript';
    case 'json':
        return 'application/json';
    case 'jsonld':
        return 'application/ld+json';
    case 'mid':
    case 'midi':
        return 'audio/midi';
        //FIXME: maybe audio/x-midi needs to be included
    case 'mjs':
        return 'text/javascript';
    case 'mp3':
        return 'audio/mpeg';
    case 'mp4':
        return 'video/mp4';
    case 'mpeg':
        return 'video/mpeg';
    case 'mpkg':
        return 'application/vnd.apple.installer+xml';
    case 'odp':
        return 'application/vnd.oasis.opendocument.presentation';
    case 'ods':
        return 'application/vnd.oasis.opendocument.spreadsheet';
    case 'odt':
        return 'application/vnd.oasis.opendocument.text';
    case 'oga':
        return 'audio/ogg';
    case 'ogv':
        return 'video/ogg';
    case 'ogx':
        return 'application/ogg';
    case 'opus':
        return 'audio/ogg';
    case 'otf':
        return 'font/otf';
    case 'png':
        return 'image/png';
    case 'pdf':
        return 'application/pdf';
    case 'php':
        return 'application/x-httpd-php';
    case 'ppt':
        return 'application/vnd.ms-powerpoint';
    case 'pptx':
        return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'rar':
        return 'application/vnd.rar';
    case 'rtf':
        return 'application/rtf';
    case 'sh':
        return 'application/x-sh';
    case 'svg':
        return 'image/svg+xml';
    case 'tar':
        return 'application/x-tar';
    case 'tif':
    case 'tiff':
        return 'image/tiff';
    case 'ts':
        return 'video/mp2t';
    case 'ttf':
        return 'font/ttf';
    case 'txt':
        return 'text/plain';
    case 'vsd':
        return 'application/vnd.visio';
    case 'wav':
        return 'audio/wav';
    case 'weba':
        return 'audio/webm';
    case 'webm':
        return 'video/webm';
    case 'webp':
        return 'image/webp';
    case 'woff':
        return 'font/woff';
    case 'woff2':
        return 'font/woff2';
    case 'xhtml':
        return 'application/xhtml+xml';
    case 'xls':
        return 'application/vnd.ms-excel';
    case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'xml':
        return 'application/xml';
    case 'xul':
        return 'application/vnd.mozilla.xul+xml';
    case 'zip':
        return 'application/zip';
    case '3gp':
        return 'video/3gpp';
        // audio/3gpp if it doesn't contain video
    case '3g2':
        return 'video/3gpp2';
        // audio/3gpp2 if it doesn't contain video
    case '7z':
        return 'application/x-7z-compressed';
    default:
        throw new Error('extension not supported');
    }
}

function dataURLFormat(contentType: string, base64: string): string {
    return `data:${contentType};base64,${base64}`;
}

export function getExtension(value:string) {
    const contentType = (value.split(';base64,')[0]||'')?.substring(5);
    switch (contentType) {
    case 'audio/aac':
        return 'aac';
    case 'application/x-abiword':
        return 'abw';
    case 'image/apng':
        return 'apng';
    case 'application/x-freearc':
        return 'arc';
    case 'image/avif':
        return 'avif';
    case 'video/x-msvideo':
        return 'avi';
    case 'application/vnd.amazon.ebook':
        return 'azw';
    case 'application/octet-stream':
        return 'bin';
    case 'image/bmp':
        return 'bmp';
    case 'application/x-bzip':
        return 'bz';
    case 'application/x-bzip2':
        return 'bz2';
    case 'application/x-cdf':
        return 'cda';
    case 'application/x-csh':
        return 'csh';
    case 'text/css':
        return 'css';
    case 'text/csv':
        return 'csv';
    case 'application/msword':
        return 'doc';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'docx';
    case 'application/vnd.ms-fontobject':
        return 'eot';
    case 'application/epub+zip':
        return 'epub';
    case 'application/gzip':
    case 'application/x-gzip':
        return 'gz';
    case 'image/gif':
        return 'gif';
    case 'text/html':
        return 'html';
    case 'image/vnd.microsoft.icon':
        return 'ico';
    case 'text/calendar':
        return 'ics';
    case 'application/java-archive':
        return 'jar';
    case 'image/jpeg':
        return 'jpg';
    case 'text/javascript':
        return 'js';
    case 'application/json':
        return 'json';
    case 'application/ld+json':
        return 'jsonld';
    case 'audio/midi':
    case 'audio/x-midi':
        return 'midi';
    case 'audio/mpeg':
        return 'mp3';
    case 'video/mp4':
        return 'mp4';
    case 'video/mpeg':
        return 'mpeg';
    case 'application/vnd.apple.installer+xml':
        return 'mpkg';
    case 'application/vnd.oasis.opendocument.presentation':
        return 'odp';
    case 'application/vnd.oasis.opendocument.spreadsheet':
        return 'ods';
    case 'application/vnd.oasis.opendocument.text':
        return 'odt';
    case 'audio/ogg':
        return 'oga';
    case 'video/ogg':
        return 'ogv';
    case 'application/ogg':
        return 'ogx';
    case 'font/otf':
        return 'otf';
    case 'image/png':
        return 'png';
    case 'application/pdf':
        return 'pdf';
    case 'application/x-httpd-php':
        return 'php';
    case 'application/vnd.ms-powerpoint':
        return 'ppt';
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return 'pptx';
    case 'application/vnd.rar':
        return 'rar';
    case 'application/rtf':
        return 'rtf';
    case 'application/x-sh':
        return 'sh';
    case 'image/svg+xml':
        return 'svg';
    case 'application/x-tar':
        return 'tar';
    case 'image/tiff':
        return 'tiff';
    case 'video/mp2t':
        return 'ts';
    case 'font/ttf':
        return 'ttf';
    case 'text/plain':
        return 'txt';
    case 'application/vnd.visio':
        return 'vsd';
    case 'audio/wav':
        return 'wav';
    case 'audio/webm':
        return 'weba';
    case 'video/webm':
        return 'webm';
    case 'image/webp':
        return 'webp';
    case 'font/woff':
        return 'woff';
    case 'font/woff2':
        return 'woff2';
    case 'application/xhtml+xml':
        return 'xhtml';
    case 'application/vnd.ms-excel':
        return 'xls';
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return 'xlsx';
    case 'application/xml':
    case 'application/atom+xml':
        return 'xml';
    case 'application/vnd.mozilla.xul+xml':
        return 'xul';
    case 'application/zip':
    case 'x-zip-compressed':
        return 'zip';
    case 'video/3gpp':
    case 'audio/3gpp':
        return '3gp';
    case 'video/3gpp2':
    case 'audio/3gpp2':
        return '3g2';
    case 'application/x-7z-compressed':
        return '7z';
    default:
        throw new Error('MIME content type unknown');
    }
}

export function isDataUrl(value:string):boolean {
    return value.startsWith('data:');
}

