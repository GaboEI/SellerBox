"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col gap-3",
        month: "space-y-3",
        caption: "flex items-center justify-center gap-2 pt-1",
        caption_label: "hidden",
        caption_dropdowns: "rdp-caption_dropdowns flex items-center gap-2",
        caption_dropdown: "relative",
        dropdown:
          "rdp-dropdown h-8 rounded-[8px] border border-input bg-background px-2.5 py-1.5 text-sm font-medium text-foreground appearance-none shadow-sm focus:outline-none focus:ring-0 focus:ring-offset-0",
        dropdown_month: "pr-1",
        dropdown_year: "pr-1",
        dropdown_icon: "hidden",
        nav: "hidden",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head: "rdp-weekdays hidden",
        head_row: "rdp-weekdays_row hidden",
        head_cell: "rdp-weekday hidden",
        weekdays: "rdp-weekdays hidden",
        weekdays_row: "rdp-weekdays_row hidden",
        weekday: "rdp-weekday hidden",
        row: "flex w-full justify-center gap-1 mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-full [&:has([aria-selected].day-outside)]:bg-muted/50 [&:has([aria-selected])]:bg-primary/20 focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 rounded-full p-0 font-medium aria-selected:opacity-100 hover:bg-muted"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today:
          "rdp-day_today [&>button]:!bg-[#46d086] [&>button]:!text-foreground [&>button]:rounded-full",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
