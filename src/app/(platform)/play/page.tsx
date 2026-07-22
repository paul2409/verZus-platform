import type { Metadata } from "next";

import { getPlatformRouteById } from "@/components/layout/app-shell";
import { isPlayCommandCenterEnabled } from "@/features/play/config/play-feature-flags";
import { PlayCommandCenter, PlayDisabledState } from "@/features/play/ui";

const route = getPlatformRouteById("play");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

export default function PlayPage() {
  if (!isPlayCommandCenterEnabled()) return <PlayDisabledState />;
  return <PlayCommandCenter />;
}
