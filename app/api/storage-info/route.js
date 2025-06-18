import { globalTree } from '@/lib/bplus-tree.js';

export async function GET() {
  try {
    const storageInfo = globalTree.getStorageInfo();
    
    return Response.json({ 
      storageInfo,
      message: 'Storage information retrieved successfully'
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to get storage information' }, 
      { status: 500 }
    );
  }
}