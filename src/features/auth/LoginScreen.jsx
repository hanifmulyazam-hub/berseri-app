import { useState } from "react";
import { useSignIn, useSignUp } from "@clerk/react";
import { useSignUp as useLegacySignUp } from "@clerk/react/legacy";
import { Sparkles, Mail, KeyRound, ArrowRight, User, Phone, MapPin } from "lucide-react";

export function LoginScreen() {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();

  // Google OAuth uses Clerk's legacy authenticateWithRedirect flow.
  // The OAuth callback is handled separately at /sso-callback.
  const { signUp: legacySignUp } = useLegacySignUp();

  const [mode, setMode] = useState("login"); // login | daftar | verify | lupa | lupa-reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const friendlyError = (err) =>
    err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || "Terjadi kesalahan, coba lagi.";

  const submitLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: err } = await signIn.password({ identifier: email, password });
    if (err) {
      setError(friendlyError(err));
    } else if (signIn.status === "complete") {
      await signIn.finalize();
    } else {
      setError("Login belum selesai, coba lagi.");
    }
    setSubmitting(false);
  };

  const submitPelakuUsahaRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: err } = await signUp.password({
      emailAddress: email,
      password,
      unsafeMetadata: {
        role: "pelaku_usaha",
        full_name: fullName,
        phone,
        address,
        nama_usaha: businessName,
        jenis_usaha: businessType,
      },
    });
    if (err) {
      setError(friendlyError(err));
      setSubmitting(false);
      return;
    }
    const { error: codeErr } = await signUp.verifications.sendEmailCode();
    if (codeErr) {
      setError(friendlyError(codeErr));
      setSubmitting(false);
      return;
    }
    setMode("verify");
    setSubmitting(false);
  };

  const submitVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: err } = await signUp.verifications.verifyEmailCode({ code });
    if (err) {
      setError(friendlyError(err));
    } else if (signUp.status === "complete") {
      await signUp.finalize();
    } else {
      setError("Kode belum sesuai, coba lagi.");
    }
    setSubmitting(false);
  };

  const submitLupaPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: err } = await signIn.create({ identifier: email });
    if (err) {
      setError(friendlyError(err));
      setSubmitting(false);
      return;
    }
    const { error: codeErr } = await signIn.resetPasswordEmailCode.sendCode();
    if (codeErr) {
      setError(friendlyError(codeErr));
      setSubmitting(false);
      return;
    }
    setMode("lupa-reset");
    setSubmitting(false);
  };

  const submitLupaReset = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: verifyErr } = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (verifyErr) {
      setError(friendlyError(verifyErr));
      setSubmitting(false);
      return;
    }
    const { error: submitErr } = await signIn.resetPasswordEmailCode.submitPassword({ password: newPassword });
    if (submitErr) {
      setError(friendlyError(submitErr));
      setSubmitting(false);
      return;
    }
    if (signIn.status === "complete") {
      await signIn.finalize();
    }
    setSubmitting(false);
  };

  const continueWithGoogle = async () => {
    setError("");
    setSubmitting(true);
    try {
      // Always go through signUp (even from the "Masuk" tab): Clerk
      // transparently treats it as a sign-in if the Google account already
      // has a user, and only signUp lets us attach unsafeMetadata — needed
      // so a brand-new Google account gets created as "warga" (Google is
      // only ever a self-service Warga entry point here, same as the
      // email/password registration form). <AuthenticateWithRedirectCallback/>
      // /sso-callback finishes activating the session once Google sends us back.
      await legacySignUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: window.location.origin,
        unsafeMetadata: {
          role: "pelaku_usaha",
        },
      });
    } catch (err) {
      setError(friendlyError(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper font-body ink flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl login-shell rounded-3xl overflow-hidden shadow-lift border border-line bg-surface">
        {/* Brand panel */}
        <div className="radiance login-brand p-9 text-white relative overflow-hidden">
          <div className="flex items-center gap-2.5 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
              <Sparkles size={17} />
            </div>
            <div>
              <p className="font-display font-bold text-lg leading-tight">BERSERI</p>
              <p className="chip opacity-80 leading-tight -mt-0.5">Bersih Sampah Setiap Hari</p>
            </div>
          </div>
          <div className="relative z-10">
            <h2 className="font-display text-3xl font-bold leading-snug mb-3">
              Satu platform,<br />semua peran pengelolaan sampah.
            </h2>
            <p className="text-sm opacity-90 max-w-xs leading-relaxed">
              Sampah dijemput, ditabung, jadi bernilai — semua dalam satu genggaman.
            </p>
          </div>
          <div className="chip opacity-70 relative z-10">Dinas Lingkungan Hidup · Platform Resmi</div>
        </div>

        {/* Form panel */}
        <div className="p-7 md:p-9 login-form">
          <div className="md:hidden flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl radiance flex items-center justify-center shrink-0">
              <Sparkles size={17} className="text-white" />
            </div>
            <p className="font-display font-bold text-lg">BERSERI</p>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <div className="spectrum-underline spectrum" />
            <span className="chip text-primary uppercase font-semibold">Masuk ke BERSERI</span>
          </div>
          <h1 className="font-display text-xl font-bold ink mb-2">
            {mode === "login" && "Masuk ke akun Anda"}
            {mode === "daftar" && "Buat akun baru"}
            {mode === "verify" && "Verifikasi email"}
            {mode === "lupa" && "Lupa password?"}
            {mode === "lupa-reset" && "Buat password baru"}
          </h1>
          <p className="text-xs ink-soft mb-5">
            {mode === "login" &&
              "Masuk dengan email & password akun Anda. Peran Anda (warga, petugas, pengelola bank sampah, atau admin) terdeteksi otomatis."}
            {mode === "daftar" && "Pendaftaran akun baru untuk Warga / Pelaku Usaha."}
            {mode === "verify" && `Kami mengirim kode 6 digit ke ${email}. Masukkan kodenya di bawah ini.`}
            {mode === "lupa" && "Masukkan email akun Anda, kami kirimkan kode untuk atur ulang password."}
            {mode === "lupa-reset" && `Masukkan kode yang dikirim ke ${email}, lalu buat password baru.`}
          </p>

          {error && (
            <div className="chip bg-clay-tint text-clay px-3.5 py-2.5 rounded-xl mb-4">{error}</div>
          )}

          {(mode === "login" || mode === "daftar") && (
            <>
              <button
                type="button"
                onClick={continueWithGoogle}
                disabled={submitting}
                className="tap w-full flex items-center justify-center gap-2.5 border border-line rounded-xl py-3 font-semibold text-sm mb-4 disabled:opacity-60"
              >
                <GoogleLogo />
                Masuk dengan Google
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-line" />
                <span className="chip ink-soft">atau</span>
                <div className="h-px flex-1 bg-line" />
              </div>
            </>
          )}

          {mode === "login" && (
            <form onSubmit={submitLogin} className="space-y-4">
              <div>
                <label className="chip ink-soft uppercase block mb-2 font-semibold">Email</label>
                <div className="flex items-center border border-line rounded-xl px-4 py-3 gap-2.5">
                  <Mail size={16} className="ink-soft shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full outline-none text-sm bg-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="chip ink-soft uppercase block mb-2 font-semibold">Password</label>
                <div className="flex items-center border border-line rounded-xl px-4 py-3 gap-2.5">
                  <KeyRound size={16} className="ink-soft shrink-0" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full outline-none text-sm bg-transparent"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="tap btn-primary w-full text-white font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? "Memproses…" : "Masuk"} <ArrowRight size={16} />
              </button>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { setMode("daftar"); setError(""); }}
                  className="tap chip text-primary font-semibold"
                >
                  Belum punya akun? Daftar
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("lupa"); setError(""); }}
                  className="tap chip ink-soft font-semibold"
                >
                  Lupa password?
                </button>
              </div>
            </form>
          )}

          {mode === "lupa" && (
            <form onSubmit={submitLupaPassword} className="space-y-4">
              <div>
                <label className="chip ink-soft uppercase block mb-2 font-semibold">Email</label>
                <div className="flex items-center border border-line rounded-xl px-4 py-3 gap-2.5">
                  <Mail size={16} className="ink-soft shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full outline-none text-sm bg-transparent"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="tap btn-primary w-full text-white font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? "Mengirim kode…" : "Kirim Kode"} <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); }}
                className="tap chip text-primary font-semibold w-full text-center"
              >
                Kembali ke Masuk
              </button>
            </form>
          )}

          {mode === "lupa-reset" && (
            <form onSubmit={submitLupaReset} className="space-y-4">
              <div>
                <label className="chip ink-soft uppercase block mb-2 font-semibold">Kode Verifikasi</label>
                <div className="flex items-center border border-line rounded-xl px-4 py-3 gap-2.5">
                  <KeyRound size={16} className="ink-soft shrink-0" />
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    className="w-full outline-none text-sm bg-transparent tracking-widest"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="chip ink-soft uppercase block mb-2 font-semibold">Password Baru</label>
                <div className="flex items-center border border-line rounded-xl px-4 py-3 gap-2.5">
                  <KeyRound size={16} className="ink-soft shrink-0" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    placeholder="••••••••"
                    className="w-full outline-none text-sm bg-transparent"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="tap btn-primary w-full text-white font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? "Memproses…" : "Ganti Password & Masuk"} <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => { setMode("lupa"); setError(""); }}
                className="tap chip text-primary font-semibold w-full text-center"
              >
                Kembali
              </button>
            </form>
          )}

          {mode === "daftar" && (
            <form onSubmit={submitPelakuUsahaRegister} className="space-y-4">
              <div>
                <label className="chip ink-soft uppercase block mb-2 font-semibold">Nama Lengkap</label>
                <div className="flex items-center border border-line rounded-xl px-4 py-3 gap-2.5">
                  <User size={16} className="ink-soft shrink-0" />
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full outline-none text-sm bg-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="chip ink-soft uppercase block mb-2 font-semibold">
                  Nama Usaha / Instansi
                </label>
                <div className="flex items-center border border-line rounded-xl px-4 py-3 gap-2.5">
                  <input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Contoh: PT Maju Bersama"
                    className="w-full outline-none text-sm bg-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="chip ink-soft uppercase block mb-2 font-semibold">
                  Jenis Pelaku Usaha
                </label>
                <div className="flex items-center border border-line rounded-xl px-4 py-3 gap-2.5">
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full outline-none text-sm bg-transparent"
                    required
                  >
                    <option value="">Pilih jenis usaha</option>
                    <option value="BUMDes">BUMDes</option>
                    <option value="PT">PT / Perusahaan</option>
                    <option value="Sekolah">Sekolah</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Perkantoran">Perkantoran</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="chip ink-soft uppercase block mb-2 font-semibold">Email</label>
                <div className="flex items-center border border-line rounded-xl px-4 py-3 gap-2.5">
                  <Mail size={16} className="ink-soft shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full outline-none text-sm bg-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="chip ink-soft uppercase block mb-2 font-semibold">Nomor HP</label>
                <div className="flex items-center border border-line rounded-xl px-4 py-3 gap-2.5">
                  <Phone size={16} className="ink-soft shrink-0" />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xx-xxxx-xxxx"
                    className="w-full outline-none text-sm bg-transparent font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="chip ink-soft uppercase block mb-2 font-semibold">Alamat</label>
                <div className="flex items-center border border-line rounded-xl px-4 py-3 gap-2.5">
                  <MapPin size={16} className="ink-soft shrink-0" />
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full outline-none text-sm bg-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="chip ink-soft uppercase block mb-2 font-semibold">Password</label>
                <div className="flex items-center border border-line rounded-xl px-4 py-3 gap-2.5">
                  <KeyRound size={16} className="ink-soft shrink-0" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    className="w-full outline-none text-sm bg-transparent"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="tap btn-primary w-full text-white font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? "Memproses…" : "Daftar"} <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); }}
                className="tap chip text-primary font-semibold w-full text-center"
              >
                Sudah punya akun? Masuk
              </button>
            </form>
          )}

          {mode === "verify" && (
            <form onSubmit={submitVerify} className="space-y-4">
              <div>
                <label className="chip ink-soft uppercase block mb-2 font-semibold">Kode Verifikasi</label>
                <div className="flex items-center border border-line rounded-xl px-4 py-3 gap-2.5">
                  <KeyRound size={16} className="ink-soft shrink-0" />
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    className="w-full outline-none text-sm bg-transparent tracking-widest"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="tap btn-primary w-full text-white font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? "Memverifikasi…" : "Verifikasi & Masuk"} <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => { setMode("daftar"); setError(""); }}
                className="tap chip text-primary font-semibold w-full text-center"
              >
                Kembali
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4c-7.5 0-14 4.2-17.7 10.7z" />
      <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2 14-5.4l-6.5-5.5c-2 1.5-4.6 2.4-7.5 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5c3.6 7.1 11 12.4 17.8 12.4z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C41.4 36 44 30.5 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}
