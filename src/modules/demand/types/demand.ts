// ==================================================
// DEMAND MODULE - TYPES
// ==================================================

export interface Demand {
  id: string;
  title: string;
  description?: string;
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  priority?: "low" | "medium" | "high" | "critical";
  category?: string;
  created_at?: string;
  updated_at?: string;
  userId?: string;
  metadata?: Record<string, any>;
}
