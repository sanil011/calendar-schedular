/**
 * @file helpers/utils.ts
 * @description Utility functions for handling CSS class names.
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names into a single string.
 * @function
 * @name cn
 * @memberof module:helpers
 * @param {...ClassValue} inputs - The class names to be combined.
 * @returns {string} - The combined class names as a string.
 * @example
 * const combinedClasses = cn('class1', 'class2', condition && 'class3');
 */
export function cn(...inputs){
    return twMerge(clsx(inputs));
}
