// tslint:disable-next-line:no-implicit-dependencies
import 'jest-extended';

import { unprunk, unprunkSync, unprunkWithValues, unprunkWithValuesSync } from '.';

const values = {};

describe('unprunk', () => {
  it('should return a promise that resolves with the result of a prunkFunc', async () => {
    expect(await unprunk(values, () => [])).toEqual([]);
  });

  it('should pass through promises returned from prunkFunc', () => {
    const promise = new Promise<[]>(resolve => {
      resolve([]);
    });
    expect(unprunk(values, () => promise)).toEqual(promise);
  });

  it('should return a promise that resolves with the result of a non-promise', async () => {
    const promise = unprunk(values, []);
    expect(promise).toBeInstanceOf(Promise);
    expect(await promise).toEqual([]);
  });

  it('should reject on thrown errors', () => {
    expect(
      unprunk(values, () => {
        throw new Error();
      })
    ).toReject();
  });

  it('should unprunk nested prunks', async () => {
    const prunkFunc = jest.fn();
    await unprunk(values, [prunkFunc]);
    expect(prunkFunc).toBeCalledWith(values);
  });

  it('should resolve nested promises', async () => {
    expect(await unprunk(values, [Promise.resolve(true)])).toEqual([true]);
  });

  it('should resolve complex promise array structures', async () => {
    expect(
      await unprunk(values, () =>
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
      await unprunk(values, {
        value1: Promise.resolve('value1'),
        value2: Promise.resolve([
          false,
          Promise.resolve(true),
          () => Promise.resolve('value2')
        ]),
        value3: Promise.resolve({
          nested: () => Promise.resolve('value3')
        })
      })
    ).toEqual({
      value1: 'value1',
      value2: [false, true, 'value2'],
      value3: {
        nested: 'value3'
      }
    });
  });
});

describe('unprunkWithValues', () => {
  it('should return a function which can be used to unprunk standard config prunks', () => {
    expect(unprunkWithValues(values)).toBeFunction();
  });

  it('should invoke prunkFunc with values and template', () => {
    const unprunkLocal = unprunkWithValues(values);
    const prunkFunc = jest.fn();
    unprunkLocal(prunkFunc);
    expect(prunkFunc).toBeCalledWith(values);
  });

  it('should return a promise that resolves with the result of a prunkFunc', async () => {
    expect(await unprunkWithValues(values)(() => [])).toEqual([]);
  });

  it('should pass through promises returned from prunkFunc', () => {
    const promise = new Promise<[]>(resolve => {
      resolve([]);
    });
    expect(unprunkWithValues(values)(() => promise)).toEqual(promise);
  });

  it('should return a promise that resolves with the result of a non-promise', async () => {
    const promise = unprunkWithValues(values)([]);
    expect(promise).toBeInstanceOf(Promise);
    expect(await promise).toEqual([]);
  });

  it('should reject on thrown errors', () => {
    expect(
      unprunkWithValues(values)(() => {
        throw new Error();
      })
    ).toReject();
  });

  it('should unprunk nested prunks', () => {
    const unprunkLocal = unprunkWithValues(values);
    const prunkFunc = jest.fn();
    unprunkLocal([prunkFunc]);
    expect(prunkFunc).toBeCalledWith(values);
  });

  it('should resolve nested promises', async () => {
    expect(await unprunkWithValues(values)([Promise.resolve(true)])).toEqual([
      true
    ]);
  });

  it('should resolve complex promise array structures', async () => {
    expect(
      await unprunkWithValues(values)(() =>
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
      await unprunkWithValues(values)({
        value1: Promise.resolve('value1'),
        value2: Promise.resolve([
          false,
          Promise.resolve(true),
          () => Promise.resolve('value2')
        ]),
        value3: Promise.resolve({
          nested: () => Promise.resolve('value3')
        })
      })
    ).toEqual({
      value1: 'value1',
      value2: [false, true, 'value2'],
      value3: {
        nested: 'value3'
      }
    });
  });
});

describe('unprunkSync', () => {
  it('should return the result of a prunkFunc', () => {
    expect(unprunkSync(values, () => [])).toEqual([]);
  });

  it('should unprunk nested prunks', () => {
    const prunkFunc = jest.fn();
    unprunkSync(values, [prunkFunc]);
    expect(prunkFunc).toBeCalledWith(values);
  });

  it('should handle complex mixed map types', () => {
    const thunk = () => 'value2';
    expect(
      unprunkSync(values, {
        value1: () => 'value1',
        value2: () => [false, () => true, () => thunk],
        value3: () => ({
          nested: () => 'value3'
        })
      })
    ).toEqual({
      value1: 'value1',
      value2: [false, true, thunk],
      value3: {
        nested: 'value3'
      }
    });
  });
});

describe('unprunkWithValuesSync', () => {
  it('should return the result of a prunkFunc', () => {
    expect(unprunkWithValuesSync(values)(() => [])).toEqual([]);
  });

  it('should unprunk nested prunks', () => {
    const prunkFunc = jest.fn();
    unprunkWithValuesSync(values)([prunkFunc]);
    expect(prunkFunc).toBeCalledWith(values);
  });

  it('should handle complex mixed map types', () => {
    const thunk = () => 'value2';
    expect(
      unprunkWithValuesSync(values)({
        value1: () => 'value1',
        value2: () => [false, () => true, () => thunk],
        value3: () => ({
          nested: () => 'value3'
        })
      })
    ).toEqual({
      value1: 'value1',
      value2: [false, true, thunk],
      value3: {
        nested: 'value3'
      }
    });
  });
});
