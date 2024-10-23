import { useState } from 'react';

export function FullScreenToggle() {
    const [locked, setLocked] = useState(false);
    const canChangeOrientation = typeof screen.orientation !== 'undefined';
    const unlock = ()=>{
        if (!(
            ('unlockOrientation' in screen)&&(typeof screen.unlockOrientation == 'function')&&screen.unlockOrientation()
            ||('mozUnlockOrientation' in screen)&&(typeof screen.mozUnlockOrientation == 'function')&&screen.mozUnlockOrientation()
            ||('msUnlockOrientation' in screen)&&(typeof screen.msUnlockOrientation == 'function')&&screen.msUnlockOrientation()
        )){
            screen.orientation.unlock();
        }
        document.exitFullscreen();
        setLocked(false);
    };
    const lock = ()=>{
        const elem = document.body;
        (
            elem.requestFullscreen()
            ||(('webkitRequestFullscreen' in elem)&&(typeof elem.webkitRequestFullscreen == 'function')&&elem.webkitRequestFullscreen())
            ||(('msRequestFullscreen' in elem)&&(typeof elem.msRequestFullscreen == 'function')&&elem.msRequestFullscreen())
        )
            .then(()=>{
                if (
                    ('msLockOrientation' in screen)&&(typeof screen.msLockOrientation == 'function')&&screen.msLockOrientation('landscape')
                    ||('mozLockOrientation' in screen)&&(typeof screen.mozLockOrientation == 'function')&&screen.mozLockOrientation('landscape')
                    ||('lockOrientation' in screen)&&(typeof screen.lockOrientation == 'function')&&screen.lockOrientation('landscape')
                ) {
                    // Orientation was locked
                    setLocked(true);
                } else if (('lock' in screen.orientation)&&(typeof screen.orientation.lock == 'function')) {
                    screen.orientation
                        .lock('landscape')
                        .then(() => {
                            // Orientation was locked
                            setLocked(true);
                        })
                        .catch((error: string) => {
                            // Orientation lock failed
                            unlock();
                        });
                } else {
                // Orientation lock failed
                    unlock();
                }
            })
            .catch((error: string) => {
                // Orientation lock failed
                unlock();
            });
    };
    return (
        <>
            {canChangeOrientation&&<div style={{ position: 'absolute', top: 0, right: 0 }}>
                {locked?
                    <button onClick={unlock}>unlock screen</button>
                    :<button onClick={lock}>lock screen</button>
                }
            </div>}
        </>
    );
}