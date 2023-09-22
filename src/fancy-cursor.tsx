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

function replaceMNumbers(
  inputString: string,
  newX: number,
  newY: number
): string {
  // Define the regex pattern to match the M numbers
  const regex = /^M\s+([\d.]+)\s+([\d.]+)$/m;

  // Use the regex to find a match in the input string
  const firstLine = inputString.trim().split('\n')[0];
  const otherLines = inputString
    .trim()
    .split('\n')
    .slice(1)
    .join('\n');
  const match = firstLine.match(regex);

  if (match) {
    // Extract the original M numbers from the match
    const originalX: number = parseFloat(match[1]);
    const originalY: number = parseFloat(match[2]);

    // Replace the original M numbers with the new ones
    const replacedFirstLine = `M ${newX} ${newY}`;
    return `${replacedFirstLine}\n${otherLines}`;
  } else {
    // If no match is found, return the original input string
    return inputString;
  }
}

const FancyCursor = forwardRef<CursorRef, FancyMouseProps>(function FancyCursor(
  { x, y, color, size = 10 },
  ref
) {
  const [cursorType, setCursorType] = useState<CursorTypes>('default');
  const isTransitioningRef = useRef<boolean>(true);
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

  const createPathAroundUnion = useCallback((): any => {
    const svgNS = 'http://www.w3.org/2000/svg';
    // Define the path data using the bounding box of the element
    const rect = focusedElementRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const padding = 20;

    const elementWidth = rect.width + padding * 2;

    const elementHeight = rect.height + padding * 2;

    const relativeLeftCursor = x - rect.left;
    const relativeTopCursor = y - rect.top;

    const currentX = x;
    const currentY = y;
    const buttonClientRect = rect;
    const halfWidth = (buttonClientRect?.width ?? 0) / 2;
    const halfHeight = (buttonClientRect?.height ?? 0) / 2;
    const middleX = (buttonClientRect?.x ?? 0) + halfWidth;
    const middleY = (buttonClientRect?.y ?? 0) + halfHeight;
    const xDistance = (middleX - currentX) / halfWidth;
    const yDistance = (middleY - currentY) / halfHeight;

    const relativeLeft = rect.left - xDistance * 5;
    const relativeTop = rect.top - yDistance * 5;

    const pathData = `
    M ${relativeLeft} ${relativeTop}
    L ${relativeLeft + buttonClientRect?.width ?? 0} ${relativeTop}
    L ${relativeLeft + buttonClientRect?.width ?? 0} ${relativeTop +
      buttonClientRect?.height ?? 0}
    L ${relativeLeft} ${relativeTop + buttonClientRect?.height ?? 0}
    Z`;

    if (!canvasContainerRef.current) return;

    const pathElement = document.createElementNS(svgNS, 'path');
    pathElement.setAttribute('d', pathData);
    pathElement.setAttribute('stroke', 'transparent'); // Change the color as needed
    pathElement.setAttribute('fill', 'transparent');
    pathElement.setAttribute('stroke-width', '1');
    pathElement.id = 'delete-me';

    svgElement.current.appendChild(pathElement);

    const circlePath = mainPath.current;

    if (!circlePath) return;

    const interpolator = interpolate(
      mainPath.current.getAttribute('d'),
      pathData
    );

    isTransitioningRef.current = true;

    console.log('transition started. It should not move (line 230)');
    d3.select(mainPath.current)
      .transition()
      .attrTween('d', function() {
        return interpolator;
      })
      .duration(100)
      .on('end', () => {
        isTransitioningRef.current = false;
        console.log('transition ended');
      });
  }, [focusedElementRef.current, x, y]);

  useEffect(() => {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');

    if (!canvasContainerRef.current) return;

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

    console.log('isTransitioning', isTransitioningRef.current);

    if (cursorType === 'hover') {
      if (focusedElementRef.current && !isTransitioningRef.current) {
        const currentX = x;
        const currentY = y;
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

        const path = mainPath.current;
        if (!path) return;

        const relativeLeft = buttonClientRect.left - xDistance * 5;
        const relativeTop = buttonClientRect.top - yDistance * 5;

        const pathData = `
    M ${relativeLeft} ${relativeTop}
    L ${relativeLeft + buttonClientRect?.width ?? 0} ${relativeTop}
    L ${relativeLeft + buttonClientRect?.width ?? 0} ${relativeTop +
          buttonClientRect?.height ?? 0}
    L ${relativeLeft} ${relativeTop + buttonClientRect?.height ?? 0}
    Z`;
        path.setAttribute('d', pathData);
        console.log('CHANGED');
      }
    } else {
      if (!isTransitioningRef.current) 
        isTransitioningRef.current = true;
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
    }
  }, [x, y, cursorType, focusedElementRef.current, isTransitioningRef.current]);

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
        .duration(50)
        .ease(Power0.easeNone);

      svgElement.current.querySelector('#delete-me')?.remove();
    } else if (cursorType === 'hover') {
      createPathAroundUnion();
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
