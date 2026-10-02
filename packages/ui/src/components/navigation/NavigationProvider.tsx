"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Role = "ADMIN" | "ORGANIZER" | "JUDGE" | "PARTICIPANT" | "SUPER_ADMIN" | "VOLUNTEER";

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  roles: Role[];
}

export interface NavigationUser {
  email: string;
  role: Role;
}

interface NavigationContextType {
  user: NavigationUser | null;
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  navigationItems: NavigationItem[];
  filteredItems: NavigationItem[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const defaultNavigation: NavigationItem[] = [
  { id: "superadmin", label: "God Mode", icon: "ShieldAlert", href: "/superadmin", roles: ["SUPER_ADMIN"] },
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard", href: "/", roles: ["ADMIN", "ORGANIZER", "SUPER_ADMIN"] },
  { id: "scanner", label: "QR Scanner", icon: "ScanLine", href: "/scanner", roles: ["ADMIN", "ORGANIZER", "SUPER_ADMIN", "VOLUNTEER"] },
  { id: "checkins", label: "Check-ins", icon: "QrCode", href: "/qr", roles: ["ADMIN", "ORGANIZER", "SUPER_ADMIN"] },
  { id: "organizers", label: "Organizers", icon: "UsersRound", href: "/organizers", roles: ["ADMIN", "SUPER_ADMIN"] },
  { id: "users", label: "Users", icon: "Users", href: "/users", roles: ["ADMIN", "ORGANIZER", "SUPER_ADMIN"] },
  { id: "events", label: "Events", icon: "Calendar", href: "/events", roles: ["ADMIN", "ORGANIZER", "SUPER_ADMIN"] },
  { id: "hackathons", label: "Hackathons", icon: "Code2", href: "/hackathons", roles: ["ADMIN", "ORGANIZER", "SUPER_ADMIN"] },
  { id: "judging", label: "Judging", icon: "Gavel", href: "/judging", roles: ["ADMIN", "ORGANIZER", "SUPER_ADMIN"] },
  { id: "volunteers", label: "Volunteers", icon: "HandHeart", href: "/volunteers", roles: ["ORGANIZER", "SUPER_ADMIN"] },
  { id: "payments", label: "Payments", icon: "CreditCard", href: "/payments", roles: ["ADMIN", "ORGANIZER", "SUPER_ADMIN"] },
  { id: "analytics", label: "Analytics", icon: "LineChart", href: "/analytics", roles: ["ADMIN", "ORGANIZER", "SUPER_ADMIN"] },
  { id: "settings", label: "Settings", icon: "Settings", href: "/settings", roles: ["ADMIN", "ORGANIZER", "SUPER_ADMIN"] },
];

export function NavigationProvider({ children, initialRole = "ADMIN", user = null }: { children: React.ReactNode, initialRole?: Role, user?: NavigationUser | null }) {
  const [activeRole, setActiveRole] = useState<Role>(initialRole);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // The provider survives client-side navigation, so follow the server's role
  // when it changes (e.g. after logging in or out)
  const [lastInitialRole, setLastInitialRole] = useState<Role>(initialRole);
  if (initialRole !== lastInitialRole) {
    setLastInitialRole(initialRole);
    setActiveRole(initialRole);
  }

  const filteredItems = defaultNavigation.filter(item => item.roles.includes(activeRole));

  return (
    <NavigationContext.Provider value={{ user, activeRole, setActiveRole, isSidebarOpen, setSidebarOpen, navigationItems: defaultNavigation, filteredItems }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) throw new Error("useNavigation must be used within NavigationProvider");
  return context;
}
