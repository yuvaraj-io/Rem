import { useState, useCallback } from 'react';
import DOMPurify from 'dompurify';

function sanitize(val) {
  if (typeof val !== 'string') return '';
  if (typeof window !== 'undefined' && DOMPurify && typeof DOMPurify.sanitize === 'function') {
    return DOMPurify.sanitize(val);
  }
  return val.replace(/<[^>]*>?/gm, '');
}

export function useSanitizedInput(initialValue = '', options = {}) {
  const {
    minLength = 1,
    maxLength = 250,
    required = true,
    fieldName = 'Field'
  } = options;

  const [value, setValue] = useState(initialValue);
  const [sanitizedValue, setSanitizedValue] = useState(() => sanitize(initialValue));
  const [error, setError] = useState('');
  const [isTouched, setIsTouched] = useState(false);

  // Pure validation evaluator
  const validate = useCallback((val) => {
    const clean = sanitize(val.trim());
    if (required && clean.length === 0) {
      return `${fieldName} cannot be empty.`;
    }
    if (clean.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters.`;
    }
    if (clean.length > maxLength) {
      return `${fieldName} cannot exceed ${maxLength} characters.`;
    }
    return '';
  }, [minLength, maxLength, required, fieldName]);

  // Reactive Change Handler (on every character entry)
  const handleChange = useCallback((e) => {
    const raw = typeof e === 'string' ? e : e.target.value;
    const clean = sanitize(raw);

    setValue(raw);
    setSanitizedValue(clean);

    if (isTouched) {
      setError(validate(raw));
    }
  }, [isTouched, validate]);

  // Focus Handler
  const handleFocus = useCallback(() => {
    setIsTouched(true);
  }, []);

  // Blur Handler
  const handleBlur = useCallback(() => {
    setIsTouched(true);
    setError(validate(value));
  }, [value, validate]);

  // Explicit validation check before submit
  const validateOnSubmit = useCallback(() => {
    setIsTouched(true);
    const err = validate(value);
    setError(err);
    return !err;
  }, [value, validate]);

  // Reset helper
  const reset = useCallback((newVal = '') => {
    setValue(newVal);
    setSanitizedValue(sanitize(newVal));
    setError('');
    setIsTouched(false);
  }, []);

  return {
    value,
    sanitizedValue,
    error,
    isTouched,
    isValid: !error && (!required || sanitizedValue.trim().length >= minLength),
    onChange: handleChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    setValue: handleChange,
    validateOnSubmit,
    reset
  };
}
