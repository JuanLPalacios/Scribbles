import '../../css/inputs/InputColor.css';
import dropperIcon from '../../icons/eyedropper-svgrepo-com.svg';
import { CustomInput } from '../../types/CustomInput';
import { useColorPicker } from '../../hooks/useColorPicker';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { hexToHsl, hslToHex } from '../../lib/rgbToHex';

export function InputColor({ value='#000000', name, className, dropper=true, onChange, onBlur, onClick }: {
    value?: string
    name?: string
    dropper?: boolean
    className?: string
    onClick?: (e: React.MouseEventHandler<HTMLInputElement>) => void
    onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
    const [{ color, active }, { activateColorPicker, changeColor }] = useColorPicker();
    const ref2 = useRef<HTMLInputElement>(null);
    const [changing, setChanging] = useState(false);
    const [focus, setFocus] = useState(false);
    const [focus2, setFocus2] = useState(false);
    const [h, s, l] = hexToHsl(color||value);
    const [hue, setHue] = useState(h);
    const [rawX, setX] = useState(s);
    const [rawY, setY] = useState(l*(1+s/100));
    const [popX, setPopX] = useState(0);
    const [popY, setPopY] = useState(0);
    const y = useMemo(()=>Math.min(100, Math.max(0, rawY)), [rawY]);
    const x = useMemo(()=>Math.min(100, Math.max(0, rawX)), [rawX]);
    const lumus = useMemo(()=>y/(1+x/100), [y, x]);
    const currentColor = useMemo(()=>hslToHex(hue, x, lumus), [hue, lumus, x]);
    const setColor = useCallback((color: string) => {
        if(!color)return;
        if (ref2.current && onChange) {
            if(value==color)return;
            ref2.current.value = color;
            const target: EventTarget & HTMLInputElement = {
                ...ref2.current,
                value: color
            };
            const nativeEvent = new Event('change', { bubbles: false, cancelable: false, composed: true });
            const { bubbles, type, cancelable, defaultPrevented, eventPhase, isTrusted, preventDefault, stopPropagation, timeStamp } = nativeEvent;
            onChange({
                nativeEvent,
                currentTarget: target,
                target,
                bubbles,
                cancelable,
                defaultPrevented,
                eventPhase,
                isTrusted,
                preventDefault,
                isDefaultPrevented: () => false,
                stopPropagation,
                isPropagationStopped: () => false,
                persist: () => { },
                timeStamp,
                type
            });
        }
    }, [onChange, value]);
    const internalBlur = useCallback((color: string) => {
        if(!color)return ()=>{};
        setColor(color);
        if(!ref2.current)return ()=>{};
        ref2.current.value = color || '#000000';
        const nativeEvent = new Event('blur', { bubbles: false, cancelable: false, composed: true });
        const { bubbles, type, cancelable, defaultPrevented, eventPhase, isTrusted, preventDefault, stopPropagation, timeStamp } = nativeEvent;
        if(onBlur&&ref2.current)onBlur({
            nativeEvent,
            currentTarget: ref2.current,
            target: ref2.current,
            bubbles,
            cancelable,
            defaultPrevented,
            eventPhase,
            isTrusted,
            preventDefault,
            isDefaultPrevented: () => false,
            stopPropagation,
            isPropagationStopped: () => false,
            persist: () => { },
            timeStamp,
            type
        });
    }, [onBlur, setColor]);
    useEffect(()=>{
        if(active)return ()=>{};
        if(!color)return ()=>{};
        internalBlur(color);
        changeColor(undefined);
    }, [active, color]);
    useEffect(()=>{
        console.log(focus, focus2);
        if(active)return ()=>{};
        if(focus||focus2)return ()=>{};
        internalBlur(hslToHex(hue, x, lumus));
    }, [focus, focus2]);
    useEffect(()=>{
        if(!value)return ()=>{};
        if(value==currentColor)return ()=>{};
        const [h, s, l] = hexToHsl(value);
        setHue(h);
        setX(s);
        setY(l*(1+s/100));
    }, [currentColor, value]);
    return <div className={'InputColor dropdown '+className}>
        <input type="color" name={name} ref={ref2} value={color || value} style={{ display: 'none' }} />
        <button className='body' title={name} style={{ background: currentColor }}  onClick={()=>{
            if(onClick)onClick(()=>{});
        }}
        onPointerDown={(e)=>{
            if(!e.currentTarget)return;
            const { top, right, width, height } = e.currentTarget.getBoundingClientRect();
            let clientX = right, clientY = top;
            if (window.matchMedia('(orientation: portrait)').matches){
                clientX=screen.availHeight - clientY;
                clientY=right;
            }
            let subMenu = false;
            let current:HTMLElement|null = e.currentTarget;
            while (current) {
                if(current.style.position=='fixed')subMenu = true;
                current = current.parentElement;
            }
            if(subMenu){
                if (window.matchMedia('(orientation: portrait)').matches){
                    clientX=e.currentTarget.offsetLeft;
                    clientY=e.currentTarget.offsetTop+width;
                }
                else {
                    clientX=e.currentTarget.offsetLeft;
                    clientY=e.currentTarget.offsetTop+height;
                }
            }
            setPopX(clientX);
            setPopY(clientY);
        }}>
        </button>
        <ul>
            <li>
                <button title={name} className='popup' onPointerDown={e=>{ e.currentTarget.focus(); }} onFocus={()=>{ setFocus(true); }} onBlur={()=>{ setFocus(false); }}
                    style={{
                        top: `${popY}px`,
                        left: `${popX}px`,
                    }} >
                    <div style={{
                        width: '100px',
                        height: '100px',
                        position: 'relative',
                        backgroundImage:
                            `
                            linear-gradient(180deg, #FFFFFF00 0%, #000000FF 100%),
                            linear-gradient(-90deg, hsl(${hue}deg 100% 50%) 0%, hsl(${hue}deg 100% 100%) 100%) 
                            `,
                    }}
                    onPointerDown={e=>{
                        setChanging(true);
                        setY(100-e.nativeEvent.offsetY);
                        setX(e.nativeEvent.offsetX);
                        setColor(hslToHex(hue, e.nativeEvent.offsetX, (100-e.nativeEvent.offsetY)/(1+e.nativeEvent.offsetX/100)));
                    }}
                    onPointerUp={e=>{
                        setChanging(false);
                        setY(100-e.nativeEvent.offsetY);
                        setX(e.nativeEvent.offsetX);
                        setColor(hslToHex(hue, e.nativeEvent.offsetX, (100-e.nativeEvent.offsetY)/(1+e.nativeEvent.offsetX/100)));
                    }}
                    onPointerLeave={()=>{
                        setChanging(false);
                    }}
                    onPointerMove={e=>{
                        if(!changing) return;
                        setY(100-e.nativeEvent.offsetY);
                        setX(e.nativeEvent.offsetX);
                        setColor(hslToHex(hue, e.nativeEvent.offsetX, (100-e.nativeEvent.offsetY)/(1+e.nativeEvent.offsetX/100)));
                    }}>
                        <div style={{
                            position: 'absolute',
                            width: '10px',
                            height: '10px',
                            left: `${x}%`,
                            bottom: `${y}%`,
                            transform: 'translate(-5px, 5px)',
                            boxSizing: 'border-box',
                            border: 'solid 1px var(--background-color)',
                            borderRadius: '5px',
                            background: 'var(--text-color)',
                            pointerEvents: 'none'
                        }}></div>
                    </div>
                    {dropper?<div className={'dropper btn '+(active?'active':'')} onClick={activateColorPicker}><img src={dropperIcon} alt='color picker'/></div>:<div></div>}
                    <div className='hue-bar' style={{
                        backgroundImage:
                            `
                            linear-gradient(90deg, 
                                ${[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(percent=>`hsl(${~~(360*percent/100)}deg 100% 50%) ${percent}%`).join(', ')}
                            ) 
                            `
                    }}>
                        <div style={{ left: `${hue/3.6}px`, position: 'absolute', background: 'var(--text-color)', width: '4px', height: '100%', boxSizing: 'border-box', border: 'solid 1px var(--background-color)', transform: 'translate(-2px, 0)' }}></div>
                        <input type="range" value={hue} min={0} max={360} style={{ margin: '0 -8px' }} onFocus={()=>{ setFocus2(true); }} onBlur={()=>{ setFocus2(false); }} onChange={e=>{
                            setColor(hslToHex(parseInt(e.target.value), x, lumus));
                            setHue(parseInt(e.target.value));
                        }}/>
                    </div>
                </button>
            </li>
        </ul>
    </div>;
}
export type PaletteInput = CustomInput<string[]>;
