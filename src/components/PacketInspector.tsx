import React, { useState } from 'react';
import { Terminal, Copy, Check, Trash2, X, RefreshCw } from 'lucide-react';
import { RawWsPacket } from '../types';

interface PacketInspectorProps {
  packets: RawWsPacket[];
  isOpen: boolean;
  onClose: () => void;
}

export const PacketInspector: React.FC<PacketInspectorProps> = ({
  packets,
  isOpen,
  onClose,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPacket, setSelectedPacket] = useState<RawWsPacket | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-950 text-slate-100 w-full max-w-4xl h-[600px] rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Bybit WebSocket Packet Inspector</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE STREAM
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Raw JSON payloads arriving from wss://stream.bybit.com/v5/public/spot
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content split pane */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Packet List */}
          <div className="w-full md:w-1/2 overflow-y-auto p-3 space-y-2 font-mono text-xs">
            {packets.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 opacity-50" />
                Waiting for incoming WebSocket packets...
              </div>
            ) : (
              packets.map((pkt) => {
                const isSelected = selectedPacket?.id === pkt.id;
                return (
                  <div
                    key={pkt.id}
                    onClick={() => setSelectedPacket(pkt)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/70 border-indigo-500/60 text-white'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-semibold text-indigo-400">{pkt.topic}</span>
                      <span>{pkt.timestamp}</span>
                    </div>
                    <div className="truncate text-slate-200">
                      {pkt.dataSummary}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                        {pkt.type}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Packet Details View */}
          <div className="w-full md:w-1/2 bg-slate-900/40 p-4 flex flex-col overflow-hidden font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="text-slate-400 font-semibold text-[11px] uppercase">
                {selectedPacket ? `Packet: ${selectedPacket.topic}` : 'Select a packet to inspect'}
              </span>
              {selectedPacket && (
                <button
                  onClick={() => handleCopy(selectedPacket.id, selectedPacket.rawJson)}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  {copiedId === selectedPacket.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950/80 rounded-lg p-3 text-slate-300 text-[11px] border border-slate-800/60">
              {selectedPacket ? (
                <pre className="whitespace-pre-wrap break-all leading-relaxed">
                  {JSON.stringify(JSON.parse(selectedPacket.rawJson), null, 2)}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-center px-4">
                  Click any packet on the left to see the complete Bybit payload.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>Buffer: Last {packets.length} messages</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-xs"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
