// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Maps currency code to a sensible display locale. Extend as you add countries.
const CURRENCY_LOCALES: Record<string, string> = {
  NGN: "en-NG",
  USD: "en-US",
  GBP: "en-GB",
  GHS: "en-GH",
  KES: "en-KE",
  ZAR: "en-ZA",
};

function localeForCurrency(currencyCode: string): string {
  return CURRENCY_LOCALES[currencyCode] ?? "en-US";
}

// Most currencies store minor units (kobo, cents) at 2 decimal places,
// but not all (e.g. JPY has 0). Ask Intl rather than hardcoding /100 everywhere.
function minorUnitDigits(currencyCode: string): number {
  try {
    return (
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
      }).resolvedOptions().maximumFractionDigits ?? 2
    );
  } catch {
    return 2;
  }
}

/**
 * Format an amount stored in minor units (kobo, cents, etc.) as a
 * locale-appropriate currency string. Defaults to NGN for back-compat.
 */
export function formatCurrency(
  minorUnits: number,
  currencyCode: string = "NGN",
): string {
  const digits = minorUnitDigits(currencyCode);
  const divisor = Math.pow(10, digits);
  const locale = localeForCurrency(currencyCode);

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: digits,
    }).format((minorUnits ?? 0) / divisor);
  } catch {
    // Unknown/invalid currency code — fall back rather than crash the UI
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format((minorUnits ?? 0) / 100);
  }
}

/** @deprecated Use formatCurrency(value, "NGN") — kept for any call sites not yet migrated. */
export function formatNaira(kobo: number): string {
  return formatCurrency(kobo, "NGN");
}

export function formatDate(iso: string, currencyCode?: string): string {
  const locale = currencyCode ? localeForCurrency(currencyCode) : "en-NG";
  try {
    return new Date(iso).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/**
 * Truncates a string to a specified length and appends an ellipsis if it exceeds that length.
 */
export function truncate(str: string, maxLength: number): string {
  if (!str) return "";
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
}
