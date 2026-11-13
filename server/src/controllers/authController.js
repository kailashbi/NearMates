import { AuthService } from '../services/authService.js';
import { registerSchema, loginSchema } from '../validators/schemaValidators.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          statusCode: 400,
          error: 'Bad Request',
          message: error.details[0].message
        });
      }

      const result = await AuthService.register(value);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          statusCode: 400,
          error: 'Bad Request',
          message: error.details[0].message
        });
      }

      const result = await AuthService.login(value.email, value.password);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req, res, next) {
    try {
      const result = await AuthService.getCurrentUser(req.user.userId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async logout(req, res) {
    res.status(200).json({ message: 'Successfully logged out.' });
  }
}

