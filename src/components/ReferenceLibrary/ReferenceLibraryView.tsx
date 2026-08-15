import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Flame, 
  Heart,
  Tag,
  Copy,
  Check
} from 'lucide-react';
import { ReferencePost } from '../../types';

interface ReferenceLibraryViewProps {
  references: ReferencePost[];
  onAddReference: (ref: ReferencePost) => void;
  onDeleteReference: (id: string) => void;
}

export const ReferenceLibraryView: React.FC<ReferenceLibraryViewProps> = ({
  references,
  onAddReference,
  onDeleteReference,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [rawText, setRawText] = useState('');
  const [hookType, setHookType] = useState('Contrarian / Behind-the-scenes mystery');
  const [structureNotes, setStructureNotes] = useState('');
  const [infoDensity, setInfoDensity] = useState('High');

  const handleAdd = () => {
    if (!title.trim() || !rawText.trim()) return;
    const newRef: ReferencePost = {
      id: `ref-${Date.now()}`,
      title,
      original_author: author || '@creator',
      raw_text: rawText,
      hook_type: hookType,
      structure_notes: structureNotes || 'Clear 3-act pacing with punchy opening hook and verified resolution.',
      information_density: infoDensity,
      emotional_arc: 'Curiosity -> Revelation',
      ending_pattern: 'Sharp observation',
      tags: ['cinema', 'structure'],
      created_at: new Date().toISOString()
    };
    onAddReference(newRef);
    setTitle('');
    setAuthor('');
    setRawText('');
    setStructureNotes('');
    setShowAddModal(false);
  };

  const handleCopyStructure = (ref: ReferencePost) => {
    const text = `ANATOMY: ${ref.title}\nHOOK TYPE: ${ref.hook_type}\nSTRUCTURE: ${ref.structure_notes}`;
    navigator.clipboard.writeText(text);
    setCopiedId(ref.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-cinema-900/80 border border-cinema-800 rounded-2xl p-6 shadow-cinema-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-gold-400" />
            <h1 className="font-display font-black text-2xl text-white tracking-tight">
              Structural Reference Vault
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-gold-500/10 text-gold-300 border border-gold-500/30">
              Anatomy & Cadence Only
            </span>
          </div>
          <p className="text-xs text-cinema-300">
            Save high-performing cinema posts to extract hook mechanics, pacing, and tension patterns. Soulflick learns the structural anatomy without ever copying words.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-cinema-950 font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Reference Post</span>
        </button>
      </div>

      {/* Reference Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {references.map((ref) => (
          <div
            key={ref.id}
            className="rounded-2xl bg-cinema-900/90 border border-cinema-800 p-5 shadow-cinema-card space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-white">{ref.title}</h3>
                  <span className="text-xs text-cinema-400 font-mono">{ref.original_author}</span>
                </div>
                <button
                  onClick={() => onDeleteReference(ref.id)}
                  className="text-cinema-500 hover:text-spicy-400 p-1"
                  title="Delete reference"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Raw Example */}
              <div className="bg-cinema-950/90 p-3.5 rounded-xl border border-cinema-800 text-xs text-cinema-200 whitespace-pre-line leading-relaxed italic">
                &quot;{ref.raw_text}&quot;
              </div>

              {/* Dissected Anatomy Grid */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-cinema-950 border border-cinema-800/80">
                  <span className="text-gold-400 font-mono text-[10px] uppercase font-bold block mb-0.5">
                    HOOK MECHANIC:
                  </span>
                  <span className="text-cinema-200">{ref.hook_type}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-cinema-950 border border-cinema-800/80">
                  <span className="text-sky-400 font-mono text-[10px] uppercase font-bold block mb-0.5">
                    STRUCTURAL ANATOMY:
                  </span>
                  <span className="text-cinema-300">{ref.structure_notes}</span>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-cinema-800/80 flex items-center justify-between">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cinema-950 text-cinema-400 border border-cinema-800">
                Density: {ref.information_density}
              </span>

              <button
                onClick={() => handleCopyStructure(ref)}
                className="flex items-center gap-1 text-xs text-gold-400 hover:underline font-mono"
              >
                {copiedId === ref.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedId === ref.id ? 'Copied' : 'Copy Anatomy'}</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Add Reference Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cinema-900 border border-cinema-750 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="font-display font-bold text-lg text-white">Add Structural Reference Post</h3>
            
            <div>
              <label className="text-xs text-cinema-400 block mb-1">Title / Pattern Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., The 3-Sentence Reversal Hook"
                className="w-full bg-cinema-950 border border-cinema-750 rounded-lg p-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-cinema-400 block mb-1">Author / Source Handle (Optional)</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g., @cine_insider"
                className="w-full bg-cinema-950 border border-cinema-750 rounded-lg p-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-cinema-400 block mb-1">Raw Post Text</label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={5}
                placeholder="Paste the post you want Soulflick to study structurally..."
                className="w-full bg-cinema-950 border border-cinema-750 rounded-lg p-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-cinema-400 block mb-1">Hook Mechanic</label>
              <input
                type="text"
                value={hookType}
                onChange={(e) => setHookType(e.target.value)}
                placeholder="e.g., Contrarian Reversal, Specific Number, BTS Mystery"
                className="w-full bg-cinema-950 border border-cinema-750 rounded-lg p-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-cinema-400 block mb-1">Structural Anatomy Notes</label>
              <input
                type="text"
                value={structureNotes}
                onChange={(e) => setStructureNotes(e.target.value)}
                placeholder="e.g., Hook -> Contrasting Fact -> Emotional Punchline"
                className="w-full bg-cinema-950 border border-cinema-750 rounded-lg p-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-cinema-800 text-cinema-300 text-xs hover:bg-cinema-750"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 rounded-xl bg-gold-500 text-cinema-950 font-bold text-xs hover:bg-gold-400"
              >
                Save to Vault
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
