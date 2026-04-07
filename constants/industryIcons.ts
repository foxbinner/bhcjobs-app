import { MaterialCommunityIcons } from "@expo/vector-icons";

export type IndustryIconName = keyof typeof MaterialCommunityIcons.glyphMap;

// Maps the BHCJobs API industry name to a MaterialCommunityIcons glyph.
// Used by the landing carousel, the full industries list, and the
// industry detail screen so the same name always renders the same icon.
export const INDUSTRY_ICON_MAP: Record<string, IndustryIconName> = {
  Construction: "crane",
  "Fast Food Restaurant": "food",
  "Facilities Management": "office-building-outline",
  "Factory & Manufacturing": "factory",
  Catering: "silverware-fork-knife",
  Agriculture: "sprout-outline",
  Hotel: "bed-outline",
  "Contracting & Maintenance": "wrench-outline",
  "Cafés & Coffee Shops": "coffee-outline",
  "Cafes & Coffee Shops": "coffee-outline",
  Others: "briefcase-outline",
};

export const DEFAULT_INDUSTRY_ICON: IndustryIconName = "briefcase-outline";

export function getIndustryIcon(name: string | undefined): IndustryIconName {
  if (!name) return DEFAULT_INDUSTRY_ICON;
  return INDUSTRY_ICON_MAP[name] ?? DEFAULT_INDUSTRY_ICON;
}
