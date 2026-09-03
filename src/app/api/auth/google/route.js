import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { connectDB, isDbReady } from '@/lib/db';
import User from '@/lib/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'rem_secret_jwt_key_2026';

function generateToken(user) {
  return jwt.sign(
    { id: user._id || user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function parseGooglePayload(credential) {
  try {
    const parts = credential.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture || ''
      };
    }
  } catch (e) {
    console.error('Failed to parse credential:', e);
  }
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { credential, mockUser } = body;

    let profile = null;
    if (credential) {
      profile = parseGooglePayload(credential);
    } else if (mockUser) {
      profile = {
        googleId: mockUser.googleId || 'mock_' + Date.now(),
        email: mockUser.email,
        name: mockUser.name || 'Rem User',
        picture: mockUser.picture || ''
      };
    }

    if (!profile || !profile.email) {
      return NextResponse.json({ error: 'Invalid Google credential' }, { status: 400 });
    }

    await connectDB();

    if (isDbReady()) {
      let user = await User.findOne({
        $or: [{ googleId: profile.googleId }, { email: profile.email.toLowerCase() }]
      });

      if (!user) {
        user = await User.create({
          googleId: profile.googleId,
          email: profile.email.toLowerCase(),
          name: profile.name,
          picture: profile.picture
        });
      } else {
        if (!user.googleId) user.googleId = profile.googleId;
        if (!user.picture && profile.picture) user.picture = profile.picture;
        await user.save();
      }

      const token = generateToken(user);
      return NextResponse.json({
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          picture: user.picture,
          loginKey: user.loginKey
        }
      });
    } else {
      // In-memory / Mock response if DB is offline
      const id = 'user_' + Date.now();
      const user = {
        id,
        _id: id,
        googleId: profile.googleId,
        email: profile.email.toLowerCase(),
        name: profile.name,
        picture: profile.picture,
        loginKey: 'rem_' + crypto.randomBytes(8).toString('hex')
      };
      const token = generateToken(user);
      return NextResponse.json({ token, user });
    }
  } catch (error) {
    console.error('Google Auth Route Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
