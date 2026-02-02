import { spacing, radius } from './tokens';

describe('theme/tokens', () => {
  describe('spacing', () => {
    it('has expected keys and values', () => {
      expect(spacing.xs).toBe(4);
      expect(spacing.sm).toBe(8);
      expect(spacing.md).toBe(16);
      expect(spacing.lg).toBe(24);
      expect(spacing.xl).toBe(32);
    });

    it('is defined as const', () => {
      expect(spacing).toBeDefined();
      expect(Object.keys(spacing)).toEqual(['xs', 'sm', 'md', 'lg', 'xl']);
    });
  });

  describe('radius', () => {
    it('has expected keys and values', () => {
      expect(radius.sm).toBe(4);
      expect(radius.md).toBe(8);
      expect(radius.lg).toBe(12);
      expect(radius.full).toBe(9999);
    });
  });
});
