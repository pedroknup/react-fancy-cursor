declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module 'flubber' {
  const interpolate: any;
  export { interpolate };
}
