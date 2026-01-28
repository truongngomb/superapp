import { useNavigate, useLocation } from "react-router-dom";
import { SharedLayoutAdapter as BaseSharedLayoutAdapter } from "@superapp/ui-kit";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@superapp/core-logic";
import { useAppMenu } from "@/hooks";
import { NAVIGATION_ITEMS } from "@/config/navigation";
import { useMemo } from "react";

export function SharedLayoutAdapter() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { menuItems } = useAppMenu();
  const { t } = useTranslation(["uikit", "home", "categories", "markdown"]);

  const title = useMemo(() => {
    // Sort items by path length descending to match specific paths before prefixes
    const sortedItems = [...NAVIGATION_ITEMS].sort(
      (a, b) => b.path.length - a.path.length,
    );

    const item = sortedItems.find((item) => {
      if (item.matchPrefix) {
        return pathname.startsWith(item.path);
      }
      return pathname === item.path;
    });

    if (item) {
        // Only set title for exact matches or if matchPrefix is explicitly intended for title (which usually implies exact or capture)
        // If it's a prefix match but not exact (e.g. /admin/users vs /admin), yield to child components
        if (item.matchPrefix && pathname !== item.path) {
          return null;
        }

        // Translation keys might be in specific namespaces, ensure we have them loaded
        return `${t(item.labelKey)} | SuperApp`;
    }

    // Default fallback if no item matches (won't set anything so page can set it)
    return null;
  }, [pathname, t]);

  useDocumentTitle(title);

  return (
    <BaseSharedLayoutAdapter
      menuItems={menuItems}
      onViewAllNotifications={() => {
        void navigate("/admin/activity-logs");
      }}
    />
  );
}
