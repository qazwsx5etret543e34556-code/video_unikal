import crypto from 'crypto';

export function generateLicenseKey(): string {
  const segments: string[] = [];
  
  for (let i = 0; i < 5; i++) {
    const segment = crypto.randomBytes(4).toString('hex').toUpperCase().substring(0, 4);
    segments.push(segment);
  }
  
  return `VIDU-${segments.join('-')}`;
}

export function validateLicenseKeyFormat(key: string): boolean {
  const pattern = /^VIDU-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/i;
  return pattern.test(key);
}

export function normalizeLicenseKey(key: string): string {
  return key.trim().toUpperCase();
}
