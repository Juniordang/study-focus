import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-12">
        <Outlet />
      </main>
    </div>
  );
}
