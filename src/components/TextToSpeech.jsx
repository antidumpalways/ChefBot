"use client";

import { PlayIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

const ControlButton = ({ onClick, children, ariaLabel, disabled }) => (
  <button
    onClick={onClick}
    className="btn btn-circle btn-ghost text-gray-600 hover:bg-gray-200 disabled:opacity-40"
    aria-label={ariaLabel}
    disabled={disabled}
    title="Text-to-speech coming soon!"
  >
    {children}
  </button>
);

function TextToSpeech({ sentences, onHighlightChange }) {
  const handlePlayPause = () => {
    // Text-to-speech feature is coming soon
    alert("🔊 Text-to-speech feature is coming soon! Stay tuned for updates.");
  };

  const handleRestart = () => {
    // Text-to-speech feature is coming soon
    alert("🔊 Text-to-speech feature is coming soon! Stay tuned for updates.");
  };

  return (
    <div className="p-3 mb-6 border rounded-xl shadow-sm flex flex-col gap-2 animate-fadeIn"
    style={{
      backgroundColor: 'var(--bg-primary)',
      borderColor: 'var(--text-secondary)',
      opacity: 0.7
    }}>
      {/* Coming Soon Badge */}
      <div className="text-center mb-2">
        <span className="badge badge-outline text-xs"
        style={{
          borderColor: 'var(--accent)',
          color: 'var(--accent)'
        }}>
          🔊 Text-to-Speech Coming Soon
        </span>
      </div>
      
      {/* Progress Bar - Disabled */}
      <div className="w-full bg-gray-300 rounded-full h-1.5 opacity-50">
        <div 
          className="h-1.5 rounded-full transition-all duration-500 ease-linear" 
          style={{ 
            width: '0%',
            backgroundColor: 'var(--accent)'
          }}
        ></div>
      </div>
      
      {/* Controls - Disabled */}
      <div className="flex justify-center items-center gap-4">
        <ControlButton onClick={handlePlayPause} ariaLabel="Play (Coming Soon)" disabled={true}>
          <PlayIcon className="h-6 w-6" />
        </ControlButton>
        <ControlButton onClick={handleRestart} ariaLabel="Restart (Coming Soon)" disabled={true}>
          <ArrowPathIcon className="h-5 w-5" />
        </ControlButton>
      </div>
    </div>
  );
}

export default TextToSpeech;

