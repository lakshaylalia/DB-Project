'use client';

import { useEffect, useRef } from 'react';

export default function TreeVisualization({ treeData }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!treeData || !svgRef.current) return;

    const svg = svgRef.current;
    svg.innerHTML = '';

    // Calculate positions for all nodes
    const positions = calculateNodePositions(treeData);
    
    // Draw connections first (so they appear behind nodes)
    drawConnections(svg, treeData, positions);
    
    // Draw nodes
    drawNodes(svg, treeData, positions);
    
    // Draw sibling links for leaf nodes
    drawSiblingLinks(svg, treeData, positions);

  }, [treeData]);

  const calculateNodePositions = (node, level = 0, leftBound = 0, rightBound = 1000) => {
    const positions = new Map();
    const nodeWidth = 120;
    const nodeHeight = 60;
    const levelHeight = 100;

    const traverse = (node, level, leftBound, rightBound) => {
      const x = (leftBound + rightBound) / 2;
      const y = level * levelHeight + 50;
      
      positions.set(node.id, { x, y, node });

      if (node.children && node.children.length > 0) {
        const childWidth = (rightBound - leftBound) / node.children.length;
        node.children.forEach((child, index) => {
          const childLeft = leftBound + index * childWidth;
          const childRight = leftBound + (index + 1) * childWidth;
          traverse(child, level + 1, childLeft, childRight);
        });
      }
    };

    traverse(node, level, leftBound, rightBound);
    return positions;
  };

  const drawNodes = (svg, node, positions) => {
    const traverse = (node) => {
      const pos = positions.get(node.id);
      if (!pos) return;

      // Create node group
      const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      nodeGroup.setAttribute('class', 'node-group');

      // Node rectangle
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', pos.x - 60);
      rect.setAttribute('y', pos.y - 25);
      rect.setAttribute('width', '120');
      rect.setAttribute('height', '50');
      rect.setAttribute('rx', '8');
      rect.setAttribute('class', node.type === 'leaf' ? 'leaf-node' : 'internal-node');
      rect.setAttribute('fill', node.type === 'leaf' ? '#10B981' : '#3B82F6');
      rect.setAttribute('stroke', '#1F2937');
      rect.setAttribute('stroke-width', '2');
      rect.setAttribute('opacity', '0.9');

      // Node text
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', pos.x);
      text.setAttribute('y', pos.y);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', 'white');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', 'bold');
      text.textContent = node.keys.join(', ');

      // Values for leaf nodes
      if (node.type === 'leaf' && node.values) {
        const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        valueText.setAttribute('x', pos.x);
        valueText.setAttribute('y', pos.y + 12);
        valueText.setAttribute('text-anchor', 'middle');
        valueText.setAttribute('dominant-baseline', 'middle');
        valueText.setAttribute('fill', 'white');
        valueText.setAttribute('font-size', '10');
        valueText.setAttribute('opacity', '0.8');
        valueText.textContent = `[${node.values.join(', ')}]`;
        nodeGroup.appendChild(valueText);
      }

      nodeGroup.appendChild(rect);
      nodeGroup.appendChild(text);
      svg.appendChild(nodeGroup);

      // Recursively draw children
      if (node.children) {
        node.children.forEach(child => traverse(child));
      }
    };

    traverse(node);
  };

  const drawConnections = (svg, node, positions) => {
    const traverse = (node) => {
      if (node.children && node.children.length > 0) {
        const parentPos = positions.get(node.id);
        
        node.children.forEach(child => {
          const childPos = positions.get(child.id);
          if (parentPos && childPos) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', parentPos.x);
            line.setAttribute('y1', parentPos.y + 25);
            line.setAttribute('x2', childPos.x);
            line.setAttribute('y2', childPos.y - 25);
            line.setAttribute('stroke', '#6B7280');
            line.setAttribute('stroke-width', '2');
            line.setAttribute('opacity', '0.7');
            svg.appendChild(line);
          }
          traverse(child);
        });
      }
    };

    traverse(node);
  };

  const drawSiblingLinks = (svg, node, positions) => {
    const leafNodes = [];
    
    const collectLeafNodes = (node) => {
      if (node.type === 'leaf') {
        leafNodes.push(node);
      }
      if (node.children) {
        node.children.forEach(child => collectLeafNodes(child));
      }
    };

    collectLeafNodes(node);

    // Sort leaf nodes by their x position
    leafNodes.sort((a, b) => {
      const posA = positions.get(a.id);
      const posB = positions.get(b.id);
      return posA.x - posB.x;
    });

    // Draw connections between adjacent leaf nodes
    for (let i = 0; i < leafNodes.length - 1; i++) {
      const currentPos = positions.get(leafNodes[i].id);
      const nextPos = positions.get(leafNodes[i + 1].id);
      
      if (currentPos && nextPos) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', currentPos.x + 60);
        line.setAttribute('y1', currentPos.y);
        line.setAttribute('x2', nextPos.x - 60);
        line.setAttribute('y2', nextPos.y);
        line.setAttribute('stroke', '#8B5CF6');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '5,5');
        line.setAttribute('opacity', '0.6');
        svg.appendChild(line);
      }
    }
  };

  if (!treeData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">No tree data to display</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto bg-white rounded-lg shadow-lg border">
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <h3 className="text-lg font-semibold text-gray-800">B+ Tree Visualization</h3>
        <p className="text-sm text-gray-600 mt-1">
          Blue nodes are internal nodes, Green nodes are leaf nodes, Purple dashed lines show sibling connections
        </p>
      </div>
      <div className="p-4">
        <svg
          ref={svgRef}
          width="100%"
          height="400"
          className="border rounded"
          style={{ minWidth: '800px' }}
        >
          {/* SVG content will be dynamically generated */}
        </svg>
      </div>
    </div>
  );
}