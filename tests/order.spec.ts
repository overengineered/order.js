import {compareUsing, nonWhitespace, prepareMatcher, searchUsing} from '../src';

describe('utils', () => {
  it('nonWhitespace splits text by white space', () => {
    expect(nonWhitespace('AB-C 12#3 .!* X_Y_Z (9:00:8)')).toEqual(['AB-C', '12#3', '.!*', 'X_Y_Z', '(9:00:8)']);
  });
});

test('Basic features', () => {
  const match = prepareMatcher('natural');

  const byRelevanceTo = compareUsing(match);
  const data = ['ab', 'bc', 'cd', 'de'];
  data.sort(byRelevanceTo('c'));

  expect(data.slice(0, 2)).toEqual(['cd', 'bc']);
  expect(data.slice(2).sort()).toEqual(['ab', 'de']);

  const items = ['ab', 'bc', 'cd', 'de'];
  const search = searchUsing(match, String);

  expect(search('c', items)).toEqual(['cd', 'bc']);
});

test('First names', function () {
  const data = [
    ...['John', 'Adam', 'Julie', 'Michael', 'Paul', 'Sarah', 'Joe', 'Robert'],
    ...['James', 'Oliver', 'Susan', 'Ben', 'Alice', 'Jan', 'George'],
  ];

  const search = searchUsing(prepareMatcher('natural'), String);
  expect(search('ja', data)).toEqual(['Jan', 'James']);
});

test('Full names', function () {
  const data = ['John Smith', 'Joe Samuel', 'Smyth Jones', 'Paul Kismet', 'Bob', 'Sarah Smart', 'Jasmine Li'];

  const search = searchUsing(prepareMatcher('natural'), String);
  expect(search('SM', data)).toEqual(['Smyth Jones', 'John Smith', 'Sarah Smart', 'Jasmine Li', 'Paul Kismet']);
});

test('Multi matches', function () {
  const data = ['johan johansson', 'johan lindgren', 'tom johansson'];

  const search = searchUsing(prepareMatcher('natural'), String);
  expect(search('oh an', data)).toEqual(['johan johansson', 'johan lindgren', 'tom johansson']);
});

test('Partial matches', function () {
  const data = ['hamburg city', 'cheeseburger', 'burglar'];

  const search = searchUsing(prepareMatcher('natural'), String);
  expect(search('burger', data)).toEqual(['cheeseburger']);
});

describe('edge cases', () => {
  it('space at the end does not match all', () => {
    const search = searchUsing(prepareMatcher('natural'), String);
    expect(search('c ', ['ab', 'bc', 'cd', 'de'])).toEqual(['cd', 'bc']);
  });
});
