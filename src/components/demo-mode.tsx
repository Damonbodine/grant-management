"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Compass, PlayCircle, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type DemoStep = {
  id: string;
  title: string;
  body: string;
  whyItMatters: string;
  routePrefix: string;
  target?: string;
  actionLabel?: string;
};

type DemoScenario = {
  id: string;
  title: string;
  estimatedMinutes: number;
  description: string;
  steps: DemoStep[];
};

const GRANTFLOW_SCENARIO: DemoScenario = {
  id: "grant-pipeline-review",
  title: "Grant Pipeline Review",
  estimatedMinutes: 2,
  description:
    "Show how GrantFlow helps a nonprofit team review pipeline health, inspect deadline pressure, and open a live grant opportunity for follow-up.",
  steps: [
    {
      id: "dashboard-overview",
      title: "Start with the pipeline overview",
      body:
        "The dashboard is the fastest way for a grant manager to see application volume, active awards, total awarded value, and open opportunities.",
      whyItMatters:
        "Nonprofits need quick answers on pipeline health before they trust the underlying system.",
      routePrefix: "/dashboard",
      target: "[data-demo='dashboard-overview']",
      actionLabel: "Open dashboard",
    },
    {
      id: "dashboard-stats",
      title: "Review the top-line grant metrics",
      body:
        "These cards summarize the pipeline at a glance so leaders can understand whether work is concentrated in review, awards, or open opportunities.",
      whyItMatters:
        "This proves the app can support prioritization, not just record keeping.",
      routePrefix: "/dashboard",
      target: "[data-demo='dashboard-stats']",
    },
    {
      id: "pipeline-breakdown",
      title: "Inspect the pipeline by stage",
      body:
        "The stage breakdown shows where grant applications are getting stuck and where the team has the most funding in motion.",
      whyItMatters:
        "Stage visibility is what turns a grants database into a management tool.",
      routePrefix: "/dashboard",
      target: "[data-demo='pipeline-breakdown']",
    },
    {
      id: "upcoming-deadlines",
      title: "Focus on upcoming deadlines",
      body:
        "This section surfaces what is due soon, including both application and reporting obligations, so deadlines are less likely to slip.",
      whyItMatters:
        "For many nonprofits, deadline management is the difference between submitted and missed funding.",
      routePrefix: "/dashboard",
      target: "[data-demo='upcoming-deadlines']",
    },
    {
      id: "grants-list",
      title: "Open the grants workspace",
      body:
        "The grants page lets staff search, filter, and review live opportunities before deciding which ones deserve active work.",
      whyItMatters:
        "This is where a grant manager shifts from monitoring the pipeline to acting on specific opportunities.",
      routePrefix: "/grants",
      target: "[data-demo='grants-table']",
      actionLabel: "Open grants",
    },
    {
      id: "grant-detail",
      title: "Review a single grant opportunity",
      body:
        "Open a grant to see the funder, deadline, amount range, eligibility, and supporting detail that the team needs for go/no-go decisions.",
      whyItMatters:
        "This shows the app can hold the information needed to evaluate real opportunities, not just titles and dates.",
      routePrefix: "/grants/",
      target: "[data-demo='grant-detail-view']",
    },
  ],
};

function getScenarioById(id: string | null): DemoScenario | null {
  if (id === GRANTFLOW_SCENARIO.id) return GRANTFLOW_SCENARIO;
  return null;
}

function routeMatches(pathname: string, routePrefix: string) {
  if (routePrefix.endsWith("/")) {
    return pathname.startsWith(routePrefix);
  }
  return pathname === routePrefix || pathname.startsWith(`${routePrefix}/`);
}

