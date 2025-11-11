import { ArrowLeft, Menu } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

interface HeaderProps {
  title: string;
  home?: boolean;
}

export async function Header({ title, home }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!home && (
            <Link href="/wallet">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
          )}
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        </div>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
}
