'use client';

import React, { useState } from 'react';
import { useCGAlbum } from '@/hooks/useCGAlbum';
import './CGAlbumModal.css';

const CGAlbumModal = ({ onClose }) => {
  const { allCGs, isViewed } = useCGAlbum();
  const [selectedCG, setSelectedCG] = useState(null);

  const viewedCount = allCGs.filter(cg => isViewed(cg)).length;

  const handleThumbnailClick = (filename) => {
    if (isViewed(filename)) {
      setSelectedCG(filename);
    }
  };

  return (
    <div className="cg-album-overlay" onClick={onClose}>
      <div id="cg-album-modal" className="cg-album-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cg-album-header">
          <h2>CG 앨범</h2>
          <span className="cg-album-counter">{viewedCount} / {allCGs.length}</span>
          <button className="cg-album-close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="cg-album-content">
          {allCGs.length === 0 ? (
            <div className="cg-album-empty">등록된 CG가 없습니다.</div>
          ) : (
            <div className="cg-album-grid">
              {allCGs.map((filename) => (
                <div
                  key={filename}
                  className={`cg-album-item ${isViewed(filename) ? 'viewed' : 'locked'}`}
                  onClick={() => handleThumbnailClick(filename)}
                >
                  {isViewed(filename) ? (
                    <img
                      src={`assets/cutscenes/${filename}`}
                      alt={filename}
                      className="cg-thumbnail"
                    />
                  ) : (
                    <div className="cg-locked">
                      <span className="cg-locked-icon">?</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cg-album-footer">
          <button className="cg-album-button" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>

      {selectedCG && (
        <div className="cg-fullscreen-overlay" onClick={(e) => { e.stopPropagation(); setSelectedCG(null); }}>
          <img
            src={`assets/cutscenes/${selectedCG}`}
            alt={selectedCG}
            className="cg-fullscreen-image"
          />
        </div>
      )}
    </div>
  );
};

export default CGAlbumModal;
