import { Home, Calendar, UserCircle } from "lucide-react";
import Index from "./pages/Index.jsx";
import Events from "./pages/Events.jsx";
import Admin from "./pages/Admin.jsx";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <Home className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Events",
    to: "/events",
    icon: <Calendar className="h-4 w-4" />,
    page: <Events />,
  },
  {
    title: "Admin",
    to: "/admin",
    icon: <UserCircle className="h-4 w-4" />,
    page: <Admin />,
  },
];