export function DemoMode() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const demoId = searchParams.get("demo");
  const stepParam = searchParams.get("step");
  const scenario = useMemo(() => getScenarioById(demoId), [demoId]);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!scenario) {
      setStepIndex(0);
      return;
    }

    const parsedStep = Number(stepParam ?? "1");
    const nextStepIndex =
      Number.isFinite(parsedStep) && parsedStep > 0
        ? Math.min(parsedStep - 1, scenario.steps.length - 1)
        : 0;

    setStepIndex((prev) => (prev === nextStepIndex ? prev : nextStepIndex));
  }, [demoId, scenario, stepParam]);

  const currentStep = scenario?.steps[stepIndex];

  useEffect(() => {
    if (!scenario) return;

    const nextStepParam = String(stepIndex + 1);
    if (stepParam === nextStepParam) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("demo", scenario.id);
    params.set("step", nextStepParam);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, scenario, searchParams, stepIndex, stepParam]);

  useEffect(() => {
    if (!currentStep?.target) return;

    const element = document.querySelector(currentStep.target);
    if (!element) return;

    element.setAttribute("data-demo-active", "true");
    element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

    return () => {
      element.removeAttribute("data-demo-active");
    };
  }, [currentStep, pathname]);

  if (!scenario || !currentStep) {
    return null;
  }

  const activeScenario = scenario;
  const activeStep = currentStep;
  const onExpectedRoute = routeMatches(pathname, currentStep.routePrefix);
  const isLastStep = stepIndex === scenario.steps.length - 1;

  function updateSearch(nextDemo: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextDemo) {
      params.set("demo", nextDemo);
      params.set("step", String(stepIndex + 1));
    } else {
      params.delete("demo");
      params.delete("step");
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function nextStep() {
    if (!onExpectedRoute) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("demo", activeScenario.id);
      params.set("step", String(stepIndex + 1));
      const route =
        activeStep.routePrefix === "/grants/" ? "/grants" : activeStep.routePrefix;
      router.push(`${route}?${params.toString()}`);
      return;
    }

    if (!isLastStep) {
      setStepIndex((prev) => prev + 1);
    }
  }

  function previousStep() {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  }

  function restartScenario() {
    setStepIndex(0);
    router.push("/dashboard?demo=grant-pipeline-review&step=1");
  }

  function exitDemo() {
    updateSearch(null);
  }

  return (
    <div className="pointer-events-none fixed right-6 bottom-6 z-50 w-full max-w-md">
      <div className="pointer-events-auto rounded-2xl border border-border bg-card/95 p-5 shadow-2xl backdrop-blur">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                Guided Demo
              </Badge>
              <span className="text-xs text-muted-foreground">
                Step {stepIndex + 1} of {activeScenario.steps.length}
              </span>
            </div>
            <h2 className="text-xl font-semibold">{activeScenario.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{activeScenario.description}</p>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0" onClick={exitDemo}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((stepIndex + 1) / scenario.steps.length) * 100}%` }}
            
          />
        </div>

        <div className="space-y-3">
          <div data-demo-panel-step={currentStep.id}>
            <h3 className="text-base font-semibold">{currentStep.title}</h3>
            <p className="mt-1 text-sm text-foreground/90">{currentStep.body}</p>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Why this matters
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">{currentStep.whyItMatters}</p>
          </div>

          {!onExpectedRoute && (
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
              Go to the next screen to continue this walkthrough.
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousStep} disabled={stepIndex === 0}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
            <Button variant="ghost" size="sm" onClick={restartScenario}>
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Restart
            </Button>
          </div>
          <Button size="sm" onClick={nextStep}>
            {!onExpectedRoute ? (
              <>
                <Compass className="mr-1.5 h-4 w-4" />
                {currentStep.actionLabel ?? "Go there"}
              </>
            ) : isLastStep ? (
              "Finish"
            ) : (
              <>
                Next
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {isLastStep && onExpectedRoute && (
          <div className="mt-3 rounded-xl border border-success/30 bg-success/10 p-3 text-sm text-success">
            You’ve completed the guided demo. Keep exploring, or restart the scenario any time.
          </div>
        )}
      </div>
    </div>
  );
}

export function DemoModeStartButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      className={cn("gap-2", className)}
      onClick={() => router.push("/dashboard?demo=grant-pipeline-review&step=1")}
    >
      <PlayCircle className="h-4 w-4" />
      Start guided demo
    </Button>
  );
}
