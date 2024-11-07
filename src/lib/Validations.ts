export function validateFileName(name:string) {
    const errors:string[] = [];
    if(name.length<1)
        errors.push('Must have at least 1 character');
    if(name.match(/[,#%&\\<>*?/$!'":@`|=]/gi))
        errors.push('Should not contain forbidden characters');
    return errors;
}