import type { DataSource } from "./mock";
import { mockDataSource } from "./mock";
import { supabaseDataSource } from "./supabase";

export function getDataSource(): DataSource {
  const source = process.env.DATA_SOURCE ?? "mock";
  if (source === "supabase") {
    return supabaseDataSource;
  }
  return mockDataSource;
}