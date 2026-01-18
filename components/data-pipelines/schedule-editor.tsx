"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, AlertCircle } from "lucide-react";
import type { ScheduleType } from "@/lib/api/types/data-pipelines";

interface ScheduleEditorProps {
  scheduleType: ScheduleType;
  scheduleValue: string;
  scheduleTimezone: string;
  onChange: (config: {
    scheduleType: ScheduleType;
    scheduleValue: string;
    scheduleTimezone: string;
  }) => void;
  disabled?: boolean;
}

// Common timezones
const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (US)" },
  { value: "America/Chicago", label: "Central Time (US)" },
  { value: "America/Denver", label: "Mountain Time (US)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US)" },
  { value: "Europe/London", label: "London (UK)" },
  { value: "Europe/Paris", label: "Paris (EU)" },
  { value: "Europe/Berlin", label: "Berlin (EU)" },
  { value: "Asia/Kolkata", label: "India Standard Time" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Tokyo", label: "Japan Standard Time" },
  { value: "Australia/Sydney", label: "Sydney (AU)" },
];

// Day options for weekly schedule
const DAYS_OF_WEEK = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

export function ScheduleEditor({
  scheduleType,
  scheduleValue,
  scheduleTimezone,
  onChange,
  disabled = false,
}: ScheduleEditorProps) {
  // Local state for parsed values
  const [localType, setLocalType] = useState<ScheduleType>(scheduleType);
  const [minutesInterval, setMinutesInterval] = useState("15");
  const [hourlyInterval, setHourlyInterval] = useState("1");
  const [dailyTime, setDailyTime] = useState("09:00");
  const [weeklyDay, setWeeklyDay] = useState("1");
  const [weeklyTime, setWeeklyTime] = useState("09:00");
  const [monthlyDay, setMonthlyDay] = useState("1");
  const [monthlyTime, setMonthlyTime] = useState("09:00");
  const [customCron, setCustomCron] = useState("0 0 * * *");
  const [timezone, setTimezone] = useState(scheduleTimezone || "UTC");

  // Parse initial schedule value
  useEffect(() => {
    if (!scheduleValue) return;

    switch (scheduleType) {
      case "minutes":
        setMinutesInterval(scheduleValue);
        break;
      case "hourly":
        setHourlyInterval(scheduleValue);
        break;
      case "daily":
        setDailyTime(scheduleValue);
        break;
      case "weekly": {
        const [day, ...timeParts] = scheduleValue.split(":");
        setWeeklyDay(day || "1");
        setWeeklyTime(timeParts.join(":") || "09:00");
        break;
      }
      case "monthly": {
        const [dayOfMonth, ...monthTimeParts] = scheduleValue.split(":");
        setMonthlyDay(dayOfMonth || "1");
        setMonthlyTime(monthTimeParts.join(":") || "09:00");
        break;
      }
      case "custom_cron":
        setCustomCron(scheduleValue);
        break;
    }
  }, [scheduleType, scheduleValue]);

  // Update parent when values change
  const emitChange = (type: ScheduleType, value: string, tz: string) => {
    onChange({
      scheduleType: type,
      scheduleValue: value,
      scheduleTimezone: tz,
    });
  };

  // Handle schedule type change
  const handleTypeChange = (newType: ScheduleType) => {
    setLocalType(newType);
    let value = "";
    switch (newType) {
      case "none":
        value = "";
        break;
      case "minutes":
        value = minutesInterval;
        break;
      case "hourly":
        value = hourlyInterval;
        break;
      case "daily":
        value = dailyTime;
        break;
      case "weekly":
        value = `${weeklyDay}:${weeklyTime}`;
        break;
      case "monthly":
        value = `${monthlyDay}:${monthlyTime}`;
        break;
      case "custom_cron":
        value = customCron;
        break;
    }
    emitChange(newType, value, timezone);
  };

  // Get human-readable description
  const getScheduleDescription = (): string => {
    switch (localType) {
      case "none":
        return "Manual runs only - no automatic scheduling";
      case "minutes":
        return `Runs every ${minutesInterval} minute${parseInt(minutesInterval) !== 1 ? "s" : ""}`;
      case "hourly":
        return `Runs every ${hourlyInterval} hour${parseInt(hourlyInterval) !== 1 ? "s" : ""}`;
      case "daily":
        return `Runs daily at ${dailyTime} (${timezone})`;
      case "weekly": {
        const dayName = DAYS_OF_WEEK.find((d) => d.value === weeklyDay)?.label || "Monday";
        return `Runs every ${dayName} at ${weeklyTime} (${timezone})`;
      }
      case "monthly":
        return `Runs on day ${monthlyDay} of each month at ${monthlyTime} (${timezone})`;
      case "custom_cron":
        return `Custom cron: ${customCron}`;
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Schedule Type Selector */}
      <div className="space-y-2">
        <Label>Schedule Type</Label>
        <Select
          value={localType}
          onValueChange={(value) => handleTypeChange(value as ScheduleType)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select schedule type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Manual (No Schedule)
              </div>
            </SelectItem>
            <SelectItem value="minutes">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Every X Minutes
              </div>
            </SelectItem>
            <SelectItem value="hourly">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                Every X Hours
              </div>
            </SelectItem>
            <SelectItem value="daily">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                Daily at Specific Time
              </div>
            </SelectItem>
            <SelectItem value="weekly">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-500" />
                Weekly on Specific Day
              </div>
            </SelectItem>
            <SelectItem value="monthly">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-red-500" />
                Monthly on Specific Day
              </div>
            </SelectItem>
            <SelectItem value="custom_cron">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Custom Cron Expression
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Schedule-specific options */}
      {localType === "minutes" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Run every (minutes)</Label>
            <Select
              value={minutesInterval}
              onValueChange={(value) => {
                setMinutesInterval(value);
                emitChange("minutes", value, timezone);
              }}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Every 5 minutes</SelectItem>
                <SelectItem value="10">Every 10 minutes</SelectItem>
                <SelectItem value="15">Every 15 minutes</SelectItem>
                <SelectItem value="30">Every 30 minutes</SelectItem>
                <SelectItem value="45">Every 45 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select
              value={timezone}
              onValueChange={(value) => {
                setTimezone(value);
                emitChange("minutes", minutesInterval, value);
              }}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {localType === "hourly" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Run every (hours)</Label>
            <Select
              value={hourlyInterval}
              onValueChange={(value) => {
                setHourlyInterval(value);
                emitChange("hourly", value, timezone);
              }}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Every hour</SelectItem>
                <SelectItem value="2">Every 2 hours</SelectItem>
                <SelectItem value="3">Every 3 hours</SelectItem>
                <SelectItem value="4">Every 4 hours</SelectItem>
                <SelectItem value="6">Every 6 hours</SelectItem>
                <SelectItem value="8">Every 8 hours</SelectItem>
                <SelectItem value="12">Every 12 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select
              value={timezone}
              onValueChange={(value) => {
                setTimezone(value);
                emitChange("hourly", hourlyInterval, value);
              }}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {localType === "daily" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Time</Label>
            <Input
              type="time"
              value={dailyTime}
              onChange={(e) => {
                setDailyTime(e.target.value);
                emitChange("daily", e.target.value, timezone);
              }}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select
              value={timezone}
              onValueChange={(value) => {
                setTimezone(value);
                emitChange("daily", dailyTime, value);
              }}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {localType === "weekly" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <Select
                value={weeklyDay}
                onValueChange={(value) => {
                  setWeeklyDay(value);
                  emitChange("weekly", `${value}:${weeklyTime}`, timezone);
                }}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={weeklyTime}
                onChange={(e) => {
                  setWeeklyTime(e.target.value);
                  emitChange("weekly", `${weeklyDay}:${e.target.value}`, timezone);
                }}
                disabled={disabled}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select
              value={timezone}
              onValueChange={(value) => {
                setTimezone(value);
                emitChange("weekly", `${weeklyDay}:${weeklyTime}`, value);
              }}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {localType === "monthly" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Day of Month</Label>
              <Select
                value={monthlyDay}
                onValueChange={(value) => {
                  setMonthlyDay(value);
                  emitChange("monthly", `${value}:${monthlyTime}`, timezone);
                }}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={monthlyTime}
                onChange={(e) => {
                  setMonthlyTime(e.target.value);
                  emitChange("monthly", `${monthlyDay}:${e.target.value}`, timezone);
                }}
                disabled={disabled}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select
              value={timezone}
              onValueChange={(value) => {
                setTimezone(value);
                emitChange("monthly", `${monthlyDay}:${monthlyTime}`, value);
              }}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {localType === "custom_cron" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Cron Expression</Label>
            <Input
              value={customCron}
              onChange={(e) => {
                setCustomCron(e.target.value);
                emitChange("custom_cron", e.target.value, timezone);
              }}
              placeholder="0 0 * * *"
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              Format: minute hour day-of-month month day-of-week (e.g., &quot;0 9 * *
              1-5&quot; = 9 AM on weekdays)
            </p>
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select
              value={timezone}
              onValueChange={(value) => {
                setTimezone(value);
                emitChange("custom_cron", customCron, value);
              }}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Schedule Description */}
      {localType !== "none" && (
        <div className="pt-2">
          <Badge variant="outline" className="text-sm font-normal">
            <Clock className="h-3 w-3 mr-1" />
            {getScheduleDescription()}
          </Badge>
        </div>
      )}
    </div>
  );
}
