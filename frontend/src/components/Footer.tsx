import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight">Squad Navigator</span>
        </div>
        <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          <Link href="/squads" className="hover:text-foreground transition-colors">Discover Squads</Link>
          <Link href="/squads/create" className="hover:text-foreground transition-colors">Create Squad</Link>
          <Link href="/profile/me" className="hover:text-foreground transition-colors">My Profile</Link>
        </nav>
        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Squad Navigator
        </div>
      </div>
    </footer>
  );
}

