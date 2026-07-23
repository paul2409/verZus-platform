export type SmartActionTone = "cyan" | "green" | "violet" | "magenta" | "gold";

export interface SmartAction {
  id: string;
  href: string;
  label: string;
  detail: string;
  reason: string;
  glyph: string;
  tone: SmartActionTone;
  priority: number;
}
