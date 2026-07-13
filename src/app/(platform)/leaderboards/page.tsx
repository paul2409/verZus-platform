import { redirect } from "next/navigation";

export default function LeaderboardsIndexPage(): never {
  redirect("/leaderboards/weekly");
}
