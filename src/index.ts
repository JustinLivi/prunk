import { Dictionary, fromPairs, map, mapValues, toPairs } from 'lodash';
import { isArray } from 'util';

/**
 * A function that accepts props and returns a result or a promise that resolves with the result
 */
export type PrunkFunc<Props, Result> = (
  props: Props
) => Result | Promise<Result>;

/**
 * A map of Prunks
 */
export interface PrunkMap<Props, MapType, Key extends keyof MapType>
  extends Map<Key, Prunk<Props, MapType[Key]>> {}

/**
 * The main Prunk type
 * A Prunk is defined as the intersection of the following:
 * a Result
 * a function which accepts Props and returns a Result
 * a function which accepts Props and returns a Promise which resolves with a Result
 * a Promise which resolves with a Result
 * a Map of keys and Prunks
 */
export type Prunk<Props, Result> =
  | PrunkFunc<Props, Result>
  | Promise<Result>
  | PrunkMap<Props, Result, keyof Result>
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
 * Returns a function which can be used to evaluate prunks
 * @param props The properties to pass to prunkFuncs
 */
export const unprunkWithProps = <Props>(props: Props) =>
  /**
   * Evaluate a prunk based on the enclosed props
   * @param prunk The prunk to evaluate
   */
  async <Result>(prunk: Prunk<Props, Result>): Promise<Result> => {
    try {
      const value =
        typeof prunk === 'function'
          ? await (prunk as PrunkFunc<Props, Result>)(props)
          : typeof prunk === 'object' && prunk instanceof Promise
          ? await prunk
          : prunk;
      const unprunk = unprunkWithProps(props);
      return isArray(value)
        ? (Promise.all(map(value, unprunk)) as any)
        : ((typeof value === 'object'
            ? awaitMap(mapValues(value as any, unprunk))
            : value) as Promise<Result>);
    } catch (error) {
      throw error;
    }
  };

export default unprunkWithProps;
