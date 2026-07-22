import type { ProfileEditFields, ProfileEditSnapshot } from "../model/profile-edit.types";

interface RawProfileEditResponse {
  data: {
    version: number;
    updated_at: string;
    avatar_url: string | null;
    replayed: boolean;
    fields: {
      display_name: string;
      handle: string;
      title: string;
      bio: string;
      location_label: string;
      country_code: string;
      availability_state: ProfileEditFields["availabilityState"];
      availability_label: string;
      availability_detail: string;
      next_window_label: string;
    };
  };
}

function adapt(payload: unknown): ProfileEditSnapshot {
  const parsed = payload as RawProfileEditResponse;
  return {
    version: parsed.data.version,
    updatedAt: parsed.data.updated_at,
    avatarUrl: parsed.data.avatar_url,
    replayed: parsed.data.replayed,
    fields: {
      displayName: parsed.data.fields.display_name,
      handle: parsed.data.fields.handle,
      title: parsed.data.fields.title,
      bio: parsed.data.fields.bio,
      locationLabel: parsed.data.fields.location_label,
      countryCode: parsed.data.fields.country_code,
      availabilityState: parsed.data.fields.availability_state,
      availabilityLabel: parsed.data.fields.availability_label,
      availabilityDetail: parsed.data.fields.availability_detail,
      nextWindowLabel: parsed.data.fields.next_window_label,
    },
  };
}

export async function updateProfile(input: {
  expectedVersion: number;
  fields: ProfileEditFields;
  idempotencyKey: string;
}): Promise<ProfileEditSnapshot> {
  const response = await fetch("/api/profile", {
    method: "PATCH",
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      "idempotency-key": input.idempotencyKey,
    },
    body: JSON.stringify({
      expected_version: input.expectedVersion,
      fields: {
        display_name: input.fields.displayName,
        handle: input.fields.handle,
        title: input.fields.title,
        bio: input.fields.bio,
        location_label: input.fields.locationLabel,
        country_code: input.fields.countryCode,
        availability_state: input.fields.availabilityState,
        availability_label: input.fields.availabilityLabel,
        availability_detail: input.fields.availabilityDetail,
        next_window_label: input.fields.nextWindowLabel,
      },
    }),
  });
  const payload: unknown = await response.json();
  if (!response.ok) {
    const failure = payload as { error?: { message?: string } };
    throw new Error(failure.error?.message ?? "Profile could not be saved.");
  }
  return adapt(payload);
}
