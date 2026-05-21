import { describe, it, expect } from 'vitest';

describe('Sample Test Suite', () => {
  it('should add numbers correctly', () => {
    const add = (a: number, b: number) => a + b;
    expect(add(2, 3)).toBe(5);
  });

  it('should verify string operations', () => {
    const greet = (name: string) => `Hello, ${name}!`;
    expect(greet('World')).toBe('Hello, World!');
  });

  it('should handle objects', () => {
    const user = { name: 'John', age: 30 };
    expect(user.name).toBe('John');
    expect(user.age).toBeGreaterThanOrEqual(18);
  });

  it('should test async operations', async () => {
    const asyncFetch = () => Promise.resolve({ status: 200, data: 'success' });
    const result = await asyncFetch();
    expect(result.status).toBe(200);
  });
});
