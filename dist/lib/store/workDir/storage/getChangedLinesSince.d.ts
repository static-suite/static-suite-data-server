/**
 * Get changed files between a set of dates.
 *
 * @param fromUniqueId - Unique id to search from.
 * @param toUniqueId - Unique id to search to.
 *
 * @remarks
 * It searches for lines grater than fromUniqueId and lower
 * or equal to toUniqueId, to avoid getting repeated entries
 * when dates are advanced in blocks (from 1 to 2, from 2 to 3,
 * from 3 to 4, etc).
 *
 * @returns Array of changed lines
 */
export declare const getChangedLinesBetween: (fromUniqueId: string, toUniqueId: string) => string[];
//# sourceMappingURL=getChangedLinesSince.d.ts.map