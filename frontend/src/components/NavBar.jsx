import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <header className="h-14 bg-[#0a0e0b] border-b border-border flex items-center justify-between px-8 sticky top-0 z-[100]">
      <div className="font-mono text-green text-[14px] tracking-[0.1em] text-glow-green">
        &gt;_ <span className="text-muted">PIXEL</span>PUZZLE
      </div>
      <nav className="flex gap-1.5">
        <Link
          to="/"
          className="bg-transparent text-ink2 text-[13px] font-semibold px-3.5 py-1.5 rounded hover:text-green hover:bg-green-dim transition-colors"
        >
          Home
        </Link>
        <Link
          to="/leaderboard"
          className="bg-transparent text-ink2 text-[13px] font-semibold px-3.5 py-1.5 rounded hover:text-green hover:bg-green-dim transition-colors"
        >
          Leaderboard
        </Link>
      </nav>
    </header>
  );
}
