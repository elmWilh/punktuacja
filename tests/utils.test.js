const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getTargetPeriod, calculateSalary, dailyNorm } = require('../utils');

test('getTargetPeriod for day before 29', () => {
  const { start, end } = getTargetPeriod(new Date(2023, 5, 15)); // Jun 15, 2023
  assert.strictEqual(start.getFullYear(), 2023);
  assert.strictEqual(start.getMonth(), 4); // May
  assert.strictEqual(start.getDate(), 29);
  assert.strictEqual(end.getFullYear(), 2023);
  assert.strictEqual(end.getMonth(), 5); // Jun
  assert.strictEqual(end.getDate(), 28);
});

test('getTargetPeriod for day on/after 29', () => {
  const { start, end } = getTargetPeriod(new Date(2023, 5, 30)); // Jun 30, 2023
  assert.strictEqual(start.getFullYear(), 2023);
  assert.strictEqual(start.getMonth(), 5); // Jun
  assert.strictEqual(start.getDate(), 29);
  assert.strictEqual(end.getFullYear(), 2023);
  assert.strictEqual(end.getMonth(), 6); // Jul
  assert.strictEqual(end.getDate(), 28);
});

test('calculateSalary base case', () => {
  assert.strictEqual(calculateSalary(0, 0, 80), '3705.10');
});

test('calculateSalary with daily norm met', () => {
  assert.strictEqual(calculateSalary(dailyNorm, 1, 80), '4505.10');
});

test('calculateSalary with extra points', () => {
  assert.strictEqual(calculateSalary(dailyNorm + 3, 1, 80), '4547.10');
});
