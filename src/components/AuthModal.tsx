import type { FormEvent } from 'react';

type AuthModalProps = {
  authMode: 'login' | 'signup';
  authMessage: string;
  supabaseConfigured: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleMode: () => void;
};

export function AuthModal({ authMode, authMessage, supabaseConfigured, onClose, onSubmit, onToggleMode }: AuthModalProps) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="modal-close" onClick={onClose} aria-label="Tutup formulir masuk">×</button>
        <p className="eyebrow">{supabaseConfigured ? 'AKUN KAMPUS UNGGUL' : 'MODE DEMO'}</p>
        <h2 id="auth-title">{authMode === 'login' ? 'Selamat datang kembali' : 'Buat akun belajar'}</h2>
        <p>{supabaseConfigured ? 'Masuk untuk menyimpan kursus dan profilmu.' : 'Gunakan akun demo untuk mencoba dashboard dan pendaftaran.'}</p>
        {!supabaseConfigured && <div className="demo-credentials"><span>Username</span><strong>student</strong><span>Password</span><strong>kampus123</strong></div>}
        <form onSubmit={onSubmit}>
          <label>{supabaseConfigured ? 'Email' : 'Email atau username'}<input name="email" type={supabaseConfigured ? 'email' : 'text'} placeholder={supabaseConfigured ? 'nama@email.com' : 'student'} autoComplete="username" required /></label>
          {authMode === 'signup' && <label>Nama lengkap<input name="fullName" autoComplete="name" required /></label>}
          <label>Password<input name="password" type="password" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} minLength={6} required /></label>
          {authMessage && <p className="form-message" role="alert">{authMessage}</p>}
          <button className="button button-primary button-wide" type="submit">{authMode === 'login' ? 'Masuk' : 'Daftar'}</button>
        </form>
        {supabaseConfigured && <button className="text-button auth-toggle" onClick={onToggleMode}>{authMode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}</button>}
      </section>
    </div>
  );
}
