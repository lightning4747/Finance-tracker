import { NavLink, Outlet, useLocation } from "react-router-dom"
import { LayoutDashboard, ReceiptText, Tag, RefreshCw } from "lucide-react"

export default function Layout() {
  const location = useLocation()

  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Transactions",
      path: "/transactions",
      icon: ReceiptText,
    },
    {
      name: "Tags Manager",
      path: "/tags",
      icon: Tag,
    },
    {
      name: "Sync Data",
      path: "/fetch",
      icon: RefreshCw,
    },
  ]

  // Dynamic header title mapping
  const getHeaderTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Financial Dashboard"
      case "/transactions":
        return "Transaction Records"
      case "/tags":
        return "Tags Classifier"
      case "/fetch":
        return "Account Aggregator Sync"
      default:
        return "FinTrace"
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Left Sidebar Layout */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-md flex flex-col">
        {/* Logo Branding */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent tracking-tight">
            FinTrace
          </span>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-105 ${
                        isActive
                          ? "text-violet-600 dark:text-violet-400"
                          : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                      }`}
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white font-semibold text-sm">
              FT
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Local Session</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Single User Mode</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {getHeaderTitle()}
          </h2>
          
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Local Database Connected
            </span>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
