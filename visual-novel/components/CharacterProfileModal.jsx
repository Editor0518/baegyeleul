'use client';

import React, { useState } from 'react';
import { useGameContext } from '@/contexts/GameContext';
import { useCharacterProfile } from '@/hooks/useCharacterProfile';
import './CharacterProfileModal.css';

// 후보 이미지를 순서대로 시도 (기본 표정 파일이 없으면 다음 표정으로)
const StandingImage = ({ images, alt, className }) => {
  const [index, setIndex] = useState(0);
  if (index >= images.length) {
    return <div className={`${className} profile-no-image`}>?</div>;
  }
  return (
    <img
      src={images[index]}
      alt={alt}
      className={className}
      draggable={false}
      onError={() => setIndex(i => i + 1)}
    />
  );
};

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
  const selected = allProfiles.find(p => p.id === selectedId) || null;

  const renderStanding = (profile, seen, className) => (
    <StandingImage
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
      { label: '나이', value: profile.age },
    ].filter(b => b.value);

    return (
      <div className="profile-detail">
        <div className="profile-detail-standing">
          {renderStanding(profile, seen, 'profile-detail-image')}
        </div>

        <div className="profile-detail-info">
          <h3 className={`profile-detail-name ${seen ? '' : 'locked'}`}>
            {seen ? profile.name : '???'}
          </h3>

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
        <div className="profile-header">
          {selected && (
            <button className="profile-back-button" onClick={() => setSelectedId(null)}>
              ← 목록
            </button>
          )}
          <h2>인물도감</h2>
          <span className="profile-counter">{seenCount} / {allProfiles.length}</span>
          <button className="profile-close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="profile-content">
          {allProfiles.length === 0 ? (
            <div className="profile-empty">등록된 인물이 없습니다.</div>
          ) : selected ? (
            renderDetail(selected)
          ) : (
            <div className="profile-screen">
              {allProfiles.map((profile) => {
                const seen = isSeen(profile.id);
                return (
                  <button
                    key={profile.id}
                    className={`profile-panel ${seen ? 'seen' : 'locked'}`}
                    onClick={() => setSelectedId(profile.id)}
                  >
                    {renderStanding(profile, seen, 'profile-panel-image')}
                    <span className="profile-panel-name">{seen ? profile.name : '???'}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="profile-footer">
          <button className="profile-button" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterProfileModal;
