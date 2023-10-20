import React, { useEffect, useRef } from 'react';

function HorizontalSlider({ children }) {
    const sliderRef = useRef(null);

    useEffect(() => {
        const slider = sliderRef.current;
        let isDown = false;
        let startX;
        let scrollLeft;

        const handleMouseDown = e => {
            isDown = true;
            slider.classList.add("active");
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        };

        const handleMouseLeave = () => {
            isDown = false;
            slider.classList.remove("active");
        };

        const handleMouseUp = () => {
            isDown = false;
            slider.classList.remove("active");
        };

        const handleMouseMove = e => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = x - startX;
            slider.scrollLeft = scrollLeft - walk;
        };

        slider.addEventListener("mousedown", handleMouseDown);
        slider.addEventListener("mouseleave", handleMouseLeave);
        slider.addEventListener("mouseup", handleMouseUp);
        slider.addEventListener("mousemove", handleMouseMove);

        return () => {
            slider.removeEventListener("mousedown", handleMouseDown);
            slider.removeEventListener("mouseleave", handleMouseLeave);
            slider.removeEventListener("mouseup", handleMouseUp);
            slider.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <div ref={sliderRef} className="scroll" style={{ overflowX: 'auto', cursor: 'pointer' }}>
            {children}
        </div>
    );
}

export default HorizontalSlider;