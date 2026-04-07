import type { EdgeInsets } from "react-native-safe-area-context";

// On Android edge-to-edge mode, the system nav bar inset can be 0 even
// though the buttons are visible. Floor at 16 so screen content never sits
// flush against the system buttons. `extra` is the screen-specific padding
// you'd add on top (e.g. extra space below the last card).
export function bottomInsetPadding(
  insets: Pick<EdgeInsets, "bottom">,
  extra: number = 0,
  minimum: number = 16,
): number {
  return Math.max(insets.bottom, minimum) + extra;
}
