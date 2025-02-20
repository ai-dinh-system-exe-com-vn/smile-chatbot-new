import { AnimatePresence, motion } from "framer-motion";
import { FiMenu, FiMoon, FiSun } from "react-icons/fi";

export interface NavbarProps {
  title?: string;
  onThemeChange?: () => void;
  showSidebarButton?: boolean;
  onToggleSidebar?: () => void;
}

export default function Navbar({ 
  title = "Smile Chatbot Assistant",
  onThemeChange,
  showSidebarButton = false,
  onToggleSidebar
}: NavbarProps) {
  return (
    <motion.nav 
      className="navbar bg-base-200 shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left side - Menu Button & Title */}
      <div className="flex-1 flex items-center gap-4">
        <AnimatePresence>
          {showSidebarButton && (
            <motion.button
              className="btn btn-ghost btn-circle"
              onClick={onToggleSidebar}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiMenu className="h-5 w-5" />
            </motion.button>
          )}
        </AnimatePresence>
        <motion.h1 
          className="text-xl font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h1>
      </div>

      {/* Right side - Theme Toggle */}
      <div className="flex-none">
        <motion.button
          className="btn btn-ghost btn-circle"
          onClick={onThemeChange}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <label className="swap swap-rotate">
            <input type="checkbox" className="theme-controller" value="light" />
            <FiSun className="swap-on h-5 w-5" />
            <FiMoon className="swap-off h-5 w-5" />
          </label>
        </motion.button>
      </div>
    </motion.nav>
  );
}