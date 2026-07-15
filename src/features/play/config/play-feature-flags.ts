// VERZUS M5 STEPS 5.9-5.13

export function isPlayCommandCenterEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_M5_PLAY_COMMAND_CENTER !== "false";
}
