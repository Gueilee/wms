import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CopilotWidget } from "@/components/copilot/CopilotWidget";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>
      <CopilotWidget />
    </div>
  );
}
