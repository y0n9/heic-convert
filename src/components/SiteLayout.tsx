import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ArrowUpRight, Image as ImageIcon, LockKeyhole, Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

const navigation = [
  { to: "/", label: "HEIC to JPG", end: true },
  { to: "/heic-to-png", label: "HEIC to PNG", end: false },
  { to: "/heic-to-webp", label: "HEIC to WebP", end: false },
  { to: "/heic-vs-jpg", label: "HEIC vs JPG", end: false },
  { to: "/iphone-heic-to-jpg", label: "iPhone guide", end: false },
  { to: "/how-to-open-heic-on-windows", label: "Windows guide", end: false },
  { to: "/how-to-convert-heic-on-mac", label: "Mac guide", end: false },
];

function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link to="/" className="brand" aria-label="heicconvert home" onClick={onNavigate}>
      <span className="brand-mark"><ImageIcon size={20} strokeWidth={2.2} /><span>↗</span></span>
      <span className="brand-name">heic<span>convert</span></span>
    </Link>
  );
}

function useCurrentYear() {
  const [year, setYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    const syncYear = () => setYear(new Date().getFullYear());
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") syncYear();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", syncYear);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", syncYear);
    };
  }, []);

  return year;
}

export default function SiteLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentYear = useCurrentYear();

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="header-inner">
          <Brand onNavigate={() => setMenuOpen(false)} />
          <nav className="desktop-nav" aria-label="Main navigation">
            {navigation.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? "active" : "")}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="header-private"><LockKeyhole size={14} /> Private by design</div>
          <button className="mobile-menu-button" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Toggle navigation">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMenuOpen(false)} className={({ isActive }) => (isActive ? "active" : "")}>
                {item.label}<ArrowUpRight size={16} />
              </NavLink>
            ))}
          </nav>
        )}
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand-column">
            <Brand />
            <p>A quiet, private place to convert your iPhone photos. No accounts, no uploads, no watermarks.</p>
            <span><LockKeyhole size={14} /> Your photos never leave your browser.</span>
          </div>
          <div className="footer-links">
            <div>
              <strong>Converters</strong>
              <Link to="/">HEIC to JPG</Link>
              <Link to="/heic-to-png">HEIC to PNG</Link>
              <Link to="/heic-to-webp">HEIC to WebP</Link>
            </div>
            <div>
              <strong>Learn</strong>
              <Link to="/iphone-heic-to-jpg">iPhone HEIC to JPG</Link>
              <Link to="/heic-vs-jpg">HEIC vs JPG</Link>
              <Link to="/how-to-open-heic-on-windows">Open HEIC on Windows</Link>
              <Link to="/how-to-convert-heic-on-mac">Convert HEIC on Mac</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {currentYear} heicconvert</span>
          <span>Local processing · No registration · Free to use</span>
        </div>
      </footer>
    </div>
  );
}
