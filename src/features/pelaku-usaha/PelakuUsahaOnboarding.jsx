import { useEffect, useState } from "react";
import { Building2, MapPin, Phone, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

export function PelakuUsahaOnboarding({ children }) {
  const { profile } = useAuth();

  const [checking, setChecking] = useState(true);
  const [businessProfile, setBusinessProfile] = useState(null);

  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [address, setAddress] = useState(profile?.address || "");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkBusinessProfile() {
      if (!profile?.id) return;

      setChecking(true);

      const { data, error: queryError } = await supabase
        .from("pelaku_usaha")
        .select("*")
        .eq("profile_id", profile.id)
        .maybeSingle();

      if (queryError) {
        console.error(
          "[PelakuUsahaOnboarding] profile check failed:",
          queryError
        );
        setError(queryError.message);
      } else {
        setBusinessProfile(data);
      }

      setChecking(false);
    }

    checkBusinessProfile();
  }, [profile?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const { data, error: insertError } = await supabase
      .from("pelaku_usaha")
      .insert({
        profile_id: profile.id,
        nama_usaha: businessName.trim(),
        jenis_usaha: businessType,
        alamat: address.trim() || null,
        wilayah: null,
      })
      .select()
      .single();

    if (insertError) {
      console.error(
        "[PelakuUsahaOnboarding] pelaku_usaha insert failed:",
        insertError
      );
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({
        phone: phone.trim() || null,
        address: address.trim() || null,
      })
      .eq("id", profile.id);

    if (profileUpdateError) {
      console.error(
        "[PelakuUsahaOnboarding] profile update failed:",
        profileUpdateError
      );
    }

    setBusinessProfile(data);
    setSubmitting(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="chip ink-soft">Memeriksa profil usaha…</p>
      </div>
    );
  }

  if (businessProfile) {
    return children;
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-lg bg-surface border border-line rounded-3xl p-6 md:p-8 shadow-soft">
        <div className="mb-7">
          <div className="w-12 h-12 rounded-2xl radiance flex items-center justify-center shadow-soft mb-4">
            <Sparkles size={20} className="text-white" />
          </div>

          <p className="chip ink-soft uppercase font-semibold mb-1">
            BERSERI
          </p>

          <h1 className="font-display text-2xl font-bold tracking-tight">
            Lengkapi Profil Pelaku Usaha
          </h1>

          <p className="text-sm ink-soft mt-2">
            Lengkapi informasi usaha atau instansi sebelum menggunakan
            layanan BERSERI.
          </p>
        </div>

        {error && (
          <div className="mb-5 chip bg-clay-tint text-clay px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="chip ink-soft uppercase block mb-2 font-semibold">
              Nama Usaha / Instansi
            </label>

            <div className="flex items-center border border-line rounded-xl px-4 py-3 gap-2.5">
              <Building2 size={17} className="ink-soft shrink-0" />

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
              <Building2 size={17} className="ink-soft shrink-0" />

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
            <label className="chip ink-soft uppercase block mb-2 font-semibold">
              Nomor HP
            </label>

            <div className="flex items-center border border-line rounded-xl px-4 py-3 gap-2.5">
              <Phone size={17} className="ink-soft shrink-0" />

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full outline-none text-sm bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="chip ink-soft uppercase block mb-2 font-semibold">
              Alamat
            </label>

            <div className="flex items-start border border-line rounded-xl px-4 py-3 gap-2.5">
              <MapPin size={17} className="ink-soft shrink-0 mt-0.5" />

              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alamat usaha / instansi"
                rows={3}
                className="w-full outline-none text-sm bg-transparent resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="tap btn-primary w-full text-white font-semibold rounded-xl px-5 py-3 disabled:opacity-60"
          >
            {submitting ? "Menyimpan…" : "Simpan & Lanjutkan"}
          </button>
        </form>
      </div>
    </div>
  );
}