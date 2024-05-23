import React, { useState, useEffect, useMemo, useCallback  } from 'react';
import type {ChangeEvent, KeyboardEvent} from "react";

interface NumberOnlyInputProps {
  style?: React.CSSProperties;
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  onBlur?: () => void;
}

const NumberOnlyInput: React.FC<NumberOnlyInputProps> = ({ style, value, onChange, max, min, onBlur }) => {
  const [anyValue, setAnyValue] = useState<string | number>(value);

  useEffect(() => {
    setAnyValue(value);
  }, [value]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setAnyValue(newValue);
  };

  const prevValidValue = useMemo(() => {
    return value || '';
  }, [value]);

  const validateAndSetPercentage = useCallback(() => {
    const parsedValue = parseInt(anyValue as string, 10);

    if (isNaN(parsedValue) || parsedValue < 0) {
      onChange(prevValidValue as number);
      setAnyValue(prevValidValue);
    }  else if ((max === undefined || max === null) && (parsedValue > 100)) {
      onChange(100);
      setAnyValue(100);
    } else if (min !== undefined && parsedValue < min) {
      onChange(min);
      setAnyValue(min);
    } else if (max !== undefined && parsedValue > max) {
      onChange(max);
      setAnyValue(max);
    } else {
      onChange(parsedValue);
      setAnyValue(parsedValue);
    }

    if (onBlur) {
      onBlur();
    }
  }, [anyValue, onBlur, onChange, prevValidValue, min, max]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      validateAndSetPercentage();
    }
  };

  return (
    <input
      type="text"
      value={anyValue}
      onChange={handleInputChange}
      onBlur={validateAndSetPercentage}
      onKeyDown={handleKeyDown}
      style={style}
    />
  );
};

export default NumberOnlyInput;

