import {
  Home,
  Coffee,
  UtensilsCrossed,
  Warehouse,
  BedDouble,
  Building2,
  CircleParking,
  Briefcase,
  Store,
  Building,
  Palmtree,
  Stethoscope,
  Dumbbell,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  Home,
  Coffee,
  UtensilsCrossed,
  Warehouse,
  BedDouble,
  Building2,
  CircleParking,
  Briefcase,
  Store,
  Building,
  Palmtree,
  Stethoscope,
  Dumbbell,
  LayoutGrid,
};

export function iconFor(name: string): LucideIcon {
  return iconMap[name] ?? LayoutGrid;
}
