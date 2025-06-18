import { globalTree } from '@/lib/bplus-tree.js';

export async function DELETE() {
  try {
    globalTree.clear();
    
    return Response.json({ 
      success: true, 
      message: 'All data cleared successfully' 
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to clear data' }, 
      { status: 500 }
    );
  }
}