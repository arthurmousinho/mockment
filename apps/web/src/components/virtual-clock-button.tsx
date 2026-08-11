import { useEffect, useMemo, useRef, useState } from "react";
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
  GetCurrentVirtualDateTimeRequest,
  ResetCurrentVirtualDateTimeRequest,
  SetCurrentVirtualDateTimeRequest,
} from "@/http/virtual-clock-http";
import { formatDateTime } from "@/lib/formatters";

const DRIFT_THRESHOLD_MS = 60 * 1000;
const TICK_INTERVAL_MS = 1000;

const QUICK_ADVANCES: { label: string; data: Record<string, number> }[] = [
  { label: "+1 Hour", data: { hours: 1 } },
  { label: "+1 Day", data: { days: 1 } },
  { label: "+1 Week", data: { weeks: 1 } },
  { label: "+1 Month", data: { months: 1 } },
];

function toDatetimeLocalValue(iso: string) {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function VirtualClockButton() {
  const [open, setOpen] = useState(false);
  const [pendingDateTime, setPendingDateTime] = useState("");

  const [customAdvance, setCustomAdvance] = useState({
    minutes: "",
    hours: "",
    days: "",
    weeks: "",
    months: "",
    years: "",
  });

  const { data: virtualClock, isPending: isLoadingVirtualClock } =
    GetCurrentVirtualDateTimeRequest();

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

  const offsetRef = useRef(0);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!virtualClock?.currentDateTime) return;

    offsetRef.current =
      new Date(virtualClock.currentDateTime).getTime() - Date.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
  }, [virtualClock?.currentDateTime]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const liveVirtualDateTime = useMemo(
    // eslint-disable-next-line react-hooks/refs
    () => new Date(now.getTime() + offsetRef.current),
    [now],
  );

  useEffect(() => {
    if (open && virtualClock?.currentDateTime) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPendingDateTime(toDatetimeLocalValue(virtualClock.currentDateTime));
    }
  }, [open, virtualClock?.currentDateTime]);

  // eslint-disable-next-line react-hooks/refs
  const isTimeAltered = offsetRef.current > DRIFT_THRESHOLD_MS;

  function handleApplyDateTime() {
    if (!pendingDateTime) return;

    setVirtualDateTime();
  }

  function handleQuickAdvance(advanceData: Record<string, number>) {
    advanceVirtualDateTime(advanceData);
  }

  function handleCustomAdvance() {
    const payload = Object.fromEntries(
      Object.entries(customAdvance)
        .map(([key, value]) => [key, Number(value)])
        .filter(([, value]) => Number(value) > 0),
    );

    if (Object.keys(payload).length === 0) return;

    advanceVirtualDateTime(payload);
  }

  function handleReset() {
    resetVirtualDateTime();
  }

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
                {isLoadingVirtualClock
                  ? "Loading..."
                  : virtualClock?.currentDateTime
                    ? formatDateTime(liveVirtualDateTime.toISOString())
                    : "—"}
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
              {isLoadingVirtualClock
                ? "Loading..."
                : virtualClock?.currentDateTime
                  ? formatDateTime(liveVirtualDateTime.toISOString())
                  : "—"}
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
                  {(
                    [
                      ["minutes", "Minutes"],
                      ["hours", "Hours"],
                      ["days", "Days"],
                      ["weeks", "Weeks"],
                      ["months", "Months"],
                      ["years", "Years"],
                    ] as const
                  ).map(([field, label]) => (
                    <div key={field} className="space-y-1">
                      <Label htmlFor={field} className="text-xs">
                        {label}
                      </Label>

                      <Input
                        id={field}
                        type="number"
                        min={0}
                        inputMode="numeric"
                        value={customAdvance[field]}
                        onChange={(event) =>
                          setCustomAdvance((prev) => ({
                            ...prev,
                            [field]: event.target.value,
                          }))
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
              className="w-full"
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
