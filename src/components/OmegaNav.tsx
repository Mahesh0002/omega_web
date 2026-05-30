import { Link } from "@tanstack/react-router";
import { Github, FileDown } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/architecture", label: "Architecture" },
  { to: "/engineering", label: "Engineering Logs" },
] as const;

export function OmegaNav() {
  return (
    <header className="sticky top-0 z-50 omega-frost">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] omega-glow-cyan" />
          <span className="font-mono text-sm tracking-[0.3em] omega-text-cyan">
            PROJECT_OMEGA
          </span>
        </Link>

        <nav className="flex gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "omega-text-cyan border-[#00F0FF]/60" }}
              inactiveProps={{
                className:
                  "text-slate-400 border-transparent hover:text-[#00F0FF]/80",
              }}
              className="px-4 py-2 text-xs uppercase tracking-[0.18em] font-mono border-b-2 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-[0.18em] text-slate-400 hover:text-cyan-400 hover:bg-cyan-900/20 transition-colors"
            aria-label="GitHub"
          >
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          {/* <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-[0.18em] text-slate-400 hover:text-cyan-400 hover:bg-cyan-900/20 transition-colors"
            aria-label="Resume"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">Resume</span>
          </a> */}
        </div>
      </div>
    </header>
  );
}
