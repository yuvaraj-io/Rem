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

// 1. PUT update node
export async function PUT(request, { params }) {
  const userId = getUserId(request);
  const { id } = params;

  try {
    const body = await request.json();
    const { name, text, completed, parentId } = body;

    await connectDB();

    if (isDbReady()) {
      const node = await Node.findOne({ _id: id, userId });
      if (!node) return NextResponse.json({ error: 'Node not found' }, { status: 404 });

      if (name !== undefined) node.name = String(name).trim();
      if (text !== undefined) node.text = String(text).trim();
      if (completed !== undefined) node.completed = Boolean(completed);
      if (parentId !== undefined) node.parentId = parentId || null;

      await node.save();

      return NextResponse.json({
        id: node._id.toString(),
        type: node.type,
        name: node.name,
        text: node.text,
        parentId: node.parentId,
        completed: node.completed,
        createdAt: node.createdAt,
        updatedAt: node.updatedAt
      });
    }

    return NextResponse.json({ id, ...body, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Update Node Error:', error);
    return NextResponse.json({ error: 'Failed to update node' }, { status: 500 });
  }
}

// 2. DELETE node (with recursive cascade)
export async function DELETE(request, { params }) {
  const userId = getUserId(request);
  const { id } = params;

  try {
    await connectDB();

    if (isDbReady()) {
      const allNodes = await Node.find({ userId });
      const idsToDelete = [id];

      function findChildren(pId) {
        allNodes
          .filter(n => n.parentId === pId)
          .forEach(child => {
            idsToDelete.push(child._id.toString());
            if (child.type === 'folder') {
              findChildren(child._id.toString());
            }
          });
      }

      findChildren(id);

      await Node.deleteMany({ _id: { $in: idsToDelete }, userId });
      return NextResponse.json({ success: true, deletedIds: idsToDelete });
    }

    return NextResponse.json({ success: true, deletedIds: [id] });
  } catch (error) {
    console.error('Delete Node Error:', error);
    return NextResponse.json({ error: 'Failed to delete node' }, { status: 500 });
  }
}
