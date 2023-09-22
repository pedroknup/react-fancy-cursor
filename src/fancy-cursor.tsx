import React, {
  useCallback,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import * as d3 from 'd3';
import KUTE from 'kute.js';
import { Power0 } from 'gsap';
import { interpolate } from 'flubber'; //
import { CursorTypes } from './types';
import styles from './fancy-cursor.module.css';
import { DebugPanel } from './debug-panel';
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
const PARALLAX_STRENGTH = 5;
const CIRCLE_DIAMETER = 20;

const FancyCursor = forwardRef<CursorRef, FancyMouseProps>(function FancyCursor(
  { x, y, color, size = 10 },
  ref
) {
  const [cursorType, setCursorType] = useState<CursorTypes>('default');
  const isTransitioningRef = useRef<boolean>(true);
  const [text, setText] = useState<string>('');
  const cursorRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const cursorElement = cursorRef?.current;
  const focusedElementRef = useRef<any>(null);
  const cursorPathRef = useRef<any>(null);
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
    path.setAttribute('stroke', color ?? 'red'); // Change the color as needed
    path.setAttribute('fill', 'transparent');
    path.setAttribute('stroke-width', '4');

    return path;
  }

  const createPathAroundUnion = useCallback((): any => {
    const svgNS = 'http://www.w3.org/2000/svg';
    const rect = focusedElementRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const padding = 20;

    const currentX = x;
    const currentY = y;
    const buttonClientRect = rect;
    const halfWidth = buttonClientRect?.width / 2;
    const halfHeight = buttonClientRect?.height / 2;
    const middleX = buttonClientRect?.x + halfWidth;
    const middleY = buttonClientRect?.y + halfHeight;
    const xDistance = (middleX - currentX) / halfWidth;
    const yDistance = (middleY - currentY) / halfHeight;

    const relativeLeft = rect.left - xDistance * 5;
    const relativeTop = rect.top - yDistance * 5;

    const pathData = `
    M ${relativeLeft} ${relativeTop}
    L ${relativeLeft + buttonClientRect?.width} ${relativeTop}
    L ${relativeLeft + buttonClientRect?.width} ${relativeTop +
      buttonClientRect?.height}
    L ${relativeLeft} ${relativeTop + buttonClientRect?.height}
    Z`;

    if (!svgContainerRef.current) return;

    const pathElement = document.createElementNS(svgNS, 'path');
    pathElement.setAttribute('d', pathData);
    pathElement.setAttribute('stroke', 'transparent'); // Change the color as needed
    pathElement.setAttribute('fill', 'transparent');
    pathElement.setAttribute('stroke-width', '1');
    pathElement.id = 'delete-me';

    svgElement.current.appendChild(pathElement);

    const circlePath = cursorPathRef.current;

    if (!circlePath) return;

    const interpolator = interpolate(
      cursorPathRef.current.getAttribute('d'),
      pathData
    );

    isTransitioningRef.current = true;

    d3.select(cursorPathRef.current)
      .transition()
      .attrTween('d', function() {
        return interpolator;
      })
      .duration(100)
      .on('end', () => {
        isTransitioningRef.current = false;
      });
  }, [focusedElementRef.current, x, y]);

  useEffect(() => {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');

    if (!svgContainerRef.current) return;

    const padding = 20;

    svgContainerRef.current.style.left = `${padding}px`;
    svgContainerRef.current.style.top = `${padding}px`;
    svgContainerRef.current.style.width = `${padding}px`;
    svgContainerRef.current.style.height = `${padding}px`;

    svg.style.left = `${0}px`;
    svg.style.top = `${0}px`;
    svg.style.width = `100vw`;
    svg.style.height = `100vh`;
    svg.id = 'test';
    const pathCursorCircle = createCirclePath(20, undefined);
    svg.appendChild(pathCursorCircle);
    svgContainerRef.current?.children[0]?.remove();
    svgContainerRef.current?.appendChild(svg);

    cursorPathRef.current = pathCursorCircle;
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
        const focusedElementRect = focusedElementRef.current.getBoundingClientRect();
        const halfWidth = (focusedElementRect?.width ?? 0) / 2;
        const halfHeight = (focusedElementRect?.height ?? 0) / 2;
        const middleX = (focusedElementRect?.x ?? 0) + halfWidth;
        const middleY = (focusedElementRect?.y ?? 0) + halfHeight;
        const xDistance = (middleX - currentX) / halfWidth;
        const yDistance = (middleY - currentY) / halfHeight;

        const relativeLeft =
          focusedElementRect.left - xDistance * PARALLAX_STRENGTH;
        const relativeTop =
          focusedElementRect.top - yDistance * PARALLAX_STRENGTH;

        const pathData = `
          M ${relativeLeft} ${relativeTop}
          L ${relativeLeft + focusedElementRect?.width} ${relativeTop}
          L ${relativeLeft + focusedElementRect?.width} ${relativeTop +
          focusedElementRect?.height}
          L ${relativeLeft} ${relativeTop + focusedElementRect?.height}
          Z`;

        cursorPathRef.current?.setAttribute('d', pathData);
      }
    } else {
      if (!isTransitioningRef.current) isTransitioningRef.current = true;

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
      cursorPathRef.current?.style.setProperty('left', `${centeredLeft}px`);
      cursorPathRef.current?.style.setProperty('top', `${centeredTop}px`);
      // edit the first line of the path
      const path = createCirclePath(20, {
        x: x - 10,
        y: y - 0,
      });

      cursorPathRef.current.setAttribute('d', path.getAttribute('d'));
    }
  }, [x, y, cursorType, focusedElementRef.current, isTransitioningRef.current]);

  useEffect(() => {
    const cursorRefElement = cursorRef?.current;

    if (cursorType !== 'pointer') {
      animateTextOut();
    }

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

      const pathStart = svgContainerRef.current?.children[0]?.children[1];
      const pathEnd = svgContainerRef.current?.children[0]?.children[0];

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
      };

      const options = {
        duration: 200,
        ease: 'power3',
      };
      KUTE.to(cursorRefElement, targetData, options).start();
      animateTextIn();
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
      { duration: 300, ease: 'power3', delay: 50 }
    ).start();

    KUTE.to(
      cursorRefElement,
      {
        opacity: 1,
      },
      {
        duration: BASE_DURATION * 100,
        ease: 'power3',
      }
    ).start();
  }, [cursorElement]);

  const animateTextOut = useCallback(() => {
    const textRefElement = textRef?.current;
    const cursorRefElement = cursorRef?.current;
    const textContainerElement = textContainerRef?.current;

    console.log('trying to animate out');
    if (!textRefElement || !cursorRefElement || !textContainerElement) return;
    console.log('executed', textRefElement, cursorRefElement);
    KUTE.to(
      textRefElement,
      {
        opacity: 0,
        translateY: 200,
      },
      {
        duration: BASE_DURATION * 100,
        ease: 'power3',
      }
    ).start();

    KUTE.to(
      cursorRefElement,
      {
        opacity: 0,
      },
      {
        duration: 500,
        delay: 200,
        ease: 'power3',
      }
    );
  }, [cursorElement]);

  return (
    <div>
      <DebugPanel x={x} y={y} type={cursorType} text={text} />
      <div
        className={`${styles['svg-container']}`}
        ref={svgContainerRef}
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
