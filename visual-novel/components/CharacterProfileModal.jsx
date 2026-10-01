'use client';

import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { useGameContext } from '@/contexts/GameContext';
import { useCharacterProfile } from '@/hooks/useCharacterProfile';
import './CharacterProfileModal.css';

/**
 * 스탠딩 이미지의 구도 분석 (이미지 주소별로 한 번만 계산)
 * 캐릭터마다 그림 안에서 머리가 시작되는 높이가 달라서(키 차이 표현),
 * 투명하지 않은 픽셀을 찾아 머리 꼭대기와 얼굴의 가로 중심을 구함
 * - headTop: 머리 꼭대기 위치 (이미지 높이 대비 0~1)
 * - faceX: 머리 부분의 가로 중심 (이미지 너비 대비 0~1)
 */
const DEFAULT_FRAMING = { headTop: 0.05, faceX: 0.5 };
const framingCache = new Map();

const analyzeFraming = (img) => {
  const key = img.getAttribute('src');
  if (framingCache.has(key)) return framingCache.get(key);
  let framing = DEFAULT_FRAMING;
  try {
    const w = 140;
    const h = Math.round(w * img.naturalHeight / img.naturalWidth);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    const isOpaque = (x, y) => data[(y * w + x) * 4 + 3] > 32;

    let top = -1;
    for (let y = 0; y < h && top < 0; y++) {
      for (let x = 0; x < w; x++) {
        if (isOpaque(x, y)) { top = y; break; }
      }
    }

    if (top >= 0) {
      // 머리 꼭대기부터 이미지 높이의 12% 구간(머리 부분)의 좌우 끝으로 얼굴 중심 계산
      const headEnd = Math.min(h, top + Math.round(h * 0.12));
      let minX = w;
      let maxX = -1;
      for (let y = top; y < headEnd; y++) {
        for (let x = 0; x < w; x++) {
          if (isOpaque(x, y)) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
          }
        }
      }
      framing = {
        headTop: top / h,
        faceX: maxX >= 0 ? (minX + maxX + 1) / 2 / w : 0.5,
      };
    }
  } catch {
    // 캔버스를 읽을 수 없는 환경이면 기본 구도 사용
  }
  framingCache.set(key, framing);
  return framing;
};

// 후보 이미지를 순서대로 시도 (기본 표정 파일이 없으면 다음 표정으로)
// 이미지가 로드되면 구도를 분석해서 모든 캐릭터의 머리 위치가 같아지도록 배치
const StandingImage = ({ images, alt, className }) => {
  const [index, setIndex] = useState(0);
  const [framing, setFraming] = useState(() => framingCache.get(images[0]) || null);

  if (index >= images.length) {
    return <div className="profile-no-image">?</div>;
  }
  return (
    <img
      src={images[index]}
      alt={alt}
      className={`profile-standing ${className}`}
      draggable={false}
      style={{
        '--head-top': (framing || DEFAULT_FRAMING).headTop,
        '--face-x': (framing || DEFAULT_FRAMING).faceX,
        visibility: framing ? 'visible' : 'hidden',
      }}
      onLoad={(e) => setFraming(analyzeFraming(e.currentTarget))}
      onError={() => {
        setFraming(null);
        setIndex(i => i + 1);
      }}
    />
  );
};

// 모서리 덩굴 장식 (좌상단 기준, 나머지 모서리는 CSS로 뒤집어서 사용)
const CornerOrnament = ({ position }) => (
  <svg className={`profile-corner ${position}`} viewBox="0 0 56 56" fill="none" aria-hidden="true">
    <path d="M1 40V12C1 5.9 5.9 1 12 1H40" stroke="currentColor" strokeWidth="1" />
    <path d="M6 30V15C6 10 10 6 15 6H30" stroke="currentColor" strokeWidth="0.75" opacity="0.6" />
    <path d="M12 24C12 17.4 17.4 12 24 12" stroke="currentColor" strokeWidth="0.75" />
    <path d="M24 12C28 12 30 15 28 17C26.5 18.5 24 17.5 24.5 15.5" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" />
    <path d="M12 24C12 28 15 30 17 28C18.5 26.5 17.5 24 15.5 24.5" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" />
    <path d="M12 9L15 12L12 15L9 12Z" fill="currentColor" />
    <circle cx="44" cy="1" r="1.25" fill="currentColor" />
    <circle cx="1" cy="44" r="1.25" fill="currentColor" />
  </svg>
);

// 가운데 마름모가 있는 장식 구분선
const OrnamentDivider = () => (
  <div className="profile-divider" aria-hidden="true">
    <span className="profile-divider-line" />
    <span className="profile-divider-gem" />
    <span className="profile-divider-line" />
  </div>
);

/**
 * 인물도감 모달
 * - 목록: 스탠딩이 병풍처럼 이어진 패널, 스탠딩을 본 적 없는 캐릭터는 검은 실루엣
 * - 상세: 좌측 스탠딩, 우측 이름/기본정보/세부정보/한줄평
 * playState: 세부정보·한줄평 조건 판정에 쓸 진행 상태 { variables, affection, history, choiceHistory }
 */
