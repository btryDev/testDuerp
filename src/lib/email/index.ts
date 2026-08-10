/**
 * Abstraction d'envoi d'email transactionnel.
 *
 * Driver par défaut en dev : `console` — logue le contenu du mail dans les
 * logs serveur (utile pour le développement et les démos locales sans avoir
 * à configurer un vrai provider).
 *
 * Pour passer en prod : implémenter un driver `resend` ou `supabase` et le
 * brancher via `EMAIL_DRIVER`. Aucune autre ligne à changer côté app.
 */

export type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export interface EmailDriver {
  send(payload: EmailPayload): Promise<void>;
}

class ConsoleEmailDriver implements EmailDriver {
  async send(payload: EmailPayload): Promise<void> {
    console.log("\n" + "─".repeat(72));
    console.log(`✉  [email:console] À : ${payload.to}`);
    console.log(`   Sujet : ${payload.subject}`);
    console.log(`   ${"─".repeat(66)}`);
    console.log(payload.text);
    console.log("─".repeat(72) + "\n");
  }
}

let _driver: EmailDriver | null = null;

export function getEmailDriver(): EmailDriver {
  if (_driver) return _driver;
  const driver = process.env.EMAIL_DRIVER ?? "console";
  if (driver === "console") {
    _driver = new ConsoleEmailDriver();
    return _driver;
  }
  throw new Error(
    `Driver email non supporté : ${driver}. Utiliser "console" ou brancher une implémentation.`,
  );
}

export async function sendMail(payload: EmailPayload): Promise<void> {
  return getEmailDriver().send(payload);
}

export function mailFrom(): string {
  return process.env.SIGNATURE_MAIL_FROM ?? "no-reply@pilote-conformite.local";
}

export function publicAppUrl(): string {
  return process.env.PUBLIC_APP_URL ?? "http://localhost:3000";
}
