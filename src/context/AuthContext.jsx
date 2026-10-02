import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth as useClerkAuth, useUser, useClerk } from "@clerk/react";
import { supabase, setClerkTokenGetter } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { isLoaded: authLoaded, isSignedIn, userId, getToken } = useClerkAuth();
  const { user } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  // Point the shared Supabase client at Clerk's session token so RLS
  // (auth.jwt() ->> 'sub') can see who's signed in.
  useEffect(() => {
    setClerkTokenGetter(() => getToken());
  }, [getToken]);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      return;
    }
    setProfileError(null);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
      return;
    }
    if (error) console.error("[AuthContext] profiles select failed:", error);

    // First sign-in for a self-registered Warga or Pelaku Usaha:
    // create their profile row from Clerk metadata.
    const meta = user?.unsafeMetadata;
    if (meta?.role === "pelaku_usaha" || meta?.role === "warga") {
      const { data: created, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          role: meta.role,
          full_name:
            meta.full_name ||
            user?.fullName ||
            user?.primaryEmailAddress?.emailAddress ||
            (meta.role === "pelaku_usaha" ? "Pelaku Usaha" : "Warga"),
          phone: meta.phone || null,
          address: meta.address || null,
        })
        .select()
        .single();
      if (!insertError) {
        // Email/password registration already collects business information.
        // Google OAuth does not, so its business profile will be completed
        // through the onboarding screen after authentication.
        if (meta.role === "pelaku_usaha" && meta.nama_usaha && meta.jenis_usaha) {
          const { error: businessError } = await supabase
            .from("pelaku_usaha")
            .insert({
              profile_id: userId,
              nama_usaha: meta.nama_usaha,
              jenis_usaha: meta.jenis_usaha,
              alamat: meta.address || null,
              wilayah: null,
            });

          if (businessError) {
            console.error(
              "[AuthContext] pelaku_usaha insert failed:",
              businessError
            );
            setProfileError(businessError.message);
            return;
          }
        }

        setProfile(created);
        return;
      }
      console.error("[AuthContext] profiles insert failed:", insertError);
      setProfileError(insertError.message);
    } else if (error) {
      setProfileError(error.message);
    }

    setProfile(null);
  }, [userId, user]);

  useEffect(() => {
    let active = true;
    if (!authLoaded) return;

    (async () => {
      if (isSignedIn) {
        await loadProfile();
      } else {
        setProfile(null);
      }
      if (active) setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [authLoaded, isSignedIn, loadProfile]);

  const signOut = useCallback(async () => {
    await clerkSignOut();
  }, [clerkSignOut]);

  const value = {
    session: isSignedIn ? { user: { id: userId } } : null,
    profile,
    profileError,
    role: profile?.role ?? null,
    loading: !authLoaded || loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
