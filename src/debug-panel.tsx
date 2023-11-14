import React from 'react';
import styles from './debug-panel.module.css';

export const DebugPanel = ({
  x,
  y,
  type,
  text,
}: {
  x: number;
  y: number;
  type: string;
  text?: string;
}) => {
  return (
    <div className={styles["debug-panel"]}>
      {type}
      <br />
      {text}
      <br />
      {x} - {y}
    </div>
  );
};
