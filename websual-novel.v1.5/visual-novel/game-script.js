// Visual Novel Engine
class VisualNovelEngine {
    constructor() {
        this.storyData = null;
        this.currentScene = null;
        this.dialogueIndex = 0;
        this.gameState = {
            affection: {},
            flags: {},
            visitedScenes: []
        };
        this.audioContext = {
            bgm: null,
            musicEnabled: true
        };
        
        this.init();
    }

    async init() {
        // 스토리 데이터 로드
        try {
            const response = await fetch('storyData.json');
            this.storyData = await response.json();
            
            // 캐릭터 호감도 초기화 (캐릭터 ID 기반)
            if (this.storyData.characters) {
                Object.entries(this.storyData.characters).forEach(([charId, char]) => {
                    this.gameState.affection[charId] = char.initialAffection || 0;
                });
            }
        } catch (error) {
            console.error('스토리 데이터 로드 실패:', error);
        }

        this.bindEvents();
    }

    bindEvents() {
        // 타이틀 화면 버튼
        document.getElementById('startButton')?.addEventListener('click', () => this.startGame());
        document.getElementById('loadButton')?.addEventListener('click', () => this.showLoadModal());
        document.getElementById('titleMusicButton')?.addEventListener('click', (e) => this.toggleMusic(e.currentTarget));

        // 게임 헤더 버튼
        document.getElementById('saveButton')?.addEventListener('click', () => this.showSaveModal());
        document.getElementById('loadGameButton')?.addEventListener('click', () => this.showLoadModal());
        document.getElementById('musicButton')?.addEventListener('click', (e) => this.toggleMusic(e.currentTarget));
        document.getElementById('exitButton')?.addEventListener('click', () => this.exitToTitle());

        // 대화 진행
        document.getElementById('nextButton')?.addEventListener('click', () => this.nextDialogue());
        document.getElementById('dialogueBox')?.addEventListener('click', () => this.nextDialogue());

        // 모달 닫기
        document.getElementById('closeModal')?.addEventListener('click', () => this.hideModal());
        document.getElementById('saveLoadOverlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'saveLoadOverlay') this.hideModal();
        });

        // 엔딩 버튼
        document.getElementById('restartButton')?.addEventListener('click', () => this.startGame());
        document.getElementById('titleButton')?.addEventListener('click', () => this.showTitle());

