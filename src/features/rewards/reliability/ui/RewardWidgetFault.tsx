"use client";

// VERZUS M10.7 CONTROLLED WIDGET FAILURE INJECTION

import type { ReactNode } from "react";

import type { RewardWidgetName, RewardWidgetScenario } from "../model/reward-reliability.types";

export function RewardWidgetFault({
  children,
  selectedWidget,
  scenario,
  widget,
}: {
  children: ReactNode;
  selectedWidget?: RewardWidgetName | undefined;
  scenario: RewardWidgetScenario;
  widget: RewardWidgetName;
}) {
  if (scenario === "crash" && selectedWidget === widget) {
    throw new Error(`Controlled M10.7 ${widget} widget failure.`);
  }

  return children;
}
