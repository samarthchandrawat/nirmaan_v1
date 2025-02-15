import React, { ReactNode } from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow p-6">{children}</main>
    </div>
  );
};

export default Layout;
