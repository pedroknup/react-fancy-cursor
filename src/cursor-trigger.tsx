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
  const childrenRef = useRef<HTMLDivElement>(null);

  const handleOnMouseEnter = () => {
    switch (type) {
      case 'hover':
        changeMouseType('hover', hoverTriggerRef.current ?? undefined);
        break;
      case 'pointer':
        changeMouseType('pointer', text);
        break;
      case 'text':
        changeMouseType('text');
        break;
      default:
        break;
    }
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
    childrenRef.current?.addEventListener('mouseover', handleOnMouseEnter);
    hoverTriggerRef.current.addEventListener('mouseout', handleOnMouseLeave);
    childrenRef.current?.addEventListener('mouseout', handleOnMouseLeave);

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
      childrenRef.current?.removeEventListener(
        'mouseover',
        handleOnMouseEnter
      );
      childrenRef.current?.removeEventListener(
        'mouseout',
        handleOnMouseLeave
      );
    };
  }, [padding]);

  return (
    <span className={styles['hover-trigger-container']}>
      <span
        className={styles['hover-trigger']}
        ref={hoverTriggerRef}
      ></span>
      <span className={styles['hover-trigger-children']} ref={childrenRef}>{children}</span>
    </span>
  );
};

CursorTrigger.displayName = 'CursorTrigger';

export { CursorTrigger };
