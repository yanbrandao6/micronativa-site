"use client";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export function SelectField({
  id,
  label,
  value,
  onValueChange,
  options,
  placeholder = "Selecione",
  helperText,
  error,
  success = false,
  disabled = false,
  name,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  helperText?: string;
  error?: string;
  success?: boolean;
  disabled?: boolean;
  name?: string;
  className?: string;
}) {
  const descriptionId = helperText || error ? `${id}-description` : undefined;
  return <div className={className}>
    <label htmlFor={id} className="mb-2 block font-bold">{label}</label>
    <Select.Root value={value || undefined} onValueChange={onValueChange} disabled={disabled} name={name}>
      <Select.Trigger
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={descriptionId}
        className={cn(
          "flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 text-left text-base shadow-sm transition duration-200",
          "border-navy/15 text-ink hover:border-forest/50 data-[placeholder]:text-muted/70",
          "focus:border-forest focus:ring-2 focus:ring-solar focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-muted disabled:opacity-75",
          error && "border-red-500 focus:border-red-600",
          success && !error && "border-forest/60",
        )}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon><ChevronDown className="size-5 text-forest transition group-data-[state=open]:rotate-180" aria-hidden="true" /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={8}
          collisionPadding={16}
          className="z-[100] max-h-[min(22rem,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-navy/10 bg-white p-1.5 shadow-[0_20px_60px_rgba(23,63,95,.18)]"
        >
          <Select.Viewport className="max-h-80 overflow-y-auto p-1">
            {options.map((option) => <Select.Item
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="relative flex min-h-11 cursor-default select-none items-center rounded-xl py-2.5 pl-4 pr-10 text-sm font-semibold text-ink outline-none transition data-[disabled]:opacity-40 data-[highlighted]:bg-forest-pale data-[highlighted]:text-forest-dark"
            >
              <Select.ItemText>{option.label}</Select.ItemText>
              <Select.ItemIndicator className="absolute right-3 text-forest"><Check className="size-4" aria-hidden="true" /></Select.ItemIndicator>
            </Select.Item>)}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
    {(error || helperText) && <p id={descriptionId} role={error ? "alert" : undefined} className={cn("mt-2 text-sm", error ? "font-semibold text-red-700" : "text-muted")}>{error ?? helperText}</p>}
  </div>;
}