        // 파일 가져오기/내보내기
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportSave());
        document.getElementById('importBtn')?.addEventListener('click', () => document.getElementById('fileInput').click());
        document.getElementById('fileInput')?.addEventListener('change', (e) => this.importSave(e));
    }

    startGame() {
        document.querySelector('.title-screen').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'block';
        document.getElementById('endingOverlay').style.display = 'none';
        
        // 게임 상태 초기화
        this.gameState.visitedScenes = [];
        
        // 첫 씬 로드
        if (this.storyData && this.storyData.storyScenes && this.storyData.storyScenes.length > 0) {
            this.loadScene(this.storyData.storyScenes[0].id);
        }
    }

    loadScene(sceneId) {
        const scene = this.storyData.storyScenes.find(s => s.id === sceneId);
        if (!scene) return;

        this.currentScene = scene;
        this.dialogueIndex = 0;
        this.gameState.visitedScenes.push(sceneId);

        // 배경 설정 (place ID로 이미지 찾기)
        if (scene.place && this.storyData.places && this.storyData.places[scene.place]) {
            const place = this.storyData.places[scene.place];
            const imagePath = `assets/places/${place.image}`;
            document.getElementById('backgroundImage').src = imagePath;
            
            // 장소 이름 설정
            document.getElementById('placeName').textContent = place.name;
        }

        // BGM 재생
        if (scene.music) {
            this.playBGM(scene.music);
        }

        // 첫 대사 표시
        this.showDialogue();
    }

    showDialogue(customDialogue = null) {
        // customDialogue가 있으면 사용 (reaction 표시용)
        const dialogue = customDialogue || this.currentScene.dialogues[this.dialogueIndex];
        if (!dialogue) {
            // 대사가 끝나면 선택지 또는 다음 씬
            this.handleSceneEnd();
            return;
        }

        // 대화 상자 표시
        document.getElementById('dialogueBox').style.display = 'flex';
        document.getElementById('choiceBox').style.display = 'none';

        // 화자 이름
        const character = this.storyData.characters[dialogue.speaker];
        const speakerName = character ? character.name : dialogue.speaker;
        document.getElementById('speakerName').textContent = speakerName;

        // 대사 텍스트
        document.getElementById('dialogueText').innerHTML = 
            dialogue.text + '<span class="next-button" id="nextButton"></span>';

        // 캐릭터 업데이트
        this.updateCharacters(dialogue.characters || []);

        // nextButton 이벤트 다시 바인딩
        document.getElementById('nextButton').addEventListener('click', (e) => {
            e.stopPropagation();
            this.nextDialogue();
        });
    }

    nextDialogue() {
        this.dialogueIndex++;
        this.showDialogue();
    }

    updateCharacters(characters) {
        const display = document.getElementById('characterDisplay');
        display.innerHTML = '';

        characters.forEach(charData => {
            const character = this.storyData.characters[charData.id];
            if (!character) return;

            const emotion = charData.emotion || 'default';
            const imageName = character.emotions[emotion] || character.emotions.default;
            const sprite = `assets/characters/${character.imageFolder}/${imageName}`;
            
            const charDiv = document.createElement('div');
            charDiv.className = 'character-sprite' + (charData.active ? ' active-character' : '');
            charDiv.innerHTML = `<img src="${sprite}" class="character-image sprite fade-in" alt="${character.name}">`;
            
            display.appendChild(charDiv);
        });
    }

    handleSceneEnd() {
        // reaction을 보여준 후라면 다음 씬으로 이동
        if (this.currentScene.tempReaction && this.currentScene.nextScene) {
            const nextScene = this.currentScene.nextScene;
            delete this.currentScene.tempReaction;
            delete this.currentScene.nextScene;
            this.loadScene(nextScene);
            return;
        }
        
        if (this.currentScene.choices && this.currentScene.choices.length > 0) {
            this.showChoices();
        } else if (this.currentScene.checkAffection) {
            // 엔딩 호감도 체크 씬: 호감도에 따라 엔딩 결정
            this.determineEnding();
        } else if (this.currentScene.next) {
            this.loadScene(this.currentScene.next);
        }
    }

    determineEnding() {
        const endingConfig = this.storyData.endingConfig;
        const thresholds = endingConfig.thresholds || {};
        
        // 각 캐릭터별 호감도 등급 판정
        const characterEndings = {};
        const charScores = [];

        for (const [charId, affectionValue] of Object.entries(this.gameState.affection)) {
            const character = this.storyData.characters[charId];
            if (!character) continue;

            let endingType = 'bad'; // 기본값
            
            if (affectionValue >= (thresholds.best || 999)) {
                endingType = 'best';
            } else if (affectionValue >= (thresholds.good || 50)) {
                endingType = 'good';
            } else if (affectionValue >= (thresholds.normal || 0)) {
                endingType = 'normal';
            }

            characterEndings[charId] = endingType;
            charScores.push({ charId, type: endingType, value: affectionValue });
        }

        // 정렬: best > good > normal > bad 순서로
        const typeRank = { 'best': 4, 'good': 3, 'normal': 2, 'bad': 1 };
        charScores.sort((a, b) => (typeRank[b.type] || 0) - (typeRank[a.type] || 0));

        let nextEndingId = null;

        // 1) Duo 엔딩 체크 (best 이상이 2명 이상)
        const bestChars = charScores.filter(c => c.type === 'best');
        if (bestChars.length >= 2 && endingConfig.duo && endingConfig.duo.length > 0) {
            const duoEndingId = this.buildEndingSceneId('duo', bestChars.map(c => c.charId));
            nextEndingId = duoEndingId;
        }

        // 2) 단일 캐릭터 엔딩 (best > good > normal)
        if (!nextEndingId && charScores.length > 0) {
            const topChar = charScores[0];
            const targetType = topChar.type;
            
            if (targetType !== 'bad' && endingConfig.characterEndings[topChar.charId]?.[targetType]) {
                nextEndingId = this.buildEndingSceneId(targetType, [topChar.charId]);
            }
        }

        // 3) 공통 엔딩 (normal ending)
        if (!nextEndingId && endingConfig.common?.normal) {
            nextEndingId = 'normal_ending';
        }

        // 기본값
        if (!nextEndingId) {
            nextEndingId = 'normal_ending';
        }

        this.loadScene(nextEndingId);
    }

    // 엔딩 장면 ID 생성 함수
    buildEndingSceneId(type, characters) {
        const t = (type || "").toString().trim().toLowerCase();
        const chars = (characters || []).map((c) => String(c).trim()).filter(Boolean);

        if (!t) return "";

        if (chars.length === 0) return `${t}_ending`;
        if (chars.length === 1) return `${t}_ending_${chars[0]}`;

        return `${t}_ending_${chars.join("_")}`;
    }

    showChoices() {
        document.getElementById('dialogueBox').style.display = 'none';
        document.getElementById('choiceBox').style.display = 'flex';

        const container = document.getElementById('choicesContainer');
        container.innerHTML = '';

        this.currentScene.choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-button';
            btn.innerHTML = `
                <span class="icon-choice-button"></span>
                <span class="choice-button-text">${choice.text}</span>
            `;
            btn.addEventListener('click', () => this.selectChoice(index));
            container.appendChild(btn);
        });
    }

    selectChoice(index) {
        const choice = this.currentScene.choices[index];
        
        // 선택지 숨기기
        document.getElementById('choiceBox').style.display = 'none';
        
        // 호감도 변경 (affectionChanges 사용)
        if (choice.affectionChanges) {
            Object.entries(choice.affectionChanges).forEach(([charId, value]) => {
                if (this.gameState.affection[charId] !== undefined) {
                    this.gameState.affection[charId] += value;
                    // 최소/최대 호감도 범위 제한
                    if (this.storyData.characters[charId]) {
                        const char = this.storyData.characters[charId];
                        this.gameState.affection[charId] = Math.max(
                            char.minAffection,
                            Math.min(char.maxAffection, this.gameState.affection[charId])
                        );
                    }
                }
            });
            this.updateAffectionDisplay();
        }

        // 플래그 설정
        if (choice.setFlag) {
            Object.keys(choice.setFlag).forEach(flag => {
                this.gameState.flags[flag] = choice.setFlag[flag];
            });
        }

        // reaction이 있으면 먼저 표시
        if (choice.reaction) {
            // 선택 후 반응을 임시 씬으로 처리
            this.currentScene.tempReaction = true;
            this.currentScene.nextScene = choice.next;
            const reactionDialogue = choice.reaction;
            
            // 반응 대사 표시
            this.showDialogue(reactionDialogue);
            
            // 다음 버튼 클릭 시 다음 씬으로 이동
            document.getElementById('nextButton').style.display = 'block';
        } else {
            // reaction이 없으면 바로 다음 씬 로드
            if (choice.next) {
                this.loadScene(choice.next);
            }
        }
    }

    showEnding(endingId) {
        // endingConfig에서 엔딩 정보 찾기
        const endingConfig = this.storyData.endingConfig;
        let ending = null;

        // 공통 엔딩 확인
        if (endingConfig.common[endingId]) {
            ending = {
                type: endingId,
                title: endingConfig.common[endingId].title,
                message: endingConfig.common[endingId].message
            };
        } else {
            // 캐릭터별 엔딩 확인
            for (const [charId, typeMap] of Object.entries(endingConfig.characterEndings || {})) {
                if (typeMap[endingId]) {
                    ending = {
                        type: endingId,
                        title: typeMap[endingId].title,
                        message: typeMap[endingId].message,
                        character: charId
                    };
                    break;
                }
            }
        }

        // Duo 엔딩 확인
        if (!ending && endingConfig.duo && Array.isArray(endingConfig.duo)) {
            const duoEnding = endingConfig.duo.find(d => {
                // duo 엔딩의 조건 확인
                if (Array.isArray(d.characters)) {
                    return d.characters.length > 0;
                }
                return false;
            });
            if (duoEnding) {
                ending = {
                    type: 'duo',
                    title: duoEnding.title,
                    message: duoEnding.message,
                    characters: duoEnding.characters
                };
            }
        }

        if (!ending) return;

        document.getElementById('gameContainer').style.display = 'none';
        document.getElementById('endingOverlay').style.display = 'flex';

        document.getElementById('endingType').textContent = ending.type;
        document.getElementById('endingTitle').textContent = ending.title;
        document.getElementById('endingMessage').textContent = ending.message;

        // 최종 호감도 표시
        const affectionDiv = document.getElementById('finalAffection');
        affectionDiv.innerHTML = '';

        Object.entries(this.gameState.affection).forEach(([charId, value]) => {
            const character = this.storyData.characters[charId];
            if (!character) return;

            const maxAffection = character.maxAffection || 100;
            const percent = Math.round((value / maxAffection) * 100);
            
            affectionDiv.innerHTML += `
                <div class="affection-row">
                    <span class="char-name">${character.name}</span>
                    <div class="affection-bar-small">
                        <span class="affection-fill" style="width: ${percent}%; background: linear-gradient(90deg, #ff6b9d, #c44569);"></span>
                    </div>
                    <span class="affection-num">${value}</span>
                </div>
            `;
        });
    }

    updateAffectionDisplay() {
        const display = document.getElementById('affectionDisplay');
        const bars = document.getElementById('affectionBars');
        
        if (Object.keys(this.gameState.affection).length > 0) {
            display.style.display = 'block';
            bars.innerHTML = '';

            Object.entries(this.gameState.affection).forEach(([charId, value]) => {
                const character = this.storyData.characters[charId];
                if (!character) return;

                const maxAffection = character.maxAffection || 100;
                const percent = Math.round((value / maxAffection) * 100);
                
                bars.innerHTML += `
                    <div class="affection-item">
                        <span class="character-name">${character.name}</span>
                        <div class="affection-bar-container">
                            <div class="affection-bar" style="width: ${percent}%; background: linear-gradient(90deg, #ff6b9d, #c44569);"></div>
                        </div>
                        <span class="affection-value">${value}</span>
                    </div>
                `;
            });
        }
    }

    toggleMusic(button) {
        this.audioContext.musicEnabled = !this.audioContext.musicEnabled;
        
        if (this.audioContext.musicEnabled) {
            button.classList.remove('music-off');
            button.classList.add('music-on');
            if (this.audioContext.bgm) {
                this.audioContext.bgm.play();
            }
        } else {
            button.classList.remove('music-on');
            button.classList.add('music-off');
            if (this.audioContext.bgm) {
                this.audioContext.bgm.pause();
            }
        }
    }

    playBGM(src) {
        if (!this.audioContext.musicEnabled) return;

        if (this.audioContext.bgm) {
            this.audioContext.bgm.pause();
        }

        this.audioContext.bgm = new Audio(src);
        this.audioContext.bgm.loop = true;
        this.audioContext.bgm.play().catch(e => console.log('오디오 재생 실패:', e));
    }

    showSaveModal() {
        document.getElementById('modalTitle').textContent = '저장하기';
        this.showSaveLoadSlots('save');
    }

    showLoadModal() {
        document.getElementById('modalTitle').textContent = '불러오기';
        this.showSaveLoadSlots('load');
    }

    showSaveLoadSlots(mode) {
        document.getElementById('saveLoadOverlay').style.display = 'flex';
        
        const container = document.getElementById('slotsContainer');
        container.innerHTML = '';

        for (let i = 1; i <= 5; i++) {
            const saveData = localStorage.getItem(`save_slot_${i}`);
            const slotDiv = document.createElement('div');
            
            if (saveData) {
                const data = JSON.parse(saveData);
                slotDiv.className = 'slot-item filled';
                slotDiv.innerHTML = `
                    <div class="slot-header">
                        <span class="slot-number">슬롯 ${i}</span>
                        <div class="slot-actions">
                            <button class="action-btn delete-btn" data-slot="${i}"></button>
                        </div>
                    </div>
                    <div class="slot-info">
                        <div class="scene-name">${data.sceneName || '장면'}</div>
                        <div class="timestamp">${new Date(data.timestamp).toLocaleString('ko-KR')}</div>
                    </div>
                `;
                
                slotDiv.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('delete-btn')) {
                        if (mode === 'save') {
                            this.saveToSlot(i);
                        } else {
                            this.loadFromSlot(i);
                        }
                    }
                });

                slotDiv.querySelector('.delete-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteSlot(i);
                });
            } else {
                slotDiv.className = 'slot-item empty';
                slotDiv.innerHTML = `
                    <div class="slot-header">
                        <span class="slot-number">슬롯 ${i}</span>
                    </div>
                    <div class="empty-content">
                        <span class="empty-text">비어있음</span>
                    </div>
                `;
                
                if (mode === 'save') {
                    slotDiv.addEventListener('click', () => this.saveToSlot(i));
                }
            }
            
            container.appendChild(slotDiv);
        }
    }

    saveToSlot(slot) {
        const saveData = {
            sceneId: this.currentScene.id,
            sceneName: this.currentScene.place ? (this.storyData.places[this.currentScene.place]?.name || '장면') : '장면',
            dialogueIndex: this.dialogueIndex,
            gameState: this.gameState,
            timestamp: Date.now()
        };

        localStorage.setItem(`save_slot_${slot}`, JSON.stringify(saveData));
        this.showSaveLoadSlots('save');
    }

    loadFromSlot(slot) {
        const saveData = localStorage.getItem(`save_slot_${slot}`);
        if (!saveData) return;

        const data = JSON.parse(saveData);
        
        // 게임 상태 복원 (호감도, 플래그 등)
        this.gameState = {
            affection: data.gameState?.affection || {},
            flags: data.gameState?.flags || {},
            visitedScenes: data.gameState?.visitedScenes || []
        };
        
        this.dialogueIndex = data.dialogueIndex || 0;

        this.hideModal();
        this.loadScene(data.sceneId);
        this.updateAffectionDisplay();
    }

    deleteSlot(slot) {
        localStorage.removeItem(`save_slot_${slot}`);
        this.showSaveLoadSlots(document.getElementById('modalTitle').textContent === '저장하기' ? 'save' : 'load');
    }

    exportSave() {
        const saveData = {
            gameState: this.gameState,
            sceneId: this.currentScene?.id,
            dialogueIndex: this.dialogueIndex,
            timestamp: Date.now()
        };

        const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `save_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importSave(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // 게임 상태 복원 (호감도, 플래그 등)
                this.gameState = {
                    affection: data.gameState?.affection || {},
                    flags: data.gameState?.flags || {},
                    visitedScenes: data.gameState?.visitedScenes || []
                };
                
                this.dialogueIndex = data.dialogueIndex || 0;
                
                this.hideModal();
                this.loadScene(data.sceneId);
                this.updateAffectionDisplay();
            } catch (error) {
                console.error('파일 로드 실패:', error);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    hideModal() {
        document.getElementById('saveLoadOverlay').style.display = 'none';
    }

    exitToTitle() {
        if (confirm('타이틀 화면으로 돌아가시겠습니까?')) {
            this.showTitle();
        }
    }

    showTitle() {
        document.querySelector('.title-screen').style.display = 'flex';
        document.getElementById('gameContainer').style.display = 'none';
        document.getElementById('endingOverlay').style.display = 'none';
        
        if (this.audioContext.bgm) {
            this.audioContext.bgm.pause();
        }
    }
}

// 엔진 초기화
const game = new VisualNovelEngine();
