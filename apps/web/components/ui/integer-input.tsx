"use client";

import { type InputHTMLAttributes, useCallback, useState } from "react";

import { Input } from "@/components/ui/input";

function sanitizeInteger(value: string) {
  return value.replace(/\D/g, "");
}

export function toIntegerString(value: string | number | undefined | null) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  return sanitizeInteger(String(Math.trunc(Number(value))));
}

export function formatIntegerDisplay(value: string) {
  const digits = sanitizeInteger(value);
  if (!digits) return "";

  return Number(digits).toLocaleString("id-ID");
}

export function IntegerInput({
  value,
  defaultValue,
  onValueChange,
  onChange,
  onFocus,
  name,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "inputMode" | "value" | "defaultValue"> & {
  value?: string;
  defaultValue?: string | number;
  onValueChange?: (value: string) => void;
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() =>
    isControlled ? "" : toIntegerString(defaultValue)
  );

  const rawValue = isControlled ? value : internalValue;
  const displayValue = formatIntegerDisplay(rawValue);

  const handleFocus = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      event.target.select();
      onFocus?.(event);
    },
    [onFocus]
  );

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const sanitized = sanitizeInteger(event.target.value);

    if (!isControlled) {
      setInternalValue(sanitized);
    }

    onValueChange?.(sanitized);
    onChange?.(event);
  }

  return (
    <>
      {name ? <input type="hidden" name={name} value={rawValue} /> : null}
      <Input
        {...props}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
      />
    </>
  );
}
