"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const Navbar = dynamic(
  () => import("../components/layouts/navbar"),
  { ssr: false }
);

const Sidebar = dynamic(
  () => import("../components/layouts/sidebar"),
  { ssr: false }
);

export default function Template({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleThemeChange = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const dummyConversations = [
    {
      id: "1",
      title: "Getting Started",
      timestamp: new Date(),
    },
    {
      id: "2",
      title: "How to use the chatbot",
      timestamp: new Date(),
    },
  ];

  return (
    <div className="flex h-screen" data-theme={theme}>
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        conversations={dummyConversations}
        onNewChat={() => console.log('New chat')}
        onSelectModel={(model) => console.log('Selected model:', model)}
        onConversationAction={(id, action) => console.log('Action:', action, 'on conversation:', id)}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Navbar 
          title="Smile Chatbot Assistant"
          onThemeChange={handleThemeChange}
          showSidebarButton={isSidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />
        <main className="flex-1 flex flex-col overflow-hidden min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
