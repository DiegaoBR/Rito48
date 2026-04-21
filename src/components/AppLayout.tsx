import { NavLink } from "@/components/NavLink";
import { LayoutDashboard, Package, Upload, Settings } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/offers", icon: Package, label: "Ofertas" },
  { to: "/import", icon: Upload, label: "Importar CSV" },
  { to: "/settings", icon: Settings, label: "Configurações" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center h-16 px-4 gap-6">
          <h1 className="text-xl font-bold text-primary">🛒 Shopee Ofertas</h1>
          <nav className="flex gap-1 ml-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                activeClassName="bg-accent text-accent-foreground"
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto p-4">{children}</main>
    </div>
  );
}
