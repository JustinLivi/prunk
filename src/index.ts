import { Dictionary, fromPairs, map, mapValues, toPairs } from 'lodash';

/**
 * A function that accepts values and returns a result or a promise that resolves with the result
 */
export type PrunkFunc<Values, Result> = (
  values: Values
) => Result | Promise<Result>;

/**
 * A map of Prunks
 */
export interface PrunkMap<Values, MapType, Key extends keyof MapType>
  extends Map<Key, Prunk<Values, MapType[Key]>> {}

/**
 * The main Prunk type
 * A Prunk is defined as the intersection of the following:
 * a Result
 * a function which accepts Values and returns a Result
 * a function which accepts Values and returns a Promise which resolves with a Result
 * a Promise which resolves with a Result
 * a Map of keys and Prunks
 */
export type Prunk<Values, Result> =
  | PrunkFunc<Values, Result>
  | Promise<Result>
  | PrunkMap<Values, Result, keyof Result>
  | Result;

/**
 * A function that accepts values and returns a result or a promise that resolves with the result
 */
export type PrunkFuncSync<Values, Result> = (
  values: Values
) => Result | Promise<Result>;

/**
 * A map of Prunks
 */
export interface PrunkMapSync<Values, MapType, Key extends keyof MapType>
  extends Map<Key, PrunkSync<Values, MapType[Key]>> {}

/**
 * The main Prunk type
 * A Prunk is defined as the intersection of the following:
 * a Result
 * a function which accepts Values and returns a Result
 * a function which accepts Values and returns a Promise which resolves with a Result
 * a Promise which resolves with a Result
 * a Map of keys and Prunks
 */
export type PrunkSync<Values, Result> =
  | PrunkFuncSync<Values, Result>
  | PrunkMapSync<Values, Result, keyof Result>
  | Result;

/**
 * Utility method for transforming [string, Promise<T>] to Promise<[string, T]>
 * @param tuple the key of a map with a promise
 */
export const fromPromiseTuple: <T>(
  tuple: [string, Promise<T>]
) => Promise<[string, T]> = async ([key, promise]) => [key, await promise];

/**
 * Utility method for transforming Dictionary<Promise<T>> to Promise<Dictionary<T>>
 * @param dictionary the dictionary of promises
 */
export const awaitMap = async <T>(
  dictionary: Dictionary<Promise<T>>
): Promise<Dictionary<T>> => {
  const pairs = await Promise.all(map(toPairs(dictionary), fromPromiseTuple));
  return fromPairs(pairs);
};

/**
 * Evaluate a prunk based on the enclosed values
 * @param values The values to pass to prunkFuncs
 * @param prunk The prunk to evaluate
 */
export const unprunk = async <Values, Result>(
  values: Values,
  prunk: Prunk<Values, Result>
): Promise<Result> => {
  try {
    const value =
      typeof prunk === 'function'
        ? await (prunk as PrunkFunc<Values, Result>)(values)
        : typeof prunk === 'object' && prunk instanceof Promise
        ? await prunk
        : prunk;
    const unprunkValues = unprunkWithValues(values);
    return Array.isArray(value)
      ? (Promise.all(map(value, unprunkValues)) as any)
      : ((typeof value === 'object'
          ? awaitMap(mapValues(value as any, unprunkValues))
          : value) as Promise<Result>);
  } catch (error) {
    throw error;
  }
};

/**
 * Returns a function which can be used to evaluate prunks
 * @param values The values to pass to prunkFuncs
 */
export const unprunkWithValues = <Values>(values: Values) =>
  /**
   * Evaluate a prunk based on the enclosed values
   * @param prunk The prunk to evaluate
   */
  <Result>(prunk: Prunk<Values, Result>): Promise<Result> =>
    unprunk(values, prunk);

/**
 * Evaluate a prunk based on the enclosed values
 * @param values The values to pass to prunkFuncs
 * @param prunk The prunk to evaluate
 */
export const unprunkSync = <Values, Result>(
  values: Values,
  prunk: Prunk<Values, Result>
): Result => {
  const value =
    typeof prunk === 'function'
      ? (prunk as PrunkFunc<Values, Result>)(values)
      : prunk;
  const unprunkValues = unprunkWithValuesSync(values);
  return Array.isArray(value)
    ? (map(value, unprunkValues) as any)
    : ((typeof value === 'object'
        ? mapValues(value as any, unprunkValues)
        : value) as Result);
};

/**
 * Returns a function which can be used to evaluate prunks
 * @param values The values to pass to prunkFuncs
 */
export const unprunkWithValuesSync = <Values>(values: Values) =>
  /**
   * Evaluate a prunk based on the enclosed values
   * @param prunk The prunk to evaluate
   */
  <Result>(prunk: Prunk<Values, Result>): Result => unprunkSync(values, prunk);
