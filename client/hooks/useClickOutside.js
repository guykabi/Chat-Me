import { useState, useEffect, useRef } from 'react';

 const useClickOutSide = (initialIsVisible)=> {
    const [isVisible, setIsVisible] = useState(initialIsVisible);
    const visibleRef = useRef(null);

    const handleClickOutside = (e) => {
        if (visibleRef.current && !visibleRef.current.contains(e.target)) {
            setIsVisible(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside, true);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
        };
    });

    return { visibleRef, isVisible, setIsVisible };
} 

export default useClickOutSide