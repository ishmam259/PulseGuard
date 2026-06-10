const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { ListToolsRequestSchema, CallToolRequestSchema, ErrorCode, McpError } = require('@modelcontextprotocol/sdk/types.js');
const pool = require('../db/pool');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPersonalizedRDA } = require('./nutritionEngine');
const { enrichPatient } = require('./gestation');
const fs = require('fs');
const path = require('path');

/**
 * MCP Manager — Implementation of PulseGuard MCP Server
 */
class McpManager {
  constructor() {
    this.server = new Server(
      {
        name: 'pulseguard-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'login',
          description: 'Authenticate with email/phone and password to get a JWT token.',
          inputSchema: {
            type: 'object',
            properties: {
              email: { type: 'string', description: 'User email' },
              phone: { type: 'string', description: 'User phone (11 digits)' },
              password: { type: 'string', description: 'User password' },
            },
            required: ['password'],
          },
        },
        {
          name: 'search_food',
          description: 'Search for food items in the nutrition database. Requires authentication.',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search term (e.g., "rice", "dal")' },
              token: { type: 'string', description: 'JWT authentication token' },
            },
            required: ['query', 'token'],
          },
        },
        {
          name: 'get_my_rda',
          description: 'Get personalized daily nutrition targets. Requires authentication.',
          inputSchema: {
            type: 'object',
            properties: {
              token: { type: 'string', description: 'JWT authentication token' },
            },
            required: ['token'],
          },
        },
        {
          name: 'get_nutrition_guidelines',
          description: 'Get general pregnancy nutrition guidelines by trimester (Public).',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'login':
            return await this.handleLogin(args);
          case 'search_food':
            return await this.handleSearchFood(args);
          case 'get_my_rda':
            return await this.handleGetMyRDA(args);
          case 'get_nutrition_guidelines':
            return await this.handleGetGuidelines();
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        console.error(`Error executing tool ${name}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  // ── Tool Handlers ──────────────────────────────────────────

  async handleLogin(args) {
    const { email, phone, password } = args;
    if (!email && !phone) {
      throw new Error('Either email or phone is required');
    }

    const query = email ? 'SELECT * FROM users WHERE email = $1' : 'SELECT * FROM users WHERE phone = $1';
    const param = email || phone;

    const result = await pool.query(query, [param]);
    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, role: user.role },
          }, null, 2),
        },
      ],
    };
  }

  async handleSearchFood(args) {
    const { query, token } = args;
    const user = this.verifyToken(token);

    const foodsQuery = `
      SELECT id, name_en, name_bn, category, energy_kcal, protein_g, carb_g, fat_g
      FROM food_items
      WHERE (name_en ILIKE $1 OR name_bn ILIKE $1) AND is_active = true
      LIMIT 10
    `;
    const result = await pool.query(foodsQuery, [`%${query}%`]);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ foods: result.rows }, null, 2),
        },
      ],
    };
  }

  async handleGetMyRDA(args) {
    const { token } = args;
    const user = this.verifyToken(token);

    if (user.role !== 'patient') {
      throw new Error('Only patients have RDA profiles');
    }

    const patientRes = await pool.query('SELECT * FROM patients WHERE user_id = $1', [user.id]);
    if (patientRes.rows.length === 0) {
      throw new Error('Patient profile not found');
    }

    const patient = enrichPatient(patientRes.rows[0]);
    const vitalsRes = await pool.query(
      'SELECT weight_kg FROM vitals WHERE patient_id = $1 AND weight_kg IS NOT NULL ORDER BY recorded_at DESC LIMIT 1',
      [patient.id]
    );
    
    const weight_kg = vitalsRes.rows[0]?.weight_kg ? parseFloat(vitalsRes.rows[0].weight_kg) : null;
    const height_cm = patient.height ? parseFloat(patient.height) : null;

    const rdaInfo = getPersonalizedRDA({
      gestational_week: patient.gestational_week,
      is_twin_pregnancy: patient.is_twin_pregnancy,
      activity_level: patient.activity_level,
      weight_kg,
      height_cm
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(rdaInfo, null, 2),
        },
      ],
    };
  }

  async handleGetGuidelines() {
    const filePath = path.join(__dirname, '../config/nutritionGuidelines.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  // ── Helper ──────────────────────────────────────────────────

  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error('Unauthorized: Invalid or expired token');
    }
  }
}

module.exports = new McpManager();
