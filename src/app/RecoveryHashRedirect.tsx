"use client";

// Les liens de récupération envoyés depuis le dashboard Supabase (flux
// implicite) redirigent vers la Site URL racine avec les tokens en fragment :
// /#access_token=…&type=recovery. Le fragment n'atteint jamais le serveur —
// ce composant, monté sur la landing, relaie vers la page de réinitialisation
// en conservant le fragment. Les liens expirés arrivent avec #error=… : on
// les relaie aussi pour afficher un message propre.

import { useEffect } from "react";

export function RecoveryHashRedirect() {
  useEffect(() => {
    const hash = window.location.hash;
    if (/type=recovery|error_code=otp_expired/.test(hash)) {
      window.location.replace(`/auth/reinitialisation${hash}`);
    }
  }, []);
  return null;
}
