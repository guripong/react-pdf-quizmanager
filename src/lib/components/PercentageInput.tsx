import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import type {ChangeEvent, KeyboardEvent} from 'react';

interface PercentageInputProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    style?: React.CSSProperties;
    className?: string;
  }
  
const PercentageInput: React.FC<PercentageInputProps> = ({
    value,
    onChange,
    onBlur,
    style,
    className,
  }) => {
    const [anyValue, setAnyValue] = useState<string>(value || '');
  
    useEffect(() => {
      setAnyValue(value);
    }, [value]);
  
    const prevValidValue = useMemo(() => {
      return value || '';
    }, [value]);
  
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      setAnyValue(event.target.value);
    };
  
    const validateAndSetPercentage = useCallback(() => {
      const parsedValue = parseInt(anyValue, 10);
      if (isNaN(parsedValue)) {
        onChange(prevValidValue);
        setAnyValue(prevValidValue);
      } else if (parsedValue < 25) {
        onChange('25%');
        setAnyValue('25%');
      } else if (parsedValue > 100) {
        onChange('100%');
        setAnyValue('100%');
      } else {
        onChange(parsedValue + '%');
        setAnyValue(parsedValue + '%');
      }
      if (onBlur) {
        onBlur();
      }
    }, [anyValue, onBlur, onChange, prevValidValue]);
  
    const inputRef = useRef<HTMLInputElement>(null);
  
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        inputRef.current?.blur(); // Blur the input
      }
    };
  
    return (
      <input
        ref={inputRef}
        type="text"
        value={anyValue}
        onChange={handleChange}
        onBlur={validateAndSetPercentage}
        onKeyDown={handleKeyDown}
        className={className}
        style={style}
      />
    );
  };
  
  export default React.memo(PercentageInput);