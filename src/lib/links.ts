/**
 * Builders for the "one tap" contact links (phone, WhatsApp, Telegram).
 */

/** Keeps only digits. "+251 911 23-45 67" → "251911234567". */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** tel: link that opens the phone's dialer. */
export function phoneHref(phone: string): string {
  return `tel:+${digitsOnly(phone)}`;
}

/**
 * wa.me link that opens a WhatsApp chat with an optional prefilled message.
 * The number must be in international format (country code, no leading 0).
 */
export function whatsappHref(number: string, message?: string): string {
  const base = `https://wa.me/${digitsOnly(number)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** t.me link for a Telegram username (with or without "@"). */
export function telegramHref(username: string): string {
  return `https://t.me/${username.replace(/^@/, "")}`;
}

/** Replaces {placeholders} in a string: fill("Hi {name}", { name: "Abebe" }) → "Hi Abebe". */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}
