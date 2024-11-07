const anchor = document.getElementById('canvas-console');
if(!anchor)throw new Error('anchor not found');

export const canvasConsole = {
    log(params:HTMLElement) {
        anchor.appendChild(params);
    },
    clear() {
        for (let index = 0; index < anchor.children.length; index++) {
            const element = anchor.children[index];
            anchor.removeChild(element);
        }
    },
};