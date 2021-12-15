import { Sleep } from './sleep';

describe('Sleep', () => {
  it('Sleeps', async () => {
    const then = Date.now();
    await Sleep(200);
    const now = Date.now();
    expect(now).toBeGreaterThan(then);
  });
});
