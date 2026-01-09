const express = require('express');
const healthController = require('../controllers/health');
const userController = require('../controllers/user');
const { requireJwt } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: Service health and status
 *   - name: User
 *     description: Bearer-JWT protected user resources (JWT issued by API Gateway)
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Supply the JWT issued by the API Gateway as `Authorization: Bearer <token>`.
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *           example: Unauthorized
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 *         email:
 *           type: string
 *           example: user@example.com
 *         displayName:
 *           type: string
 *           example: Jane Doe
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 */

// Health endpoints (unprotected)
/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health endpoint
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/health', healthController.check.bind(healthController));

/**
 * @swagger
 * /me:
 *   get:
 *     tags: [User]
 *     summary: Get the current authenticated user (via Bearer JWT)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', requireJwt, userController.me.bind(userController));

/**
 * @swagger
 * /home:
 *   get:
 *     tags: [User]
 *     summary: Get personalized home page data for the authenticated user (via Bearer JWT)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personalized homepage payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 home:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: Welcome, Jane Doe
 *                     message:
 *                       type: string
 *                       example: This is your personalized home feed.
 *                     links:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                           href:
 *                             type: string
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/home', requireJwt, userController.home.bind(userController));

module.exports = router;
