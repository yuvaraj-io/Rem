import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
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

export async function POST(request) {
  try {
    const { loginKey } = await request.json();
    if (!loginKey || typeof loginKey !== 'string') {
      return NextResponse.json({ error: 'Please enter a valid Device Login Key' }, { status: 400 });
    }

    const cleanKey = loginKey.trim();
    await connectDB();

    if (isDbReady()) {
      const user = await User.findOne({ loginKey: cleanKey });
      if (!user) {
        return NextResponse.json({ error: 'Invalid Device Key. No account found with this key.' }, { status: 401 });
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
      return NextResponse.json({ error: 'Database is currently offline. Please use Local Mode.' }, { status: 503 });
    }
  } catch (error) {
    console.error('Key Login Route Error:', error);
    return NextResponse.json({ error: 'Key authentication failed' }, { status: 500 });
  }
}
