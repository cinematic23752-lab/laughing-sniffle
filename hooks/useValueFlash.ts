import { useState, useEffect, useRef } from 'react';

/**
 * A custom hook that returns a CSS class name to create a "flash" animation
 * when a value changes.
 * @param value The value to monitor for changes.
 * @returns A string containing the CSS class for the animation ('flash-green', 'flash-red', 'flash-blue'), or an empty string.
 */
export const useValueFlash = (value: any) => {
    const [flashClass, setFlashClass] = useState('');
    const prevValueRef = useRef(value);

    useEffect(() => {
        // Only trigger flash if the value has actually changed
        if (prevValueRef.current !== undefined && prevValueRef.current !== value) {
            // Try to parse numeric values to determine change direction
            const numericValue = parseFloat(String(value).replace(/[^0-9.-]+/g,""));
            const numericPrevValue = parseFloat(String(prevValueRef.current).replace(/[^0-9.-]+/g,""));
            
            if (!isNaN(numericValue) && !isNaN(numericPrevValue)) {
                 if (numericValue > numericPrevValue) setFlashClass('flash-green');
                 else if (numericValue < numericPrevValue) setFlashClass('flash-red');
                 else setFlashClass('flash-blue'); // Value is numerically the same but type might have changed (e.g. "100" vs 100)
            } else {
                 setFlashClass('flash-blue'); // Default for non-numeric or first-time changes
            }

            // Reset the class after the animation completes
            const timer = setTimeout(() => setFlashClass(''), 1500);
            
            // Update the ref to the new value for the next comparison
            prevValueRef.current = value;
            
            return () => clearTimeout(timer);
        } else if (prevValueRef.current === undefined) {
            // Initialize ref on first render
            prevValueRef.current = value;
        }
    }, [value]);

    return flashClass;
};
