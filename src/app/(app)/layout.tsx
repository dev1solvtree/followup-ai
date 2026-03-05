import { AppSidebar } from "@/components/shared/AppSidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <AppSidebar />
      <main className="ml-64 min-h-screen p-8">
        {children}
      </main>
    </div>
  )
}
