import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names using clsx and merges tailwind classes using tailwind-merge.
 * 
 * @param inputs - An array of class names or class value objects.
 * @returns A merged string of tailwind class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
