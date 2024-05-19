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



/**
 * function help to create a date in ISO formatted and update time when we resize the event
 * @param  isoDatestring, hour,min , newDate 
 * @returns isoformatted date ex->'2024-05-01T00:00:00+05:30'
 */
function updateDateTime(isoDateString, hours, minutes, newDate) {
    console.log(isoDateString, hours, minutes)
    let date = parseISO(isoDateString);

    // Set the updated time
    let updatedDate = setHours(date, hours);
    updatedDate = setMinutes(updatedDate, minutes);
    updatedDate = setDate(updatedDate, newDate)

    // Format the updated date into ISO string
    let updatedIsoDateString = formatISO(updatedDate);

    return updatedIsoDateString;
}