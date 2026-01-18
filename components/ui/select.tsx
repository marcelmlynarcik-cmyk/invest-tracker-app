"use client"

import * as React from "react"
import { cn } from "@/lib/utils" // Assuming cn utility is available

// --- Select Component ---
const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { onValueChange?: (value: string) => void }
>(({ className, children, value, onValueChange, ...props }, ref) => {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      onValueChange?.(event.target.value);
    },
    [onValueChange]
  );

  return (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      value={value}
      onChange={handleChange}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";

// --- SelectTrigger Component ---
// This will just render a div that visually looks like a trigger,
// and its children will actually be the hidden native select options.
// For now, it will simply render its children, which are expected to be SelectValue + SelectIcon (if any).
const SelectTrigger = React.forwardRef<
  HTMLButtonElement, // Changed to button as this is what it usually would be
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  // In a real headless UI, this would render a button that toggles the SelectContent.
  // For this basic implementation, it's just a visual wrapper.
  // The actual select logic is handled by the native <select> in the Select component.
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    {/* Optional: Add a chevron icon here for visual cue */}
    <span className="ml-auto h-4 w-4 opacity-50">▼</span>
  </button>
));
SelectTrigger.displayName = "SelectTrigger";

// --- SelectValue Component ---
// This will display the currently selected value.
// It assumes its parent Select component will manage the actual <select> value.
// For this basic implementation, it will simply render the children.
const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(({ className, children, placeholder, ...props }, ref) => (
  <span ref={ref} className={cn("block truncate", className)} {...props}>
    {children || placeholder}
  </span>
));
SelectValue.displayName = "SelectValue";

// --- SelectContent Component ---
// In a real headless UI, this would be a popover for the options.
// For this basic implementation, it's just a pass-through to render children.
const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
SelectContent.displayName = "SelectContent";

// --- SelectItem Component ---
// This corresponds to an <option> tag.
const SelectItem = React.forwardRef<
  HTMLLIElement, // Changed to li as it would be in a custom dropdown
  React.LiHTMLAttributes<HTMLLIElement> & { value: string; disabled?: boolean }
>(({ className, children, value, disabled, ...props }, ref) => (
  // In a native <select>, this would be an <option>.
  // For this simple implementation, the parent Select component (which is a native <select>)
  // will render <option> elements directly.
  // This SelectItem is just a wrapper for the content of the <option>.
  // The actual <option> rendering will be managed by the Select component's children.
  <option
    ref={ref as React.Ref<HTMLOptionElement>} // Cast ref to HTMLOptionElement
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    value={value}
    disabled={disabled}
    {...props}
  >
    {children}
  </option>
));
SelectItem.displayName = "SelectItem";

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
};
