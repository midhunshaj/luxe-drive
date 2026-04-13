import { useEffect, useRef, useState } from 'react';

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);

  useEffect(() => {
    // Hide on mobile / touch devices
    if ('ontouchstart' in window) return;

    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Dot follows instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp   = () => setIsClicking(false);

    const onEnterInteractive = () => setIsHovering(true);
    const onLeaveInteractive = () => setIsHovering(false);

    const animate = () => {
      // Ring lags behind mouse with lerp
      ring.current.x += (mouse.current.x - ring.current.x) * 0.12;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.12;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px) translate(-50%, -50%)`;
      }
      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    // Attach hover detection to interactive elements
    const interactives = document.querySelectorAll(
      'a, button, input, textarea, select, label, [role="button"]'
    );
    interactives.forEach(el => {
      el.addEventListener('mouseenter', onEnterInteractive);
      el.addEventListener('mouseleave', onLeaveInteractive);
    });

    // Use a MutationObserver to catch dynamically added elements
    const observer = new MutationObserver(() => {
      const newInteractives = document.querySelectorAll(
        'a, button, input, textarea, select, label, [role="button"]'
      );
      newInteractives.forEach(el => {
        el.removeEventListener('mouseenter', onEnterInteractive);
        el.removeEventListener('mouseleave', onLeaveInteractive);
        el.addEventListener('mouseenter', onEnterInteractive);
        el.addEventListener('mouseleave', onLeaveInteractive);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      interactives.forEach(el => {
        el.removeEventListener('mouseenter', onEnterInteractive);
        el.removeEventListener('mouseleave', onLeaveInteractive);
      });
      observer.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Don't render on touch devices
  if ('ontouchstart' in window) return null;

  return (
    <>
      {/* Outer trailing ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] transition-[width,height,border-color,opacity] duration-300"
        style={{
          width: isHovering ? '50px' : '36px',
          height: isHovering ? '50px' : '36px',
          borderRadius: '50%',
          border: isHovering ? '1px solid rgba(212,175,55,0.9)' : '1px solid rgba(212,175,55,0.4)',
          opacity: isVisible ? 1 : 0,
          boxShadow: isHovering ? '0 0 15px rgba(212,175,55,0.3)' : 'none',
          mixBlendMode: 'normal',
        }}
      />

      {/* Inner dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] transition-[width,height,background-color,opacity] duration-150"
        style={{
          width: isClicking ? '6px' : isHovering ? '0px' : '6px',
          height: isClicking ? '6px' : isHovering ? '0px' : '6px',
          borderRadius: '50%',
          backgroundColor: '#D4AF37',
          opacity: isVisible ? 1 : 0,
          boxShadow: '0 0 8px rgba(212,175,55,0.8)',
        }}
      />
    </>
  );
};

export default CustomCursor;
