import {
  add,
  fromDecimal,
  money,
  multiplyRatio,
  negate,
  roundHalfEven,
  subtract,
} from '../../domain/accounting/money';

describe('Money', () => {
  it('stores integer cents and does exact arithmetic', () => {
    expect(money(123).cents).toBe(123);
    expect(add(money(125), money(75)).cents).toBe(200);
    expect(subtract(money(125), money(75)).cents).toBe(50);
    expect(negate(money(125)).cents).toBe(-125);
  });

  it('rounds half-even for decimal ties and signs', () => {
    expect(roundHalfEven(2.5)).toBe(2);
    expect(roundHalfEven(3.5)).toBe(4);
    expect(roundHalfEven(-2.5)).toBe(-2);
    expect(roundHalfEven(-3.5)).toBe(-4);
    expect(fromDecimal('1.005').cents).toBe(100);
    expect(fromDecimal('1.015').cents).toBe(102);
    expect(fromDecimal('-1.005').cents).toBe(-100);
    expect(fromDecimal('-1.015').cents).toBe(-102);
  });

  it('rounds ratios half-even at transaction boundaries', () => {
    expect(multiplyRatio(money(5), 1, 2).cents).toBe(2);
    expect(multiplyRatio(money(7), 1, 2).cents).toBe(4);
    expect(multiplyRatio(money(-5), 1, 2).cents).toBe(-2);
    expect(multiplyRatio(money(-7), 1, 2).cents).toBe(-4);
  });
});
