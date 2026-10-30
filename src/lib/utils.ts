import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function encodeGuestName(name: string) {
  const bytes = new TextEncoder().encode(name.trim())
  return btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(""))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

export function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
}

export function decodeGuestName(value: string) {
  try {
    const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"))
    const bytes = Uint8Array.from(binary, character => character.charCodeAt(0))
    const name = new TextDecoder("utf-8", { fatal: true }).decode(bytes)
    return /[\u0000-\u001f\u007f]/.test(name) ? value : name
  } catch {
    return value
  }
}
