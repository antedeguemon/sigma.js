/**
 * Sigma.js Utils
 * ===============
 *
 * Various helper functions & classes used throughout the library.
 */

/**
 * Returns a type similar to T, but with the the K set of properties of the type
 * T optional.
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Returns a type similar to T, but with the the K set of properties of the type
 * T *required*, and the rest optional.
 */
export type PartialButFor<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

/**
 * Checks whether the given value is a plain object.
 *
 * @param  {mixed}   value - Target value.
 * @return {boolean}
 */
export function isPlainObject(value: any): boolean {
  return typeof value === "object" && value !== null && value.constructor === Object;
}

/**
 * Very simple recursive Object.assign-like function.
 *
 * @param  {object} target       - First object.
 * @param  {object} [...objects] - Objects to merge.
 * @return {object}
 */
export function assign<T>(target: any, ...objects: Array<any>): T {
  target = target || {};

  for (let i = 0, l = objects.length; i < l; i++) {
    const o = objects[i];

    if (!o) continue;

    for (const k in o) {
      if (isPlainObject(o[k])) {
        target[k] = assign(target[k], o[k]);
      } else {
        target[k] = o[k];
      }
    }
  }

  return target as T;
}