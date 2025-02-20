import { motion } from "framer-motion";
import {
  FiMenu,
  FiMoreVertical,
  FiPlus,
  FiSettings
} from "react-icons/fi";

export interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
}

export interface SidebarProps {
  conversations?: Conversation[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNewChat?: () => void;
  onSelectModel?: (model: string) => void;
  onSettings?: () => void;
  onConversationAction?: (
    id: string,
    action: "delete" | "pin" | "settings"
  ) => void;
}

export default function Sidebar({
  conversations = [],
  isCollapsed = false,
  onToggleCollapse,
  onNewChat,
  onSelectModel,
  onSettings,
  onConversationAction,
}: SidebarProps) {
  const models = ["o3-mini", "o1-mini"];

  const sidebarVariants = {
    expanded: { width: "320px", opacity: 1 },
    collapsed: { width: "0px", opacity: 0 },
  };

  return (
    <motion.div
      className={`flex flex-col h-screen bg-base-200 overflow-hidden`}
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3 }}
    >
      {/* Top Section - Logo & Toggle */}
      <div className="p-3 flex items-center shadow-sm justify-between">
        <motion.div
          className="flex items-center h-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.img
            src="/logo.svg"
            alt="Logo"
            className="w-28 h-28"
            initial={{ rotate: -10, opacity: 0, scale: 0.8 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.1 }}
          />
        </motion.div>
        <motion.button
          className="btn btn-ghost btn-circle"
          onClick={onToggleCollapse}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FiMenu className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Main Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* New Chat Button */}
        <motion.button
          className="btn btn-primary m-4"
          onClick={onNewChat}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiPlus className="h-5 w-5" />
          <span>New Chat</span>
        </motion.button>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversations.map((conv) => (
            <motion.div
              key={conv.id}
              className="card bg-base-100 shadow-sm hover:shadow-md cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="card-body p-4">
                <h3 className="card-title text-sm">{conv.title}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs opacity-70">
                    {conv.timestamp.toLocaleTimeString()}
                  </span>
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost btn-xs">
                      <FiMoreVertical />
                    </label>
                    <ul
                      tabIndex={0}
                      className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                      <li>
                        <a
                          onClick={() =>
                            onConversationAction?.(conv.id, "delete")
                          }
                        >
                          Delete
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => onConversationAction?.(conv.id, "pin")}
                        >
                          Pin
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() =>
                            onConversationAction?.(conv.id, "settings")
                          }
                        >
                          Settings
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-4 flex justify-between items-center gap-3">
        <select
          className="select select-bordered select-md"
          onChange={(e) => onSelectModel?.(e.target.value)}
        >
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
        <motion.button
          className="btn btn-ghost btn-circle"
          onClick={onSettings}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FiSettings className="h-5 w-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