const CharacterProfileModal = ({ onClose, playState }) => {
  const { gameInfo } = useGameContext();
  const { allProfiles, isSeen, getRevealedEntries } = useCharacterProfile();
  const [selectedId, setSelectedId] = useState(null);

  const seenCount = allProfiles.filter(p => isSeen(p.id)).length;
  const selectedIndex = allProfiles.findIndex(p => p.id === selectedId);
  const selected = selectedIndex >= 0 ? allProfiles[selectedIndex] : null;

  // 상세 화면에서 이전/다음 인물로 이동 (처음과 끝은 이어짐)
  const moveSelection = useCallback((step) => {
    if (selectedIndex < 0 || allProfiles.length === 0) return;
    const next = (selectedIndex + step + allProfiles.length) % allProfiles.length;
    setSelectedId(allProfiles[next].id);
  }, [selectedIndex, allProfiles]);

  // 키보드 좌우 화살표로도 이동
  useEffect(() => {
    if (!selected) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') moveSelection(-1);
      else if (e.key === 'ArrowRight') moveSelection(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, moveSelection]);

  // 목록의 이름 명판 높이를 가장 긴 명판 기준으로 통일
  // (명판은 액자마다 따로 배치되어 CSS만으로는 서로 높이를 맞출 수 없음)
  const screenRef = useRef(null);
  useLayoutEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;

    const equalizePlates = () => {
      const plates = [...screen.querySelectorAll('.profile-panel-name')];
      plates.forEach(plate => { plate.style.minHeight = ''; });
      const maxHeight = Math.max(0, ...plates.map(plate => plate.offsetHeight));
      plates.forEach(plate => { plate.style.minHeight = `${maxHeight}px`; });
    };

    equalizePlates();
    // 창 크기 변화(줄바꿈 변화)와 웹폰트 로드 후에도 다시 맞춤
    const observer = new ResizeObserver(equalizePlates);
    observer.observe(screen);
    document.fonts?.ready.then(equalizePlates);
    return () => observer.disconnect();
  }, [selected, allProfiles, isSeen]);

  const renderStanding = (profile, seen, className) => (
    <StandingImage
      key={profile.id}
      images={profile.images}
      alt={seen ? profile.name : '???'}
      className={`${className} ${seen ? '' : 'silhouette'}`}
    />
  );

  const renderDetail = (profile) => {
    const seen = isSeen(profile.id);
    const { infos, comment } = seen
      ? getRevealedEntries(profile.id, playState)
      : { infos: [], comment: null };
    const basics = [
      { label: '성별', value: profile.gender },
      { label: '국적', value: profile.nationality },
      // 숫자만 적힌 경우에만 "세"를 붙임 (예: 216 → 216세, "불명"은 그대로)
      { label: '나이', value: /^\d+$/.test(profile.age) ? `${profile.age}세` : profile.age },
    ].filter(b => b.value);

    return (
      <div className="profile-detail">
        <div className="profile-detail-standing profile-picture-frame">
          <div className="profile-picture-inner">
            {renderStanding(profile, seen, 'profile-detail-image')}
          </div>
        </div>

        <div className="profile-detail-info">
          <h3 className={`profile-detail-name ${seen ? '' : 'locked'}`}>
            {seen ? profile.name : '???'}
          </h3>
          <div className="profile-name-rule" aria-hidden="true" />

          {seen && (
            <>
              {basics.length > 0 && (
                <dl className="profile-basics">
                  {basics.map(b => (
                    <div key={b.label} className="profile-basic">
                      <dt>{b.label}</dt>
                      <dd>{b.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {profile.desc && <p className="profile-desc">{profile.desc}</p>}

              {infos.length > 0 && (
                <ul className="profile-infos">
                  {infos.map((info, i) => (
                    <li key={i}>{info.text}</li>
                  ))}
                </ul>
              )}

              {comment && (
                <div className="profile-comment">
                  <div className="profile-comment-label">
                    {gameInfo?.me ? `${gameInfo.me}의 한줄평` : '한줄평'}
                  </div>
                  <p className="profile-comment-text">{comment.text}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div id="character-profile-modal" className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-frame" aria-hidden="true" />
        <CornerOrnament position="tl" />
        <CornerOrnament position="tr" />
        <CornerOrnament position="bl" />
        <CornerOrnament position="br" />

        <div className="profile-header">
          <div className="profile-header-side" />
          <div className="profile-title">
            <h2>인물 도감</h2>
          </div>
          <div className="profile-header-side right">
            <span className="profile-counter">{seenCount} / {allProfiles.length}</span>
            <button className="profile-close-button" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>
        <OrnamentDivider />

        <div className="profile-content">
          {allProfiles.length === 0 ? (
            <div className="profile-empty">등록된 인물이 없습니다.</div>
          ) : selected ? (
            renderDetail(selected)
          ) : (
            <div className="profile-screen" ref={screenRef}>
              {allProfiles.map((profile) => {
                const seen = isSeen(profile.id);
                return (
                  <button
                    key={profile.id}
                    className={`profile-panel ${seen ? 'seen' : 'locked'}`}
                    onClick={() => setSelectedId(profile.id)}
                  >
                    <span className="profile-panel-frame profile-arch">
                      {renderStanding(profile, seen, 'profile-panel-image')}
                      <span className="profile-panel-caption">
                        <span className="profile-panel-name">{seen ? profile.name : '???'}</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <OrnamentDivider />
        <div className="profile-footer">
          {selected ? (
            <>
              <button className="profile-arrow-button" onClick={() => moveSelection(-1)} aria-label="이전 인물">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M15 5L8 12L15 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button className="profile-button" onClick={() => setSelectedId(null)}>
                목록으로
              </button>
              <button className="profile-arrow-button" onClick={() => moveSelection(1)} aria-label="다음 인물">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          ) : (
            <button className="profile-button" onClick={onClose}>
              닫기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterProfileModal;
