import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <header className="py-6">
          <div className="flex flex-col items-center">
            {/* Title */}
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-foreground">
                Inject AI
              </h1>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-8">
              <Link href="/">
                <a className={`${location === "/" ? "text-primary" : "text-muted-foreground"} hover:text-primary transition-colors`}>
                  Home
                </a>
              </Link>
              <Link href="/market">
                <a className={`${location === "/market" ? "text-primary" : "text-muted-foreground"} hover:text-primary transition-colors`}>
                  Market
                </a>
              </Link>
              <Link href="/chat">
                <a className={`${location === "/chat" ? "text-primary" : "text-muted-foreground"} hover:text-primary transition-colors`}>
                  AI Chat
                </a>
              </Link>
              <Link href="/dashboard">
                <a className={`${location === "/dashboard" ? "text-primary" : "text-muted-foreground"} hover:text-primary transition-colors`}>
                  Dashboard
                </a>
              </Link>
            </nav>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="absolute top-6 right-4"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="py-8">{children}</main>
      </div>
    </div>
  );
}