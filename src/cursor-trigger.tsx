import React from 'react';
import { changeMouseType } from './fancy-cursor-wrapper';
import styles from './cursor-trigger.module.css';
import { useEffect, useRef } from 'react';

type CursorTypes = 'default' | 'pointer' | 'text' | 'hover' | 'drag' | 'none';

type HoverTriggerProps = {
  children: React.ReactNode;
  padding?: number;
  text?: string;
  type: CursorTypes;
};

const CursorTrigger = function CursorTrigger({
  children,
  padding,
  text,
  type,
}: HoverTriggerProps) {
  const hoverTriggerRef = useRef<HTMLDivElement>(null);

  const handleOnMouseEnter = () => {
    if (type === 'hover')
      changeMouseType('hover', hoverTriggerRef.current ?? undefined);
    else if (type === 'pointer') changeMouseType('pointer', text);
  };

  const handleOnMouseLeave = () => {
    changeMouseType('default', undefined);
  };

  useEffect(() => {
    if (!hoverTriggerRef.current) return;

    hoverTriggerRef.current.style.setProperty(
      '--hover-trigger-padding',
      `${padding ?? 0}px`
    );

    // Attach event listeners directly to the DOM element
    hoverTriggerRef.current.addEventListener('mouseover', handleOnMouseEnter);
    hoverTriggerRef.current.addEventListener('mouseout', handleOnMouseLeave);

    return () => {
      // Clean up event listeners when the component unmounts
      hoverTriggerRef.current?.removeEventListener(
        'mouseover',
        handleOnMouseEnter
      );
      hoverTriggerRef.current?.removeEventListener(
        'mouseout',
        handleOnMouseLeave
      );
    };
  }, [padding]);

  return (
    <div className={styles['hover-trigger-container']}>
      <div
        className={styles['hover-trigger']}
        // onMouseEnter={handleOnMouseEnter}
        // onMouseLeave={handleOnMouseLeave}
        ref={hoverTriggerRef}
      ></div>
      <div className={styles['hover-trigger-children']}>{children}</div>
    </div>
  );
};

CursorTrigger.displayName = 'CursorTrigger';

export { CursorTrigger };
