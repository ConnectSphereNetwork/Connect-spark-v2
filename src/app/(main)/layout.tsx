// import Sidebar from "@/components/Sidebar";
// import BottomNavBar from "@/components/BottomNavBar";

import BottomNavBar from "../components/BottomNavBar";
import Sidebar from "../components/Sidebar";

export default function MainAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
     <Sidebar/>
     <BottomNavBar/>
      {/* On mobile (small screens), add padding-bottom to prevent content from being hidden by the bottom nav.
        On desktop (sm and up), add padding-left to make space for the sidebar.
      */}
      <main className="flex-1 sm:pl-16 pb-16 sm:pb-0">
        {children}
      </main>
    </div>
  );
}