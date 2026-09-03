import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB, isDbReady } from '@/lib/db';
import Node from '@/lib/models/Node';

const JWT_SECRET = process.env.JWT_SECRET || 'rem_secret_jwt_key_2026';

function getUserId(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    try {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded.id;
    } catch {
      return 'guest';
    }
  }
  return 'guest';
}

// 1. GET all nodes
export async function GET(request) {
  const userId = getUserId(request);

  try {
    await connectDB();

    if (isDbReady()) {
      const nodes = await Node.find({ userId }).sort({ createdAt: 1 });
      return NextResponse.json(nodes.map(n => ({
        id: n._id.toString(),
        type: n.type,
        name: n.name,
        text: n.text,
        parentId: n.parentId,
        completed: n.completed,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt
      })));
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error('Fetch Nodes Error:', error);
    return NextResponse.json({ error: 'Failed to fetch nodes' }, { status: 500 });
  }
}

// 2. POST create node or sync
export async function POST(request) {
  const userId = getUserId(request);

  try {
    const body = await request.json();

    await connectDB();

    // Check if bulk sync request
    if (body.sync && Array.isArray(body.nodes)) {
      if (isDbReady()) {
        const existing = await Node.find({ userId });
        if (existing.length === 0 && body.nodes.length > 0) {
          const docs = body.nodes.map(n => ({
            userId,
            type: n.type,
            name: n.name || '',
            text: n.text || '',
            parentId: n.parentId || null,
            completed: Boolean(n.completed),
            createdAt: n.createdAt || Date.now()
          }));
          await Node.insertMany(docs);
        }
        const updated = await Node.find({ userId }).sort({ createdAt: 1 });
        return NextResponse.json(updated.map(n => ({
          id: n._id.toString(),
          type: n.type,
          name: n.name,
          text: n.text,
          parentId: n.parentId,
          completed: n.completed,
          createdAt: n.createdAt,
          updatedAt: n.updatedAt
        })));
      }
      return NextResponse.json(body.nodes);
    }

    const { type, name, text, parentId, completed } = body;
    if (!type || !['folder', 'todo'].includes(type)) {
      return NextResponse.json({ error: 'Invalid node type' }, { status: 400 });
    }

    if (isDbReady()) {
      const newNode = await Node.create({
        userId,
        type,
        name: name ? String(name).trim() : '',
        text: text ? String(text).trim() : '',
        parentId: parentId || null,
        completed: Boolean(completed)
      });

      return NextResponse.json({
        id: newNode._id.toString(),
        type: newNode.type,
        name: newNode.name,
        text: newNode.text,
        parentId: newNode.parentId,
        completed: newNode.completed,
        createdAt: newNode.createdAt,
        updatedAt: newNode.updatedAt
      }, { status: 201 });
    } else {
      const fallbackId = `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return NextResponse.json({
        id: fallbackId,
        userId,
        type,
        name: name ? String(name).trim() : '',
        text: text ? String(text).trim() : '',
        parentId: parentId || null,
        completed: Boolean(completed),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Create Node Error:', error);
    return NextResponse.json({ error: 'Failed to create node' }, { status: 500 });
  }
}
