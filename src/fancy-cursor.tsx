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
import * as THREE from 'three';
import gsap, { Power0 } from 'gsap';
import { interpolate } from 'flubber'; //
import * as d3 from 'd3';

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
  const [key, setKey] = useState<number>(0);
  const cursorRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const cursorElement = cursorRef?.current;
  const focusedElementRef = useRef<any>(null);
  const mainPath = useRef<any>(null);
  const svgElement = useRef<any>(null);

  function createCirclePath(
    diameter: number,
    position: { x: number; y: number } | undefined
  ): any {
    const svgNS = 'http://www.w3.org/2000/svg';
    const rect = focusedElementRef.current?.getBoundingClientRect() ?? {
      left: 0,
      top: 0,
    };

    const relativeLeft = x - rect.left + diameter / 2;
    const relativeTop = y - rect.top + diameter;

    const path = document.createElementNS(svgNS, 'path');

    const pathData = `
    M ${position?.x ?? relativeLeft} ${position?.y ?? relativeTop}
    a ${diameter / 2},${diameter / 2} 0 1,1 ${diameter},0
    a ${diameter / 2},${diameter / 2} 0 1,1 -${diameter},0
  `;
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', 'red'); // Change the color as needed
    path.setAttribute('fill', 'transparent');
    path.setAttribute('stroke-width', '4');

    // path.style.transform = `translate(${relativeLeft -
    //   diameter / 2}px, ${relativeTop - diameter / 2}px)`;

    return path;
  }

  const getRectangleAroundFocusedElement = useCallback(() => {
    // const rect = focusedElementRef.current?.getBoundingClientRect();
    // if (!rect) return null;
  }, []);

  function createPathAroundUnion(
    element1: HTMLElement,
    element2: HTMLElement
  ): any {
    const box1 = element1.getBoundingClientRect();
    const box2 = element2.getBoundingClientRect();

    const svgNS = 'http://www.w3.org/2000/svg';

    const boundingBox = element2.getBoundingClientRect();

    // Define the path data using the bounding box of the element
    const rect = focusedElementRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const padding = 20;

    const elementWidth = boundingBox.width + padding * 2;

    console.log('width', elementWidth);

    const elementHeight = boundingBox.height + padding * 2;

    const relativeLeftCursor = x - rect.left;
    const relativeTopCursor = y - rect.top;

    console.log('relativeLeftCursor', relativeLeftCursor);
    console.log('relativeTopCursor', relativeTopCursor);

    let relativeLeft = boundingBox.left;
    let relativeTop = boundingBox.top;
    
    const pathData = `
    M ${relativeLeft} ${relativeTop}
    L ${relativeLeft + boundingBox.width} ${relativeTop}
    L ${relativeLeft + boundingBox.width} ${relativeTop + boundingBox.height}
    L ${relativeLeft} ${relativeTop + boundingBox.height}
    Z
`;

    if (!canvasContainerRef.current) return;

    const pathElement = document.createElementNS(svgNS, 'path');
    pathElement.setAttribute('d', pathData);
    pathElement.setAttribute('stroke', 'transparent'); // Change the color as needed
    pathElement.setAttribute('fill', 'transparent');
    pathElement.setAttribute('stroke-width', '4');
    pathElement.id = 'delete-me';

    svgElement.current.appendChild(pathElement);

    const circlePath = mainPath.current;

    if (!circlePath) return;

    const interpolator = interpolate(
      mainPath.current.getAttribute('d'),
      pathData
    );
    console.log(mainPath.current.getAttribute('d'));
    console.log(pathData);

    d3.select(mainPath.current)
      .transition()
      .attrTween('d', function() {
        return interpolator;
      })
      .duration(200);
  }

  useEffect(() => {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    console.log('should add');

    if (!canvasContainerRef.current) return;
    console.log('should add 3');

    const padding = 20;

    canvasContainerRef.current.style.left = `${padding}px`;
    canvasContainerRef.current.style.top = `${padding}px`;
    canvasContainerRef.current.style.width = `${padding}px`;
    canvasContainerRef.current.style.height = `${padding}px`;

    svg.style.left = `${0}px`;
    svg.style.top = `${0}px`;
    svg.style.width = `100vw`;
    svg.style.height = `100vh`;
    svg.id = 'test';
    const pathCursorCircle = createCirclePath(20, undefined);
    console.log('pathCursorCircle', pathCursorCircle);
    svg.appendChild(pathCursorCircle);
    canvasContainerRef.current?.children[0]?.remove();
    canvasContainerRef.current?.appendChild(svg);

    mainPath.current = pathCursorCircle;
    svgElement.current = svg;
  }, []);

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

    const SVG = svgElement.current;
    if (!SVG) return;

    const SVGRect = SVG.getBoundingClientRect();
    const SVGWidth = SVGRect.width;
    const centeredLeft = x - SVGWidth / 2;
    const centeredTop = y - SVGWidth / 2;
    mainPath.current?.style.setProperty('left', `${centeredLeft}px`);
    mainPath.current?.style.setProperty('top', `${centeredTop}px`);
    // edit the first line of the path
    const path = createCirclePath(20, {
      x: x - 10,
      y: y - 0,
    });

    mainPath.current.setAttribute('d', path.getAttribute('d'));
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

      const pathStart = canvasContainerRef.current?.children[0]?.children[1];
      const pathEnd = canvasContainerRef.current?.children[0]?.children[0];
      console.log('here', mainPath.current);
      console.log('pathstart', pathStart);
      console.log('pathend', pathEnd);

      if (!pathStart || !pathEnd) return;

      const interpolator = interpolate(
        pathStart.getAttribute('d') ?? '',
        pathEnd.getAttribute('d') ?? ''
      );

      d3.select(pathEnd)
        .transition()
        .attrTween('d', function() {
          return interpolator;
        })
        .duration(200);

      svgElement.current.querySelector('#delete-me')?.remove();
      // svgElement.current.style.left = `${20}px`;
      // svgElement.current.style.top = `${20}px`;
      // svgElement.current.style.width = `${20 * 2}px`;
      // svgElement.current.style.height = `${20 * 2}px`;
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

      createPathAroundUnion(cursorRefElement, targetElement);
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
      <div
        className={`${styles['canvas-container']}`}
        key={key}
        ref={canvasContainerRef}
      />
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
