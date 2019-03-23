// tslint:disable-next-line:no-implicit-dependencies
import 'jest-extended';

import { unprunkWithProps } from '.';

const props = {};

describe('unprunkWithProps', () => {
  it('should return a function which can be used to unprunk standard config prunks', () => {
    expect(unprunkWithProps(props)).toBeFunction();
  });

  it('should invoke prunkFunc with props and template', () => {
    const unprunk = unprunkWithProps(props);
    const prunkFunc = jest.fn();
    unprunk(prunkFunc);
    expect(prunkFunc).toBeCalledWith(props);
  });

  it('should return a promise that resolves with the result of a prunkFunc', async () => {
    expect(await unprunkWithProps(props)(() => [])).toEqual([]);
  });

  it('should pass through promises return from prunkFunc', () => {
    const promise = new Promise<[]>(resolve => {
      resolve([]);
    });
    expect(unprunkWithProps(props)(() => promise)).toEqual(promise);
  });

  it('should return a promise that resolves with the result of a non-promise', async () => {
    const promise = unprunkWithProps(props)([]);
    expect(promise).toBeInstanceOf(Promise);
    expect(await promise).toEqual([]);
  });

  it('should reject on thrown errors', () => {
    expect(
      unprunkWithProps(props)(() => {
        throw new Error();
      })
    ).toReject();
  });

  it('should unprunk nested prunks', () => {
    const unprunk = unprunkWithProps(props);
    const prunkFunc = jest.fn();
    unprunk([prunkFunc]);
    expect(prunkFunc).toBeCalledWith(props);
  });

  it('should resolve nested promises', async () => {
    expect(await unprunkWithProps(props)([Promise.resolve(true)])).toEqual([
      true
    ]);
  });

  it('should resolve complex promise array structures', async () => {
    expect(
      await unprunkWithProps(props)(() =>
        Promise.resolve([
          false,
          Promise.resolve(true),
          () => Promise.resolve('value')
        ])
      )
    ).toEqual([false, true, 'value']);
  });

  it('should handle complex promise mixed map types', async () => {
    expect(
      await unprunkWithProps(props)({
        prop1: Promise.resolve('value1'),
        prop2: Promise.resolve([
          false,
          Promise.resolve(true),
          () => Promise.resolve('value2')
        ]),
        prop3: Promise.resolve({
          nested: () => Promise.resolve('value3')
        })
      })
    ).toEqual({
      prop1: 'value1',
      prop2: [false, true, 'value2'],
      prop3: {
        nested: 'value3'
      }
    });
  });
});
