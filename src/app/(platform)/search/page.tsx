import type { Metadata } from "next";

import { getPlatformRouteById } from "@/components/layout/app-shell";
import { SearchScreen } from "@/features/search/ui";

const route = getPlatformRouteById("search");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

export default function SearchPage() {
  return <SearchScreen />;
}
