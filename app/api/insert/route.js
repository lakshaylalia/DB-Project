import { globalTree } from '@/lib/bplus-tree.js';

export async function POST(request) {
  try {
    const { key, value } = await request.json();

    if (key === undefined || value === undefined) {
      return Response.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    globalTree.insert(key, value);

    return Response.json({
      success: true,
      message: `Inserted key: ${key}, value: ${value}`
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: 'Failed to insert data' },
      { status: 500 }
    );
  }
}
