import { PRODUCT_GROWTH_V1 } from "./product-growth-v1";
import type { TaskEvaluationConfig } from "./types";

export type { TaskEvaluationConfig, EvidenceFieldKey } from "./types";

export const DEFAULT_TASK_ID = PRODUCT_GROWTH_V1.taskId;

/**
 * Task Registry — register new simulation tasks here.
 * Unknown / missing taskId resolves to DEFAULT_TASK_ID (product-growth-v1).
 */
export const TASK_REGISTRY: Record<string, TaskEvaluationConfig> = {
  [PRODUCT_GROWTH_V1.taskId]: PRODUCT_GROWTH_V1,
};

/** Resolve request taskId to a registered id (never throws). */
export function resolveTaskId(taskId?: string | null): string {
  const trimmed = typeof taskId === "string" ? taskId.trim() : "";
  if (trimmed && TASK_REGISTRY[trimmed]) return trimmed;
  return DEFAULT_TASK_ID;
}

export function getTaskConfig(taskId?: string | null): TaskEvaluationConfig {
  return TASK_REGISTRY[resolveTaskId(taskId)];
}

export { PRODUCT_GROWTH_V1 };
