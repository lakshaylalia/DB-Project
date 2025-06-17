import { globalTree } from '@/lib/bplus-tree.js';

export async function GET() {
  try {
    const allData = globalTree.getAll();
    return Response.json({ 
      data: allData,
      count: allData.length
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to retrieve all data' }, 
      { status: 500 }
    );
  }
}