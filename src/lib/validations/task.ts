import { z } from "zod";

export const startTaskSchema = z.object({
  checkin_lat: z.number().finite().min(-90).max(90).nullable().optional(),
  checkin_lng: z.number().finite().min(-180).max(180).nullable().optional(),
}).refine(
  ({ checkin_lat, checkin_lng }) => (checkin_lat == null && checkin_lng == null) || (checkin_lat != null && checkin_lng != null),
  { message: "Koordinat check-in harus diisi berpasangan", path: ["checkin_lat"] },
);

export type StartTaskInput = z.infer<typeof startTaskSchema>;
