import { Dictionary } from 'lodash';
/**
 * A function that accepts props and returns a result or a promise that resolves with the result
 */
export declare type PrunkFunc<Props, Result> = (props: Props) => Result | Promise<Result>;
/**
 * A map of Prunks
 */
export interface PrunkMap<Props, MapType, Key extends keyof MapType> extends Map<Key, Prunk<Props, MapType[Key]>> {
}
/**
 * The main Prunk type
 * A Prunk is defined as the intersection of the following:
 * a Result
 * a function which accepts Props and returns a Result
 * a function which accepts Props and returns a Promise which resolves with a Result
 * a Promise which resolves with a Result
 * a Map of keys and Prunks
 */
export declare type Prunk<Props, Result> = PrunkFunc<Props, Result> | Promise<Result> | PrunkMap<Props, Result, keyof Result> | Result;
/**
 * Utility method for transforming [string, Promise<T>] to Promise<[string, T]>
 * @param tuple the key of a map with a promise
 */
export declare const fromPromiseTuple: <T>(tuple: [string, Promise<T>]) => Promise<[string, T]>;
/**
 * Utility method for transforming Dictionary<Promise<T>> to Promise<Dictionary<T>>
 * @param dictionary the dictionary of promises
 */
export declare const awaitMap: <T>(dictionary: Dictionary<Promise<T>>) => Promise<Dictionary<T>>;
/**
 * Returns a function which can be used to evaluate prunks
 * @param props The properties to pass to prunkFuncs
 */
export declare const unprunkWithProps: <Props>(props: Props) => <Result>(prunk: Prunk<Props, Result>) => Promise<Result>;
export default unprunkWithProps;
