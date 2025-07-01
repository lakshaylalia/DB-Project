import { globalTree } from '@/lib/bplus-tree.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (key === null) {
      return Response.json(
        { error: 'Key parameter is required' }, 
        { status: 400 }
      );
    }

    const parsedKey = isNaN(key) ? key : Number(key);
    const value = globalTree.search(parsedKey);
    console.log(globalTree);
    console.log(value);
    if (value !== null) {
      return Response.json({ 
        found: true, 
        key: parsedKey, 
        value: value 
      });
    } else {
      return Response.json({ 
        found: false, 
        key: parsedKey, 
        message: 'Key not found' 
      });
    }
  } catch (error) {
    return Response.json(
      { error: 'Failed to search' }, 
      { status: 500 }
    );
  }
}