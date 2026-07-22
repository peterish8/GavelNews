import type { DataSource } from "./mock";
import { mockDataSource } from "./mock";

// In Phase 5 this will also export a supabaseDataSource.
// For now, only the mock source is wired.

export function getDataSource(): DataSource {
  const source = process.env.DATA_SOURCE ?? "mock";
  if (source === "supabase") {
    // Phase 5 will add: return supabaseDataSource;
    // For now, fall back to mock if someone forgets to set DATA_SOURCE.
    console.warn(
      "[gavel-news] DATA_SOURCE=supabase but no Supabase client wired yet — falling back to mock.",
    );
  }
  return mockDataSource;
}