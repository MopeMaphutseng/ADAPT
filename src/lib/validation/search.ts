import { z } from "zod";

export const searchQuerySchema = z.object({
  query: z.string().min(2, "Search query must be at least 2 characters.").max(200, "Search query is too long."),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
