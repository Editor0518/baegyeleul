'use client';

import React, { useState } from 'react';
import { useCGAlbum } from '@/hooks/useCGAlbum';
import './CGAlbumModal.css';

const CGAlbumModal = ({ onClose }) => {
  const { allCGs, isViewed } = useCGAlbum();
  const [selectedCG, setSelectedCG] = useState(null);

  const viewedCount = allCGs.filter(cg => isViewed(cg)).length;

  const handleThumbnailClick = (cg) => {
    if (isViewed(cg)) {
      setSelectedCG(cg);
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
              {allCGs.map((cg) => {
                const viewed = isViewed(cg);
                return (
                  <div key={cg.id} className="cg-album-entry">
                    <div
                      className={`cg-album-item ${viewed ? 'viewed' : 'locked'}`}
                      onClick={() => handleThumbnailClick(cg)}
                    >
                      {viewed ? (
                        <img
                          src={`assets/cutscenes/${cg.image}`}
                          alt={cg.name || cg.id}
                          className="cg-thumbnail"
                        />
                      ) : (
                        <div className="cg-locked">
                          <span className="cg-locked-icon">?</span>
                        </div>
                      )}
                    </div>
                    <div className={`cg-album-name ${viewed ? '' : 'locked'}`}>
                      {viewed ? (cg.name || cg.id) : '???'}
                    </div>
                  </div>
                );
              })}
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
            src={`assets/cutscenes/${selectedCG.image}`}
            alt={selectedCG.name || selectedCG.id}
            className="cg-fullscreen-image"
          />
        </div>
      )}
    </div>
  );
};

export default CGAlbumModal;
