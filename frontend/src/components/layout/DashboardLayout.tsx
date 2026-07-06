import { Outlet, useLocation } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import PageTransition from "@/components/PageTransition"

export default function DashboardLayout() {
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}