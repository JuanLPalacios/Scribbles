/**
 * Detects system-level pointer/pen stabilization features
 * to prevent redundant stabilization on first run
 */
export function detectSystemStabilization(): number {
    // Check for Pointer Events Level 2 features (getPredictedEvents, getCoalescedEvents)
    const hasAdvancedPointerEvents = 'getCoalescedEvents' in PointerEvent.prototype ||
        'getPredictedEvents' in PointerEvent.prototype;

    // Check for stylus/pen API support (indicates more advanced input handling)
    const hasStylusSupport = 'PointerEvent' in window &&
        navigator?.maxTouchPoints !== undefined &&
        navigator.maxTouchPoints > 0;

    // Check for touch-action CSS property support
    const hasTouchActionSupport = 'touchAction' in document.documentElement.style;

    // Check browser vendor for known stabilization implementations
    const userAgent = navigator.userAgent.toLowerCase();
    const isChrome = /chrome|chromium|crios/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);

    // Detect OS-level stabilization
    // macOS and iOS have excellent built-in pointer smoothing
    const isMacOS = /mac|iphone|ipad/.test(userAgent);
    // Windows has native pointer smoothing
    const isWindows = /windows|win32/.test(userAgent);
    // Android has gesture recognition but less smoothing
    const isAndroid = /android/.test(userAgent);

    let stabilizationLevel = 1; // default

    // If system has advanced pointer event features, reduce our stabilization
    if (hasAdvancedPointerEvents) {
        stabilizationLevel = 0.4;
    }

    // macOS/iOS has excellent native smoothing
    if (isMacOS) {
        stabilizationLevel = Math.min(stabilizationLevel, 0.3);
    }
    // Windows has decent native pointer smoothing
    else if (isWindows) {
        stabilizationLevel = Math.min(stabilizationLevel, 0.5);
    }
    // Android and other systems need more stabilization
    else if (isAndroid) {
        stabilizationLevel = Math.max(stabilizationLevel, 1);
    }

    // Safari has excellent pointer handling
    if (isSafari) {
        stabilizationLevel = Math.min(stabilizationLevel, 0.35);
    }
    // Chrome on desktop has good pointer handling
    else if (isChrome && !isAndroid) {
        stabilizationLevel = Math.min(stabilizationLevel, 0.6);
    }

    // Stylus support indicates professional input device
    if (hasStylusSupport && hasTouchActionSupport) {
        stabilizationLevel = 0;
    }

    // Clamp to reasonable range
    return Math.max(0, Math.min(1, stabilizationLevel));
}
