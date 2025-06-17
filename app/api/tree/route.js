import { globalTree } from '@/lib/bplus-tree.js';

export async function GET() {
  try {
    const treeStructure = globalTree.getTreeStructure();
    return Response.json({ tree: treeStructure });
  } catch (error) {
    return Response.json(
      { error: 'Failed to get tree structure' }, 
      { status: 500 }
    );
  }
}