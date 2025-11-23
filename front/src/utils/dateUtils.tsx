/**
 * Convertit un objet Date en "YYYYMM" (nombre)
 * Exemple : new Date("2023-12-01") → 202312
 */
export function dateToYYYYMM(date: Date): number {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return Number(`${year}${month}`);
}

/**
 * Convertit un entier YYYYMM en chaîne "YYYY MM"
 * Exemple : 202312 → "2023 12"
 */
export function YYYYMMtoYYYY_MM(value: number): string {
  // Vérifie que value est un nombre entier
  if (!Number.isInteger(value)) {
    throw new Error(`Type invalide: attendu un entier YYYYMM, reçu: ${value}`);
  }

  const str = String(value);

  // Longueur exacte
  if (str.length !== 6) {
    throw new Error(`Format invalide: "${value}" (attendu YYYYMM à 6 chiffres)`);
  }

  const yearStr = str.slice(0, 4);
  const monthStr = str.slice(4, 6);

  // Année: 4 chiffres
  if (!/^\d{4}$/.test(yearStr)) {
    throw new Error(`Année invalide: "${yearStr}"`);
  }

  // Mois: 01–12
  const monthNum = Number(monthStr);
  if (monthNum < 1 || monthNum > 12) {
    throw new Error(`Mois invalide: "${monthStr}"`);
  }

  return `${yearStr} ${monthStr}`;
}


/**
 * Convertit "YYYY MM" en entier YYYYMM
 * Exemple : "2023 12" → 202312
 */
export function YYYY_MMtoYYYYMM(value: string): number {
  const [yearRaw, monthRaw] = value.trim().split(" ");

  // Vérification que l'année est bien 4 chiffres
  if (!/^\d{4}$/.test(yearRaw)) {
    throw new Error(`Année invalide: "${yearRaw}"`);
  }

  // Vérification que le mois est bien 2 chiffres
  if (!/^\d{2}$/.test(monthRaw)) {
    throw new Error(`Mois invalide (format "MM" attendu): "${monthRaw}"`);
  }

  const year = Number(yearRaw);
  const month = Number(monthRaw);

  if (month < 1 || month > 12) {
    throw new Error(`Mois invalide: "${monthRaw}"`);
  }

  return year * 100 + month;
}

/**
 * Génère la liste des mois entre deux bornes incluses, au format YYYYMM
 * Exemple : rangeYYYYMM(202308, 202401) → [202308, 202309, 202310, 202311, 202312, 202401]
 */
export function rangeYYYYMM(start: number, end: number): number[] {
  const result: number[] = [];

  // Vérification format
  const checkYYYYMM = (val: number) => {
    const str = String(val);
    if (str.length !== 6) throw new Error(`Format invalide: ${val}`);
    const year = Number(str.slice(0, 4));
    const month = Number(str.slice(4, 6));
    if (month < 1 || month > 12) throw new Error(`Mois invalide: ${val}`);
    return { year, month };
  };

  const { year: startYear, month: startMonth } = checkYYYYMM(start);
  const { year: endYear, month: endMonth } = checkYYYYMM(end);

  // Construire une date de départ et de fin
  let current = new Date(startYear, startMonth - 1, 1);
  const last = new Date(endYear, endMonth - 1, 1);

  while (current <= last) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, "0");
    result.push(Number(`${y}${m}`));
    current.setMonth(current.getMonth() + 1);
  }

  return result;
}

/**
 * Convertit une chaîne "YYYY MM" en objet Date (premier jour du mois)
 * Exemple : "2023 12" → new Date(2023, 11, 1)
 */
export function YYYY_MMtoDate(value: string): Date {
  const [yearStr, monthStr] = value.trim().split(" ");

  if (!/^\d{4}$/.test(yearStr)) {
    throw new Error(`Année invalide: "${yearStr}"`);
  }
  if (!/^\d{2}$/.test(monthStr)) {
    throw new Error(`Mois invalide: "${monthStr}"`);
  }

  const year = Number(yearStr);
  const month = Number(monthStr);

  if (month < 1 || month > 12) {
    throw new Error(`Mois invalide: "${monthStr}"`);
  }

  // JS: mois 0–11 → donc month - 1
  return new Date(year, month - 1, 1);
}


/**
 * Convertit un entier YYYYMM en objet Date (premier jour du mois)
 * Exemple : 202308 → new Date(2023, 7, 1)
 */
export function YYYYMMtoDate(value: number): Date {
  const str = String(value);

  if (str.length !== 6) {
    throw new Error(`Format invalide: ${value}`);
  }

  const year = Number(str.slice(0, 4));
  const month = Number(str.slice(4, 6));

  if (month < 1 || month > 12) {
    throw new Error(`Mois invalide: ${month}`);
  }

  return new Date(year, month - 1, 1);
}

