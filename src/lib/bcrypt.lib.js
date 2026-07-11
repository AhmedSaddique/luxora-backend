import createError from 'http-errors';
import bcrypt from 'bcryptjs';

export const bcryptUtils = {
  hashSync: (value, options = {}) => {
    const { rounds = 12 } = options;

    if (!value) throw createError(400, 'Password is required for hashing');

    if (Buffer.byteLength(value, 'utf8') > 72)
      throw createError(
        400,
        'Password exceeds maximum length of 72 UTF-8 bytes'
      );

    try {
      return bcrypt.hashSync(password, rounds);
    } catch (error) {
      throw createError(
        500,
        `Failed to hash the provided value: ${error.message}`
      );
    }
  },

  hash: async (password, options = {}) => {
    const { rounds = 12 } = options;

    if (!password) {
      throw createError(400, 'Password is required for hashing');
    }

    if (Buffer.byteLength(password, 'utf8') > 72) {
      throw createError(
        400,
        'Password exceeds maximum length of 72 UTF-8 bytes'
      );
    }

    try {
      const salt = await bcrypt.genSalt(rounds);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw createError(500, `Failed to hash password: ${error.message}`);
    }
  },

  compareSync: (password, hash) => {
    if (!password) {
      throw createError(400, 'Password is required for comparison');
    }

    if (!hash) {
      throw createError(400, 'Hash is required for comparison');
    }

    try {
      return bcrypt.compareSync(password, hash);
    } catch (error) {
      throw createError(500, `Failed to compare password: ${error.message}`);
    }
  },

  compare: async (password, hash) => {
    if (!password) {
      throw createError(400, 'Password is required for comparison');
    }

    if (!hash) {
      throw createError(400, 'Hash is required for comparison');
    }

    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw createError(500, `Failed to compare password: ${error.message}`);
    }
  },

  genSaltSync: (rounds = 12) => {
    try {
      return bcrypt.genSaltSync(rounds);
    } catch (error) {
      throw createError(500, `Failed to generate salt: ${error.message}`);
    }
  },

  genSalt: async (rounds = 12) => {
    try {
      return await bcrypt.genSalt(rounds);
    } catch (error) {
      throw createError(500, `Failed to generate salt: ${error.message}`);
    }
  },

  getHashInfo: (hash) => {
    if (!hash) {
      throw createError(400, 'Hash is required');
    }

    try {
      const rounds = bcrypt.getRounds(hash);
      const salt = bcrypt.getSalt(hash);

      return {
        hash,
        rounds,
        salt
      };
    } catch (error) {
      throw createError(400, `Invalid hash format: ${error.message}`);
    }
  },

  exceedsMaxSize: (password) => {
    if (!password) {
      return false;
    }

    return Buffer.byteLength(password, 'utf8') > 72;
  },

  validateValue: (password) => {
    const errors = [];

    if (!password) {
      errors.push('Password is required');
    } else {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }

      if (password.length > 128) {
        errors.push('Password must not exceed 128 characters');
      }

      if (Buffer.byteLength(password, 'utf8') > 72) {
        errors.push('Password exceeds maximum length of 72 UTF-8 bytes');
      }

      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }

      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }

      if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
      }

      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
