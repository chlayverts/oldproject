import { navigationGroups, type Page } from '../app/navigation';

type AppHeaderProps = {
  page: Page;
  authenticated: boolean;
  name: string;
  supabaseConfigured: boolean;
  onNavigate: (page: Page) => void;
  onOpenLogin: () => void;
  onLogout: () => void;
};

export function AppHeader({ page, authenticated, name, supabaseConfigured, onNavigate, onOpenLogin, onLogout }: AppHeaderProps) {
  return (
    <header className="site-header">
      <button className="brand" onClick={() => onNavigate('home')} aria-label="Kampus Unggul beranda">
        <span className="brand-mark">K</span>
        <span>Kampus<span className="brand-light">Unggul</span><small>RUANG BELAJAR DIGITAL</small></span>
      </button>
      <nav className="main-nav" aria-label="Navigasi utama">
        {navigationGroups.map(group => (
          <div className="nav-group" role="group" aria-label={group.label} key={group.label}>
            <span className="nav-group-label">{group.label}</span>
            <div className="nav-group-links">
              {group.items.map(item => (
                <button key={item.id} className={page === item.id ? 'nav-link active' : 'nav-link'} aria-current={page === item.id ? 'page' : undefined} onClick={() => onNavigate(item.id)}>{item.label}</button>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="header-actions">
        <span className={supabaseConfigured ? 'environment-badge' : 'environment-badge demo'}>{supabaseConfigured ? 'Supabase' : 'Mode demo'}</span>
        {authenticated ? <>
          <button className="user-chip" onClick={() => onNavigate('profile')} aria-label={'Profil ' + name}>
            <span className="avatar">{name.slice(0, 1).toUpperCase()}</span><span>{name}</span>
          </button>
          <button className="button button-small button-outline" onClick={onLogout}>Keluar</button>
        </> : <button className="button button-small button-primary" aria-label="Masuk Demo" onClick={onOpenLogin}>Masuk</button>}
      </div>
    </header>
  );
}
