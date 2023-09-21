import styles from './fancy-cursor.module.css';
import {
  useCallback,
  // useContext,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import KUTE from 'kute.js';
import React from 'react';
type CursorTypes = 'default' | 'pointer' | 'text' | 'hover' | 'drag' | 'none';

type FancyMouseProps = {
  x: number;
  y: number;
  color?: string;
  size?: number;
};
export type CursorRef = {
  setCursorType: (cursorType: CursorTypes) => void;
  setHoverElement: (element: HTMLElement) => void;
  setText: (text: string) => void;
};

const BASE_DURATION = 0.3;

const FancyCursor = forwardRef<CursorRef, FancyMouseProps>(function FancyCursor(
  { x, y, color, size = 10 },
  ref
) {
  const [cursorType, setCursorType] = useState<CursorTypes>('default');
  const [text, setText] = useState<string>('');
  const cursorRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const cursorElement = cursorRef?.current;
  const focusedElementRef = useRef<any>(null);

  useEffect(() => {
    const cursorRefElement = cursorRef?.current;
    if (!cursorRefElement) return;

    cursorRefElement.style.setProperty('--cursor-size', `${size}px`);
  }, [size]);

  useEffect(() => {
    const cursorRefElement = cursorRef?.current;
    if (!cursorRefElement) return;

    cursorRefElement.style.setProperty('--cursor-color', color ?? 'red');
  }, [color]);

  useEffect(() => {
    const cursorRefElement = cursorRef?.current;
    if (!cursorRefElement) return;

    if (cursorType === 'hover') return;

    KUTE.to(
      cursorRefElement,
      { left: x, top: y },
      { duration: 0.1, delay: 0.1, ease: 'power4' }
    ).start();

  }, [x, y]);

  const handleOnMouseMove = useCallback((e: MouseEvent) => {
    if (focusedElementRef.current) {
      const currentX = e.clientX;
      const currentY = e.clientY;
      const buttonClientRect = focusedElementRef.current.getBoundingClientRect();
      const halfWidth = (buttonClientRect?.width ?? 0) / 2;
      const halfHeight = (buttonClientRect?.height ?? 0) / 2;
      const middleX = (buttonClientRect?.x ?? 0) + halfWidth;
      const middleY = (buttonClientRect?.y ?? 0) + halfHeight;
      const xDistance = (middleX - currentX) / halfWidth;
      const yDistance = (middleY - currentY) / halfHeight;

      cursorRef.current?.style.setProperty(
        'left',
        `${buttonClientRect.left + halfWidth - xDistance * 5}px`
      );
      cursorRef.current?.style.setProperty(
        'top',
        `${buttonClientRect.top + halfHeight - yDistance * 5}px`
      );
    }
  }, []);

  useEffect(() => {
    const cursorRefElement = cursorRef?.current;
    if (!cursorRefElement) return;

    if (cursorType === 'default') {
      const targetData = {
        width: size,
        height: size,
      };

      const options = {
        duration: 200,
      };
      const tween = KUTE.to(cursorRefElement, targetData, options);
      tween.start();
    } else if (cursorType === 'hover') {
      const targetElement = focusedElementRef.current;
      if (!targetElement) return;

      const rect = targetElement.getBoundingClientRect();
      const top = rect.top + window.screenY;
      const bottom = rect.bottom + window.scrollY;
      const left = rect.left + window.scrollX;
      const right = rect.right + window.scrollX;
      const width = rect.width;
      const height = rect.height;

      const targetData = {
        width,
        height,
      };

      const options = {
        duration: 100,
        ease: 'power3',
      };
      KUTE.to(cursorRefElement, targetData, options).start();
    } else if (cursorType === 'text') {
      const targetData = {
        width: 2,
        height: 20,
      };

      const options = {
        duration: 100,
        ease: 'power3',
      };
      KUTE.to(cursorRefElement, targetData, options).start();
    } else if (cursorType === 'pointer') {
      const targetData = {
        width: 100,
        height: 100,
        left: x - 50,
        top: y - 50,
      };

      const options = {
        duration: 100,
        ease: 'power3',
      };
      const tween = KUTE.to(cursorRefElement, targetData, options).start();
      animateTextIn();
    }
    if (cursorType !== 'pointer') {
      animateTextOut();
    }
  }, [cursorType]);

  useEffect(() => {
    window.addEventListener('mousemove', handleOnMouseMove);
    if (!cursorElement) return;

    return () => {
      window.removeEventListener('mousemove', handleOnMouseMove);
    };
  }, [cursorElement, handleOnMouseMove]);

  useImperativeHandle(ref, () => ({
    setCursorType: (cursorType: CursorTypes) => {
      setCursorType(cursorType);
    },
    setHoverElement: (element: HTMLElement) => {
      focusedElementRef.current = element;
    },
    setText: (text: string) => {
      setText(text);
    },
  }));

  const animateTextIn = useCallback(() => {
    const textRefElement = textRef?.current;
    const cursorRefElement = cursorRef?.current;
    const textContainerElement = textContainerRef?.current;

    if (!textRefElement || !cursorRefElement || !textContainerElement) return;
    KUTE.to(
      textRefElement,
      { translateY: 0, opacity: 1 },
      { duration: BASE_DURATION, ease: 'power3', delay: 0.2 }
    ).start();

    KUTE.to(
      cursorRefElement,
      {
        borderWidth: 0,
      },
      {
        duration: BASE_DURATION,
        ease: 'power3',
      }
    ).start();
  }, [cursorElement]);

  const animateTextOut = useCallback(() => {
    const textRefElement = textRef?.current;
    const cursorRefElement = cursorRef?.current;
    const textContainerElement = textContainerRef?.current;

    if (!textRefElement || !cursorRefElement || !textContainerElement) return;

    KUTE.to(
      textRefElement,
      {
        opacity: 0,
        translateY: '100%',
      },
      {
        duration: BASE_DURATION,
        ease: 'power3',
      }
    ).start();

    KUTE.to(
      cursorRefElement,
      {
        borderWidth: 4,
      },
      {
        duration: BASE_DURATION,
        delay: 0.2,
        ease: 'power3',
      }
    );
  }, [cursorElement]);

  return (
    <div className={styles.debug}>
      {cursorType}
      <br />
      {text}
      <br />
      {x} - {y}
      <div className={`${styles.cursor} ${styles[cursorType]}`}>
        <div className={styles.cursorText}>
          <span></span>
        </div>
      </div>
      <div className={`${styles.cursor} ${styles[cursorType]}`} ref={cursorRef}>
        <div ref={textContainerRef} className={styles['cursor-text']}>
          <span ref={textRef}>{text}</span>
        </div>
      </div>
    </div>
  );
});

FancyCursor.displayName = 'FancyCursor';

export { FancyCursor };
