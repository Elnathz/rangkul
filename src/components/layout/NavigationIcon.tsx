import {
  AlertTriangle,
  CalendarDays,
  ClipboardList,
  FileText,
  House,
  MessageCircle,
  Settings2,
  ShieldCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";

import type { NavigationIcon as NavigationIconName } from "@/lib/navigation/role-navigation";

type NavigationIconProps = {
  name: NavigationIconName;
  className?: string;
};

const icons = {
  home: House,
  calendar: CalendarDays,
  users: UsersRound,
  wallet: WalletCards,
  message: MessageCircle,
  shield: ShieldCheck,
  clipboard: ClipboardList,
  alert: AlertTriangle,
  file: FileText,
  settings: Settings2,
};

export function NavigationIcon({ name, className }: NavigationIconProps) {
  const Icon = icons[name];
  return <Icon className={className} aria-hidden="true" />;
}
