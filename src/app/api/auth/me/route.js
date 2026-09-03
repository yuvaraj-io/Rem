import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB, isDbReady } from '@/lib/db';
import User from '@/lib/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'rem_secret_jwt_key_2026';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);

    await connectDB();

    if (isDbReady()) {
      const user = await User.findById(decoded.id);
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      return NextResponse.json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        picture: user.picture,
        loginKey: user.loginKey
      });
    }

    return NextResponse.json({
      id: decoded.id,
      name: decoded.name,
      email: decoded.email
    });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
