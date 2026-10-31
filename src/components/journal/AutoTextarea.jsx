import React, { forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useRef } from 'react';

const AutoTextarea = forwardRef(function AutoTextarea(
  { value, onChange, className = '', ...props },
  forwardedRef,
) {
  const innerRef = useRef(null);

  useImperativeHandle(forwardedRef, () => innerRef.current);

  const resize = useCallback(() => {
    const element = innerRef.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }, []);

  useLayoutEffect(() => {
    resize();
  }, [resize, value]);

  return (
    <textarea
      ref={innerRef}
      rows={1}
      value={value}
      onChange={(event) => {
        onChange?.(event);
        resize();
      }}
      className={`resize-none overflow-hidden ${className}`}
      {...props}
    />
  );
});

export default AutoTextarea;
