import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";

export interface MultiSelectComboboxProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  onCreate?: (name: string) => void;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  "aria-label"?: string;
  className?: string;
}

export function MultiSelectCombobox({
  options,
  value,
  onChange,
  onCreate,
  placeholder = "Select items...",
  emptyText = "No items found.",
  disabled = false,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  className,
}: MultiSelectComboboxProps) {
  const [inputValue, setInputValue] = React.useState("");
  const anchor = useComboboxAnchor();

  const trimmedInput = inputValue.trim();

  // If user typed something not already in options, include it as a potential create option
  const items = React.useMemo(() => {
    if (
      onCreate &&
      trimmedInput &&
      !options.some((opt) => opt.toLowerCase() === trimmedInput.toLowerCase())
    ) {
      return [...options, trimmedInput];
    }
    return options;
  }, [options, onCreate, trimmedInput]);

  const handleValueChange = (newValues: string[]) => {
    // If a newly created value was selected, invoke onCreate
    if (onCreate) {
      for (const val of newValues) {
        if (!options.includes(val)) {
          onCreate(val);
        }
      }
    }
    onChange(newValues);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && trimmedInput && onCreate) {
      if (!value.includes(trimmedInput)) {
        e.preventDefault();
        onCreate(trimmedInput);
        onChange([...value, trimmedInput]);
        setInputValue("");
      }
    }
  };

  return (
    <Combobox
      multiple
      autoHighlight
      items={items}
      value={value}
      onValueChange={handleValueChange}
      inputValue={inputValue}
      onInputValueChange={(val) => setInputValue(val)}
      disabled={disabled}
    >
      <ComboboxChips
        ref={anchor}
        className={cn("w-full", className)}
        aria-invalid={ariaInvalid}
      >
        <ComboboxValue>
          {(values) => (
            <React.Fragment>
              {values.map((val: string) => (
                <ComboboxChip key={val}>{val}</ComboboxChip>
              ))}
              <ComboboxChipsInput
                placeholder={values.length > 0 ? "" : placeholder}
                aria-invalid={ariaInvalid}
                aria-label={ariaLabel}
                onKeyDown={handleKeyDown}
              />
            </React.Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList className="scrollbar-thumb-border">
          {(item) => {
            const isCreatedOption =
              onCreate &&
              trimmedInput &&
              item.toLowerCase() === trimmedInput.toLowerCase() &&
              !options.some((opt) => opt.toLowerCase() === item.toLowerCase());

            return (
              <ComboboxItem key={item} value={item}>
                {isCreatedOption ? (
                  <span className="flex items-center gap-1.5 text-primary font-medium">
                    <Plus className="size-3.5" />
                    Create &quot;{item}&quot;
                  </span>
                ) : (
                  item
                )}
              </ComboboxItem>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
