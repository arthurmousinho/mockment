import { useEffect, useRef } from "react";
import {
  CheckIcon,
  ClockIcon,
  SkipForwardIcon,
  SpinnerGapIcon,
  XIcon,
} from "@phosphor-icons/react";
import type {
  SimulationRunStatus,
  SimulationStepRun,
} from "@/http/simulations-http";
import { cn } from "@/lib/utils";

type SimulationTimelineProgressProps = {
  step: SimulationStepRun;
  nextStep?: SimulationStepRun;
  runStatus: SimulationRunStatus;
  delay: number | null | undefined;
};

type ConnectorMode = "idle" | "waiting" | "done";

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function Connector({
  mode,
  startedAt,
  delay,
}: {
  mode: ConnectorMode;
  startedAt: number | null;
  delay: number | undefined;
}) {
  const fill = useRef<HTMLSpanElement>(null);
  const progress = useRef<number | null>(null);

  const timed =
    mode === "waiting" &&
    startedAt !== null &&
    delay !== undefined &&
    delay > 0;

  useEffect(() => {
    const fillEl = fill.current;
    if (!fillEl) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setScale = (value: number) => {
      fillEl.style.transform = `scaleY(${value})`;
      progress.current = value;
    };

    if (mode === "idle") {
      setScale(0);
      return;
    }

    if (mode === "done") {
      const from = progress.current;
      // Já montou concluído (ou movimento reduzido): sem animação.
      if (from === null || from >= 1 || reducedMotion.matches) {
        setScale(1);
        return;
      }
      const finish = fillEl.animate(
        [{ transform: `scaleY(${from})` }, { transform: "scaleY(1)" }],
        {
          duration: 180,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "forwards",
        },
      );
      finish.onfinish = () => {
        setScale(1);
        finish.cancel();
      };
      return () => {
        setScale(1);
        finish.cancel();
      };
    }

    // mode === "waiting"
    if (!timed) {
      // A known zero delay is already complete.
      setScale(1);
      return;
    }

    const duration = delay as number;
    const start = startedAt as number;
    let fillAnim: Animation | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function sync() {
      fillAnim?.cancel();
      clearTimeout(timer);
      const elapsed = Math.max(0, Math.min(duration, Date.now() - start));

      if (reducedMotion.matches) {
        setScale(elapsed / duration);
        if (elapsed < duration) timer = setTimeout(sync, 1000);
        return;
      }

      fillAnim = fillEl!.animate(
        [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }],
        { duration, easing: "linear", fill: "both" },
      );
      fillAnim.currentTime = elapsed;
    }

    sync();
    reducedMotion.addEventListener("change", sync);

    return () => {
      reducedMotion.removeEventListener("change", sync);
      clearTimeout(timer);
      // Congela o progresso atual para a próxima transição partir dele.
      setScale(clamp01((Date.now() - start) / duration));
      fillAnim?.cancel();
    };
  }, [mode, timed, startedAt, delay]);

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute top-[22px] -bottom-[22px] left-1/2 w-0.5 -translate-x-1/2"
    >
      <span className="absolute inset-0 overflow-hidden rounded-full bg-border/70">
        <span
          ref={fill}
          className={cn(
            "absolute inset-0 origin-top bg-green-600 dark:bg-green-500",
            mode === "waiting" &&
              (startedAt === null || delay === undefined) &&
              "opacity-40 motion-safe:animate-pulse",
          )}
          style={{ transform: "scaleY(0)" }}
        />
      </span>
    </span>
  );
}

export function SimulationTimelineProgress({
  step,
  nextStep,
  runStatus,
  delay,
}: SimulationTimelineProgressProps) {
  const active = runStatus === "RUNNING";
  const running = active && step.status === "RUNNING";
  const waiting =
    active && step.status === "COMPLETED" && nextStep?.status === "PENDING";
  const connected =
    step.status === "COMPLETED" &&
    Boolean(
      nextStep?.startedAt ||
      nextStep?.status === "COMPLETED" ||
      nextStep?.status === "FAILED",
    );

  const finishedAt = step.finishedAt ? Date.parse(step.finishedAt) : NaN;
  const startedAt = Number.isFinite(finishedAt) ? finishedAt : null;
  const interval = delay === null ? 0 : delay;
  const mode: ConnectorMode = connected ? "done" : waiting ? "waiting" : "idle";

  const badge = useRef<HTMLSpanElement>(null);
  const previousStatus = useRef(step.status);

  // Animate only status changes; restored runs remain static.
  useEffect(() => {
    if (previousStatus.current === step.status) return;
    previousStatus.current = step.status;
    const element = badge.current;
    if (
      !element ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const pop = element.animate(
      [
        { transform: "scale(0.94)", opacity: 0.75 },
        { transform: "scale(1)", opacity: 1 },
      ],
      { duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
    return () => pop.cancel();
  }, [step.status]);

  const Icon =
    step.status === "COMPLETED"
      ? CheckIcon
      : step.status === "FAILED"
        ? XIcon
        : step.status === "RUNNING"
          ? SpinnerGapIcon
          : step.status === "SKIPPED"
            ? SkipForwardIcon
            : ClockIcon;

  return (
    <span className="pointer-events-none absolute inset-y-0 -left-9 w-6">
      {nextStep && (
        <Connector mode={mode} startedAt={startedAt} delay={interval} />
      )}
      {!nextStep &&
        (step.status === "COMPLETED" || step.status === "FAILED") && (
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-[22px] bottom-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full",
              step.status === "COMPLETED"
                ? "bg-green-600 dark:bg-green-500"
                : "bg-destructive",
            )}
          />
        )}
      <span
        ref={badge}
        aria-label={`Step ${step.stepIndex + 1}: ${step.status.toLowerCase()}`}
        className={cn(
          "absolute top-2.5 left-0 z-10 flex size-6 items-center justify-center rounded-full border bg-card text-muted-foreground ring-4 ring-card transition-colors duration-200 motion-reduce:transition-none",
          step.status === "COMPLETED" &&
            "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-500",
          step.status === "FAILED" &&
            "border-destructive bg-destructive text-white",
          running &&
            "border-primary/40 bg-card text-primary shadow-[0_0_0_3px] shadow-primary/10",
        )}
      >
        <Icon
          size={14}
          weight="bold"
          className={cn("relative", running && "motion-safe:animate-spin")}
        />
      </span>
    </span>
  );
}
