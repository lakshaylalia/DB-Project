'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Database, Trees as Tree, Loader2 } from 'lucide-react';
import TreeVisualization from '@/components/TreeVisualization';

export default function Home() {
  const [insertKey, setInsertKey] = useState('');
  const [insertValue, setInsertValue] = useState('');
  const [searchKey, setSearchKey] = useState('');
  type SearchResult = { found: boolean; key?: string | number; value?: string; message?: string };
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  type DataItem = { key: string | number; value: string };
  const [allData, setAllData] = useState<DataItem[]>([]);
  const [treeData, setTreeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  type MessageType = { text: string; type: 'info' | 'success' | 'error' | 'warning' } | null;
  const [message, setMessage] = useState<MessageType>(null);

  const showMessage = (text: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleInsert = async () => {
    if (!insertKey || !insertValue) {
      showMessage('Please enter both key and value', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const key = isNaN(Number(insertKey)) ? insertKey : Number(insertKey);
      const response = await fetch('/api/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: insertValue }),
      });

      const result = await response.json();
      if (response.ok) {
        showMessage(`Successfully inserted: ${key} -> ${insertValue}`, 'success');
        setInsertKey('');
        setInsertValue('');
        await refreshTreeData();
        await fetchAllData();
      } else {
        showMessage(result.error, 'error');
      }
    } catch (error) {
      showMessage('Failed to insert data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKey) {
      showMessage('Please enter a search key', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const key = isNaN(Number(searchKey)) ? searchKey : Number(searchKey);
      const response = await fetch(`/api/search?key=${encodeURIComponent(key)}`);
      const result = await response.json();
      
      if (response.ok) {
        setSearchResult(result);
        if (result.found) {
          showMessage(`Found: ${result.key} -> ${result.value}`, 'success');
        } else {
          showMessage(`Key "${result.key}" not found`, 'warning');
        }
      } else {
        showMessage(result.error, 'error');
      }
    } catch (error) {
      showMessage('Failed to search', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      const response = await fetch('/api/all');
      const result = await response.json();
      if (response.ok) {
        setAllData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch all data:', error);
    }
  };

  const refreshTreeData = async () => {
    try {
      const response = await fetch('/api/tree');
      const result = await response.json();
      if (response.ok) {
        setTreeData(result.tree);
      }
    } catch (error) {
      console.error('Failed to fetch tree data:', error);
    }
  };

  useEffect(() => {
    fetchAllData();
    refreshTreeData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            B+ Tree Data Structure
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Interactive B+ Tree implementation with real-time visualization. Insert key-value pairs, 
            search for data, and watch the tree structure grow dynamically.
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-center transition-all duration-300 ${
            message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
            message.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
            message.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
            'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Control Panel */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Insert Card */}
          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Plus className="w-5 h-5 text-blue-600" />
                Insert Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insert-key" className="text-sm font-medium">Key</Label>
                  <Input
                    id="insert-key"
                    value={insertKey}
                    onChange={(e) => setInsertKey(e.target.value)}
                    placeholder="Enter key"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="insert-value" className="text-sm font-medium">Value</Label>
                  <Input
                    id="insert-value"
                    value={insertValue}
                    onChange={(e) => setInsertValue(e.target.value)}
                    placeholder="Enter value"
                    className="mt-1"
                  />
                </div>
              </div>
              <Button 
                onClick={handleInsert}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Insert
              </Button>
            </CardContent>
          </Card>

          {/* Search Card */}
          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Search className="w-5 h-5 text-green-600" />
                Search Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="search-key" className="text-sm font-medium">Search Key</Label>
                <Input
                  id="search-key"
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  placeholder="Enter key to search"
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                Search
              </Button>
              
              {searchResult && (
                <div className={`p-3 rounded-lg mt-4 ${
                  searchResult.found 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-orange-50 border border-orange-200'
                }`}>
                  <p className={`font-medium ${searchResult.found ? 'text-green-800' : 'text-orange-800'}`}>
                    {searchResult.found 
                      ? `Found: ${searchResult.key} → ${searchResult.value}`
                      : searchResult.message
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tree Visualization */}
        <Card className="mb-8 backdrop-blur-sm bg-white/70 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Tree className="w-5 h-5 text-purple-600" />
              Tree Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TreeVisualization treeData={treeData} />
          </CardContent>
        </Card>

        {/* All Data Display */}
        <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Database className="w-5 h-5 text-indigo-600" />
                All Data
              </CardTitle>
              <Badge variant="secondary" className="text-sm">
                {allData.length} items
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {allData.length === 0 ? (
              <div className="text-center py-8">
                <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No data stored yet. Insert some key-value pairs to get started!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="font-mono">
                        {item.key}
                      </Badge>
                      <span className="text-gray-400">→</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500">
            B+ Tree implementation with order 3. All data is stored in memory and will be lost on page refresh.
          </p>
        </div>
      </div>
    </div>
  );
}