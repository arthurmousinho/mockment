import { useEffect, useState } from "react";
import {
  ArrowCounterClockwiseIcon,
  CircleNotchIcon,
  ClockIcon,
  FastForwardIcon,
  TimerIcon,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AdvanceCurrentVirtualDateTimeRequest,
  ResetCurrentVirtualDateTimeRequest,
  SetCurrentVirtualDateTimeRequest,
} from "@/http/virtual-clock-http";
import { formatDateTime } from "@/lib/formatters";
import { useVirtualClockEvents } from "@/hooks/use-virtual-clock-events";

const DRIFT_THRESHOLD_MS = 60 * 1000;

const QUICK_ADVANCES = [
  { label: "+1 Hour", data: { hours: 1 } },
  { label: "+1 Day", data: { days: 1 } },
  { label: "+1 Week", data: { weeks: 1 } },
  { label: "+1 Month", data: { months: 1 } },
] as const;

const CUSTOM_ADVANCE_FIELDS = [
  ["minutes", "Minutes"],
  ["hours", "Hours"],
  ["days", "Days"],
  ["weeks", "Weeks"],
  ["months", "Months"],
  ["years", "Years"],
] as const;

type CustomAdvance = {
  minutes: string;
  hours: string;
  days: string;
  weeks: string;
  months: string;
  years: string;
};

const INITIAL_CUSTOM_ADVANCE: CustomAdvance = {
  minutes: "",
  hours: "",
  days: "",
  weeks: "",
  months: "",
  years: "",
};

function toDatetimeLocalValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  ].join("T");
}

export function VirtualClockButton() {
  const [open, setOpen] = useState(false);

  const [pendingDateTime, setPendingDateTime] = useState("");

  const [customAdvance, setCustomAdvance] = useState<CustomAdvance>(
    INITIAL_CUSTOM_ADVANCE,
  );

  const { virtualDateTime, liveVirtualDateTime } = useVirtualClockEvents();

  const { mutate: setVirtualDateTime, isPending: isSettingVirtualDateTime } =
    SetCurrentVirtualDateTimeRequest(
      pendingDateTime ? new Date(pendingDateTime).toISOString() : "",
    );

  const {
    mutate: advanceVirtualDateTime,
    isPending: isAdvancingVirtualDateTime,
  } = AdvanceCurrentVirtualDateTimeRequest();

  const {
    mutate: resetVirtualDateTime,
    isPending: isResettingVirtualDateTime,
  } = ResetCurrentVirtualDateTimeRequest();

  const isLoading = !virtualDateTime;

  const isTimeAltered =
    virtualDateTime !== null &&
    // eslint-disable-next-line react-hooks/purity
    Math.abs(virtualDateTime.getTime() - Date.now()) > DRIFT_THRESHOLD_MS;

  useEffect(() => {
    if (!open || !virtualDateTime) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPendingDateTime(toDatetimeLocalValue(virtualDateTime));
  }, [open, virtualDateTime]);

  function handleApplyDateTime() {
    if (!pendingDateTime) return;
    setVirtualDateTime();
  }

  function handleQuickAdvance(data: Record<string, number>) {
    advanceVirtualDateTime(data);
  }

  function handleCustomAdvance() {
    const payload = Object.fromEntries(
      Object.entries(customAdvance)
        .map(([key, value]) => [key, Number(value)])
        .filter(([, value]) => Number(value) > 0),
    );

    if (Object.keys(payload).length === 0) {
      return;
    }

    advanceVirtualDateTime(payload);
  }

  function handleCustomAdvanceChange(
    field: keyof CustomAdvance,
    value: string,
  ) {
    setCustomAdvance((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleReset() {
    resetVirtualDateTime();
  }

  const formattedDateTime = liveVirtualDateTime
    ? formatDateTime(liveVirtualDateTime.toISOString())
    : "—";

  return (
    <>
      {isTimeAltered && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-50 animate-pulse border-10 border-primary"
        />
      )}

      <div className="fixed bottom-4 right-4 z-50">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              size="lg"
              variant={isTimeAltered ? "default" : "outline"}
              className="shadow-lg"
            >
              <ClockIcon className="h-5 w-5" weight="bold" />

              <span className="text-sm font-medium">
                {isLoading ? "Loading..." : formattedDateTime}
              </span>
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" side="top" className="w-80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TimerIcon className="h-4 w-4 text-muted-foreground" />

                <h4 className="text-sm font-medium leading-none">
                  Virtual Clock
                </h4>
              </div>

              <Badge variant={isTimeAltered ? "default" : "secondary"}>
                {isTimeAltered ? "Modified" : "Real Time"}
              </Badge>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              {formattedDateTime}
            </p>

            <Separator className="my-4" />

            <Tabs defaultValue="advance">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="advance">Advance</TabsTrigger>

                <TabsTrigger value="set">Set Date & Time</TabsTrigger>
              </TabsList>

              <TabsContent value="advance" className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {QUICK_ADVANCES.map((option) => (
                    <Button
                      key={option.label}
                      size="sm"
                      variant="outline"
                      disabled={isAdvancingVirtualDateTime}
                      onClick={() => handleQuickAdvance(option.data)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {CUSTOM_ADVANCE_FIELDS.map(([field, label]) => (
                    <div key={field} className="space-y-1">
                      <Label htmlFor={`advance-${field}`} className="text-xs">
                        {label}
                      </Label>

                      <Input
                        id={`advance-${field}`}
                        type="number"
                        min={0}
                        inputMode="numeric"
                        value={customAdvance[field]}
                        onChange={(event) =>
                          handleCustomAdvanceChange(field, event.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  disabled={isAdvancingVirtualDateTime}
                  onClick={handleCustomAdvance}
                >
                  {isAdvancingVirtualDateTime ? (
                    <CircleNotchIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <FastForwardIcon className="h-4 w-4" />
                  )}
                  Advance Time
                </Button>
              </TabsContent>

              <TabsContent value="set" className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="virtual-datetime">Date & Time</Label>

                  <Input
                    id="virtual-datetime"
                    type="datetime-local"
                    value={pendingDateTime}
                    onChange={(event) => setPendingDateTime(event.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  disabled={!pendingDateTime || isSettingVirtualDateTime}
                  onClick={handleApplyDateTime}
                >
                  {isSettingVirtualDateTime && (
                    <CircleNotchIcon className="h-4 w-4 animate-spin" />
                  )}
                  Apply
                </Button>
              </TabsContent>
            </Tabs>

            <Button
              variant="outline"
              className="mt-4 w-full"
              disabled={isResettingVirtualDateTime}
              onClick={handleReset}
            >
              {isResettingVirtualDateTime ? (
                <CircleNotchIcon className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowCounterClockwiseIcon className="h-4 w-4" />
              )}
              Reset to Real Time
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
