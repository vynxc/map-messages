import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  messages: defineTable({
    latitude: v.float64(),
    longitude: v.float64(),
    message: v.string(),
  }).index("by_latitude_longitude", ["latitude", "longitude"])
});
