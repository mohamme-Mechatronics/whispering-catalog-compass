// The single admin account; password resets are sent to this address.
export const ADMIN_EMAIL = "mohammedqumash3@gmail.com";

export function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name.slice(0, 3)}***@${domain}`;
}
