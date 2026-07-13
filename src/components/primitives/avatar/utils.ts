export function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export function getInitials(name: string, explicitInitials?: string): string {
  if (explicitInitials?.trim()) {
    return explicitInitials.trim().slice(0, 3).toUpperCase();
  }

  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  if (words.length === 1) {
    return words[0]?.slice(0, 2).toUpperCase() ?? "?";
  }

  const first = words[0]?.charAt(0) ?? "";
  const last = words.at(-1)?.charAt(0) ?? "";

  return `${first}${last}`.toUpperCase() || "?";
}
