import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  User, 
  FolderGit2, 
  Wrench, 
  Trophy, 
  Palette, 
  LogOut, 
  ExternalLink,
  Menu,
  X
} from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen }) {
  const { logout, userData } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const navItems = [
    { name: "Profile", path: "/dashboard/profile", icon: <User size={20} /> },
    { name: "Projects", path: "/dashboard/projects", icon: <FolderGit2 size={20} /> },
    { name: "Skills", path: "/dashboard/skills", icon: <Wrench size={20} /> },
    { name: "Achievements", path: "/dashboard/achievements", icon: <Trophy size={20} /> },
    { name: "Customize", path: "/dashboard/customize", icon: <Palette size={20} /> },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 glass border-r border-border transition-transform tracking-tight flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/30">
              S
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Student Portfolio</h2>
              <p className="text-xs text-muted-foreground">Builder by GATE</p>
            </div>
          </div>
          <button className="md:hidden text-muted-foreground" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-foreground"
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-border/50 space-y-2">
          {userData?.username && (
            <a 
              href={`/portfolio/${userData.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <span>View Portfolio</span>
              <ExternalLink size={16} />
            </a>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={20} />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
