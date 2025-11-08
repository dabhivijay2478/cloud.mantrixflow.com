"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * DateRangePicker
 * @description Date range selection component for filtering data by date ranges.
 * Provides calendar-based date range selection with preset options.
 * @param {DateRangePickerProps} props - Component properties
 * @param {DateRange} [props.value] - Selected date range
 * @param {(range: DateRange | undefined) => void} [props.onChange] - Callback when date range changes
 * @param {string} [props.placeholder] - Placeholder text when no date selected
 * @param {boolean} [props.disabled] - Disable the picker
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} DateRangePicker component
 * @example
 * const [dateRange, setDateRange] = useState<DateRange | undefined>({
 *   from: new Date(2024, 0, 1),
 *   to: new Date(2024, 0, 31),
 * });
 * 
 * <DateRangePicker
 *   value={dateRange}
 *   onChange={setDateRange}
 *   placeholder="Pick a date range"
 * />
 */

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a date range",
  disabled = false,
  className,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value);

  React.useEffect(() => {
    setDate(value);
  }, [value]);

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    onChange?.(range);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * Preset date ranges for quick selection
 */
export const dateRangePresets = {
  today: {
    from: new Date(),
    to: new Date(),
  },
  yesterday: {
    from: addDays(new Date(), -1),
    to: addDays(new Date(), -1),
  },
  last7Days: {
    from: addDays(new Date(), -7),
    to: new Date(),
  },
  last30Days: {
    from: addDays(new Date(), -30),
    to: new Date(),
  },
  thisMonth: {
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  },
  lastMonth: {
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
  },
};
