// VERZUS M11.3 PROFILE EDIT ZOD VALIDATION

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
  title: trimmedText("Player title", 2, 48),
  bio: z.string().trim().max(160, "Bio must contain no more than 160 characters."),
  locationLabel: trimmedText("Location", 2, 64),
  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "Country code must use two letters."),
  availabilityState: z.enum(["available", "limited", "unavailable"]),
  availabilityLabel: trimmedText("Availability label", 2, 48),
  availabilityDetail: trimmedText("Availability detail", 2, 120),
  nextWindowLabel: trimmedText("Next availability window", 2, 80),
});

export type ProfileEditSchemaInput = z.input<typeof profileEditSchema>;
export type ProfileEditSchemaOutput = z.output<typeof profileEditSchema>;

export const profileAvatarRules = {
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  maximumBytes: 2 * 1024 * 1024,
  minimumDimension: 256,
  maximumDimension: 4096,
} as const;
