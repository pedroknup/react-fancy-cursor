import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { CursorRef, FancyCursor } from './fancy-cursor';

type FancyMouseWrapperProps = {
  children: React.ReactNode;
  color?: string;
  cursorSize?: number;
};

const FancyCursorWrapper = ({ children, color, cursorSize }: FancyMouseWrapperProps) => {
  const [xPosition, setXPosition] = useState(0);
  const cursorRef = useRef<CursorRef>(null);
  const [yPosition, setYPosition] = useState(0);

  const handleOnCustomEvent = (event: any) => {
    if (!cursorRef.current) return;

    const { type, element, text } = event.detail;
    cursorRef.current.setCursorType(type);

    cursorRef.current.setHoverElement(element);
    cursorRef.current.setText(text);
  };

  const handleMouseMove = (event: any) => {
    setXPosition(event.clientX);
    setYPosition(event.clientY);
  };

  useEffect(() => {
    window.addEventListener('customEvent', handleOnCustomEvent);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('customEvent', handleOnCustomEvent);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {children}
      <FancyCursor color={color} ref={cursorRef} x={xPosition} y={yPosition} size={cursorSize} />
    </>
  );
};
type CursorTypes = 'default' | 'pointer' | 'text' | 'hover' | 'drag' | 'none';

const changeMouseType = (type: CursorTypes, param?: HTMLElement | string) => {
  let event;

  if (typeof param === 'string') {
    event = new CustomEvent('customEvent', {
      bubbles: true,
      detail: { type, text: param },
    });
  } else {
    const element = type === 'hover' ? param : undefined;
    event = new CustomEvent('customEvent', {
      bubbles: true,
      detail: { type, element },
    });
  }
  window.dispatchEvent(event);
};

export { FancyCursorWrapper, changeMouseType };
