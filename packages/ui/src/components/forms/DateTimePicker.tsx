"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Calendar } from "../ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { Input } from "../forms/Input"

export function DateTimePicker({
  name,
  id,
  required,
  defaultValue,
}: {
  name: string
  id?: string
  required?: boolean
  defaultValue?: Date
}) {
  const [date, setDate] = React.useState<Date | undefined>(defaultValue)
  const [time, setTime] = React.useState<string>(
    defaultValue ? format(defaultValue, "HH:mm") : "12:00"
  )

  // Combine date and time into a single Date object for the hidden input
  const value = React.useMemo(() => {
    if (!date) return ""
    const [hours, minutes] = time.split(":").map(Number)
    const newDate = new Date(date)
    newDate.setHours(hours || 0)
    newDate.setMinutes(minutes || 0)
    return newDate.toISOString()
  }, [date, time])

  return (
    <div className="flex gap-2">
      <input type="hidden" name={name} id={id} value={value} required={required} />
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate as any}
          />
        </PopoverContent>
      </Popover>

      <Input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="w-[150px]"
        required={required}
      />
    </div>
  )
}
