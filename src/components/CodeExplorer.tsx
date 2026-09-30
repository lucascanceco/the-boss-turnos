import React, { useState } from 'react';
import { 
  Folder, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  Layers, 
  Database, 
  Bell, 
  Smartphone, 
  Palette 
} from 'lucide-react';

interface CodeFile {
  path: string;
  name: string;
  category: 'ui' | 'data' | 'domain' | 'config' | 'service';
  language: string;
  description: string;
  content: string;
}

export const CodeExplorer: React.FC<{ files: CodeFile[] }> = ({ files }) => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(files[0]);
  const [copied, setCopied] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredFiles = filterCategory === 'all' 
    ? files 
    : files.filter(f => f.category === filterCategory);

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[700px] bg-[#121212] border border-[#262626] rounded-xl overflow-hidden shadow-2xl">
      {/* Sidebar: File Tree & Category Filter */}
      <div className="w-full lg:w-80 bg-[#161616] border-b lg:border-b-0 lg:border-r border-[#262626] flex flex-col">
        {/* Top Header */}
        <div className="p-4 border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#F4B400]" />
            <span className="font-bold text-sm text-white font-brand">Proyecto Android Nativo</span>
          </div>
          <span className="text-[11px] bg-[#222] text-[#F4B400] px-2 py-0.5 rounded font-mono font-medium">
            {files.length} archivos
          </span>
        </div>

        {/* Category Filters */}
        <div className="p-2 border-b border-[#262626] flex flex-wrap gap-1 bg-[#141414]">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'ui', label: 'Compose UI' },
            { id: 'data', label: 'Room & RTDB' },
            { id: 'domain', label: 'Modelos' },
            { id: 'config', label: 'Gradle/Manifest' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                filterCategory === tab.id
                  ? 'bg-[#F4B400] text-black font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-[#202020]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[500px] lg:max-h-none">
          {filteredFiles.map((file) => {
            const isSelected = selectedFile.path === file.path;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left p-2.5 rounded-lg flex items-start gap-2.5 transition-all text-xs ${
                  isSelected
                    ? 'bg-[#1E1E1E] text-white border-l-2 border-[#F4B400]'
                    : 'text-neutral-400 hover:bg-[#1a1a1a] hover:text-neutral-200'
                }`}
              >
                <FileCode className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-[#F4B400]' : 'text-neutral-500'}`} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-white truncate">{file.name}</div>
                  <div className="text-[10px] text-neutral-500 truncate font-mono">{file.path}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content: File Code Viewer */}
      <div className="flex-1 flex flex-col bg-[#121212] overflow-hidden">
        {/* Editor Top Bar */}
        <div className="p-3 bg-[#1A1A1A] border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xs font-mono text-[#F4B400] truncate">{selectedFile.path}</span>
            <span className="hidden sm:inline-block text-[11px] text-neutral-400">· {selectedFile.description}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252525] hover:bg-[#303030] text-xs font-medium text-white rounded-lg transition-colors border border-[#333]"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400 font-semibold">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-300" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4 bg-[#0E0E0E]">
          <pre className="font-mono text-xs text-neutral-300 leading-relaxed tab-4">
            <code>{selectedFile.content}</code>
          </pre>
        </div>

        {/* Footer info */}
        <div className="p-2.5 bg-[#161616] border-t border-[#262626] flex items-center justify-between text-[11px] text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00C853]"></span>
            <span>Compatible con Android Studio Hedgehog / Iguana / Koala / Ladybug</span>
          </div>
          <div>Kotlin 2.0+ · Jetpack Compose Material 3 · Room 2.6.1 · Firebase BOM 33.5.1</div>
        </div>
      </div>
    </div>
  );
};
