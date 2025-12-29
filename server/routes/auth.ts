import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'nazupro-nexus-secret-key-change-me';

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({ email, passwordHash });
        await newUser.save();

        res.status(201).json({ success: true, message: 'User created' });
    } catch (err) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const validPass = await bcrypt.compare(password, user.passwordHash);
        if (!validPass) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// BOT AUTH & POCKET OPTION CONFIGURATION
router.post('/pocket-login', async (req, res) => {
    try {
        const { botId, username, accessKey, pocketEmail, pocketPassword } = req.body;

        // 1. Verify Bot Auth (Username/Access Key) against .env
        const fs = require('fs');
        const path = require('path');
        const envPath = path.resolve(__dirname, '../../../nazmulbot/.env');

        if (!fs.existsSync(envPath)) {
            return res.status(500).json({ error: 'Bot configuration not found' });
        }

        let envContent = fs.readFileSync(envPath, 'utf8');
        let envUser = '';
        let envKey = '';

        envContent.split('\n').forEach((line: string) => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const val = parts.slice(1).join('=').trim().replace(/['"]/g, '');
                if (key === 'USERNAME') envUser = val;
                if (key === 'ACCESS_KEY') envKey = val;
            }
        });

        // Check if strict auth is required (if vars exist)
        if (envUser && envKey) {
            if (username !== envUser || accessKey !== envKey) {
                return res.status(401).json({ error: 'Invalid Access Credentials' });
            }
        }

        // 2. Authentication Successful - Now Handle PocketOption Credentials

        // A) Update .env file with new PocketOption credentials
        if (pocketEmail && pocketPassword) {
            const newEnvLines = [];
            let emailUpdated = false;
            let passUpdated = false;

            envContent.split('\n').forEach((line: string) => {
                if (line.startsWith('POCKET_EMAIL=')) {
                    newEnvLines.push(`POCKET_EMAIL=${pocketEmail}`);
                    emailUpdated = true;
                } else if (line.startsWith('POCKET_PASSWORD=')) {
                    newEnvLines.push(`POCKET_PASSWORD=${pocketPassword}`);
                    passUpdated = true;
                } else if (line.trim() !== '') {
                    newEnvLines.push(line);
                }
            });

            if (!emailUpdated) newEnvLines.push(`POCKET_EMAIL=${pocketEmail}`);
            if (!passUpdated) newEnvLines.push(`POCKET_PASSWORD=${pocketPassword}`);

            fs.writeFileSync(envPath, newEnvLines.join('\n'));
        }

        // B) Save to DB "PocketCredential" collection (Separate Table)
        const PocketCredential = require('../models/PocketCredential').default;
        if (pocketEmail && pocketPassword) {
            await PocketCredential.findOneAndUpdate(
                { botId },
                {
                    $set: {
                        email: pocketEmail,
                        password: pocketPassword,
                        updatedAt: new Date()
                    }
                },
                { upsert: true }
            );
        }

        // C) Update Bot Link Status
        const Bot = require('../models/Bot').default;
        await Bot.findOneAndUpdate(
            { id: botId },
            { $set: { isLinked: true } }
        );

        res.json({ success: true, message: 'Authenticated & Configured' });

    } catch (err) {
        console.error("❌ [AUTH] Login error:", err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// LOGOUT
router.post('/logout', async (req, res) => {
    try {
        const { botId } = req.body;
        const Bot = require('../models/Bot').default;
        await Bot.findOneAndUpdate(
            { id: botId },
            { $set: { isLinked: false } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Logout failed' });
    }
});

// ME (Verify Token)
router.get('/me', authenticateToken, (req: AuthRequest, res) => {
    res.json(req.user);
});

export default router;
