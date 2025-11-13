import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/common/util/format-currency";
import { FormErrors } from "@/common/interfaces/form-response.interface";

export function AmountInput({
  defaultValue,
  label,
  onChangeFormatted,
  name,
  error,
  min,
  max,
  ...props
}: React.ComponentProps<"input"> & {
  label?: string;
  onChangeFormatted?: (value: number) => void;
  icon?: React.ReactNode;
  error?: FormErrors;
  min?: number; // em centavos
  max?: number; // em centavos
}) {
  const [value, setValue] = useState(defaultValue ? String(defaultValue) : "");
  const [formatted, setFormatted] = useState(false);

  const parseNumeric = (input: string): number => {
    const cleaned = input
      .replace(/[^\d,.-]/g, "")
      .replace(/\.(?=\d{3}(,|$))/g, "")
      .replace(",", ".");

    return parseFloat(cleaned) || 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numeric = parseNumeric(inputValue);

    if (min !== undefined && numeric * 100 < min) {
      const minReais = min / 100;
      setValue(String(minReais));
      return;
    }
    if (max !== undefined && numeric * 100 > max) {
      const maxReais = max / 100;
      setValue(String(maxReais));
      return;
    }

    setFormatted(false);
    setValue(inputValue);
  };

  const handleBlur = () => {
    const number = parseNumeric(value);
    if (!isNaN(number)) {
      setValue(formatCurrency(number * 100));
      setFormatted(true);
      onChangeFormatted?.(number);
    }
  };

  const handleFocus = () => {
    if (formatted) {
      const number = parseNumeric(value);
      setValue(number ? String(number) : "");
      setFormatted(false);
    }
  };

  const amountInCents = useMemo(() => {
    const numeric = parseNumeric(value);
    return Math.round(numeric * 100);
  }, [value]);

  return (
    <>
      <Input
        customName={name}
        label={label}
        type="text"
        value={value}
        error={error}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        {...props}
      />
      <input id={props.id} type="hidden" name={name} value={amountInCents} />
    </>
  );
}
