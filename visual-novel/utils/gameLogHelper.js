// gameLogHelper.js - 게임 로그 관리 유틸리티

/**
 * 로그 항목 생성
 * @param {string} type - 로그 타입 ('dialogue' | 'choice')
 * @param {Object} data - 로그 데이터
 * @returns {Object} 로그 항목
 */
export function createLogEntry(type, data) {
    const timestamp = Date.now();

    if (type === 'dialogue') {
        return {
            type: 'dialogue',
            timestamp,
            speaker: data.speaker || 'narrator',
            text: data.text || '',
            sceneId: data.sceneId || '',
        };
    }

    if (type === 'choice') {
        return {
            type: 'choice',
            timestamp,
            text: data.text || '',
            sceneId: data.sceneId || '',
        };
    }

    return null;
}

/**
 * 로그를 UI 표시용으로 포맷
 * @param {Array} logEntries - 로그 항목 배열
 * @param {Object} characters - 캐릭터 정보
 * @returns {Array} 포맷된 로그 배열
 */
export function formatLogForDisplay(logEntries, characters) {
    if (!Array.isArray(logEntries)) return [];

    return logEntries.map(entry => {
        if (entry.type === 'dialogue') {
            const speakerName = getSpeakerName(entry.speaker, characters);
            return {
                ...entry,
                speakerName,
                displayText: entry.text,
            };
        }

        if (entry.type === 'choice') {
            return {
                ...entry,
                displayText: `▶ ${entry.text}`,
            };
        }

        return entry;
    });
}

/**
 * 화자 이름 가져오기
 */
function getSpeakerName(speakerId, characters) {
    if (!speakerId) return '알 수 없음';

    if (speakerId === 'narrator') return '나레이터';
    if (speakerId === 'me' || speakerId === 'player') return '나';

    const character = characters?.[speakerId];
    return character?.name || speakerId;
}

/**
 * 로그를 시간순으로 정렬
 */
export function sortLogsByTime(logEntries, ascending = true) {
    if (!Array.isArray(logEntries)) return [];

    return [...logEntries].sort((a, b) => {
        return ascending ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
    });
}

/**
 * 최근 N개의 로그 가져오기
 */
export function getRecentLogs(logEntries, count) {
    if (!Array.isArray(logEntries)) return [];

    const sorted = sortLogsByTime(logEntries, false);
    return sorted.slice(0, count);
}
