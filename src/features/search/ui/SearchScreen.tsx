// VERZUS M12.1 GLOBAL SEARCH ROUTE COMPOSITION
import { Suspense } from "react";

import {
  SearchFoundationScreen,
  SearchFoundationSkeleton,
} from "../foundation";

export function SearchScreen() {
  return (
    <Suspense fallback={<SearchFoundationSkeleton />}>
      <SearchFoundationScreen />
    </Suspense>
  );
}
