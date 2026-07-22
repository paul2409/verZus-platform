import { z } from "zod";

const trimmedText = (label: string, minimum: number, maximum: number) =>
  z
    .string()
    .trim()
    .min(minimum, `${label} must contain at least ${minimum} characters.`)
    .max(maximum, `${label} must contain no more than ${maximum} characters.`);

export const profileEditSchema = z.object({
  displayName: trimmedText("Display name", 3, 32),
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^@[a-z0-9_]{3,20}$/,
      "Use @ followed by 3-20 lowercase letters, numbers or underscores.",
    ),
  title: z.string().trim().max(48, "Player title must contain no more than 48 characters."),
  bio: z.string().trim().max(160, "Bio must contain no more than 160 characters."),
  locationLabel: z.string().trim().max(64, "Location must contain no more than 64 characters."),
  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^$|^[A-Z]{2}$/, "Country code must use two letters."),
  availabilityState: z.enum(["available", "limited", "unavailable"]),
  availabilityLabel: trimmedText("Availability label", 2, 48),
  availabilityDetail: z
    .string()
    .trim()
    .max(120, "Availability detail must contain no more than 120 characters."),
  nextWindowLabel: z
    .string()
    .trim()
    .max(80, "Next availability window must contain no more than 80 characters."),
});

export const profileEditUpdateCommandSchema = z.object({
  expected_version: z.number().int().positive(),
  fields: z.object({
    display_name: profileEditSchema.shape.displayName,
    handle: profileEditSchema.shape.handle,
    title: profileEditSchema.shape.title,
    bio: profileEditSchema.shape.bio,
    location_label: profileEditSchema.shape.locationLabel,
    country_code: profileEditSchema.shape.countryCode,
    availability_state: profileEditSchema.shape.availabilityState,
    availability_label: profileEditSchema.shape.availabilityLabel,
    availability_detail: profileEditSchema.shape.availabilityDetail,
    next_window_label: profileEditSchema.shape.nextWindowLabel,
  }),
});

export type ProfileEditSchemaInput = z.input<typeof profileEditSchema>;
export type ProfileEditSchemaOutput = z.output<typeof profileEditSchema>;
