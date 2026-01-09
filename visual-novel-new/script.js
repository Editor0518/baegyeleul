// ===== 비주얼 노벨 엔진 =====

class VisualNovelEngine {
    constructor() {
        this.story = null;
        this.currentScene = null;
        this.currentDialogueIndex = 0;
        this.gameState = {
            affection: {},
            choices: [],
            history: [],
            visitedScenes: new Set(),
            flags: {}
        };
        this.isMusicEnabled = true;
        this.bgmPlayer = document.getElementById('bgmPlayer');
        this.currentMode = null; // 'save' or 'load'
        
        this.init();
    }

    async init() {
        // 스토리 데이터 로드
        try {
            const response = await fetch('story.json');
            this.story = await response.json();
            this.setupEventListeners();
            this.showTitle();
        } catch (error) {
            console.error('스토리 데이터 로드 실패:', error);
            alert('게임 데이터를 불러오는데 실패했습니다.');
        }
    }

    setupEventListeners() {
        // 타이틀 화면
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('titleLoadButton').addEventListener('click', () => {
            this.currentMode = 'load';
            this.showSaveLoadModal();
        });
        document.getElementById('titleMusicButton').addEventListener('click', () => this.toggleMusic());

        // 게임 화면
        document.getElementById('saveButton').addEventListener('click', () => {
            this.currentMode = 'save';
            this.showSaveLoadModal();
        });
        document.getElementById('loadButton').addEventListener('click', () => {
            this.currentMode = 'load';
            this.showSaveLoadModal();
        });
        document.getElementById('musicButton').addEventListener('click', () => this.toggleMusic());
        document.getElementById('exitButton').addEventListener('click', () => this.exitToTitle());
        
        // 다음 버튼 (전체 대화창 클릭)
        document.getElementById('dialogueBox').addEventListener('click', () => this.nextDialogue());

        // 세이브/로드 모달
        document.getElementById('closeModal').addEventListener('click', () => this.closeSaveLoadModal());
        document.getElementById('exportSaveBtn').addEventListener('click', () => this.exportSave());
        document.getElementById('importSaveBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
        document.getElementById('fileInput').addEventListener('change', (e) => this.importSave(e));

        // 엔딩 화면
        document.getElementById('restartButton').addEventListener('click', () => this.startGame());
        document.getElementById('toTitleButton').addEventListener('click', () => this.showTitle());

        // 확인 대화상자
        document.getElementById('confirmNo').addEventListener('click', () => this.hideConfirmDialog());
    }

    // ===== 화면 전환 =====
    showTitle() {
        document.getElementById('titleScreen').style.display = 'flex';
        document.getElementById('gameContainer').style.display = 'none';
        document.getElementById('endingScreen').style.display = 'none';
        
        this.playBGM(this.story?.titleMusic || '');
    }

    hideTitle() {
        document.getElementById('titleScreen').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'block';
    }

    showEnding(endingId) {
        const ending = this.story.endings.find(e => e.id === endingId);
        if (!ending) {
            console.error('엔딩을 찾을 수 없습니다:', endingId);
            return;
        }

        document.getElementById('gameContainer').style.display = 'none';
        document.getElementById('endingScreen').style.display = 'flex';
        
        document.getElementById('endingBadge').textContent = ending.type || 'ENDING';
        document.getElementById('endingTitle').textContent = ending.title;
        document.getElementById('endingMessage').textContent = ending.message;

        // 최종 호감도 표시
        const summaryHTML = Object.entries(this.gameState.affection).map(([char, value]) => `
            <div class="affection-row">
                <span class="char-name">${char}</span>
                <span class="affection-bar-small">
                    <span class="affection-fill" style="width: ${value}%; background: ${this.getAffectionColor(value)};"></span>
                </span>
                <span class="affection-num">${value}</span>
            </div>
        `).join('');
        document.getElementById('affectionSummary').innerHTML = summaryHTML;

        if (ending.music) {
            this.playBGM(ending.music);
        }
    }

    // ===== 게임 시작 및 진행 =====
    startGame() {
        this.resetGameState();
        this.hideTitle();
        document.getElementById('endingScreen').style.display = 'none';
        this.loadScene(this.story.startScene);
    }

    resetGameState() {
        this.currentDialogueIndex = 0;
        this.gameState = {
            affection: {},
            choices: [],
            history: [],
            visitedScenes: new Set(),
            flags: {}
        };

        // 캐릭터 호감도 초기화
        if (this.story.characters) {
            this.story.characters.forEach(char => {
                this.gameState.affection[char.name] = char.initialAffection || 0;
            });
        }
    }

    loadScene(sceneId) {
        const scene = this.story.scenes.find(s => s.id === sceneId);
        if (!scene) {
            console.error('씬을 찾을 수 없습니다:', sceneId);
            return;
        }

        this.currentScene = scene;
        this.currentDialogueIndex = 0;
        this.gameState.visitedScenes.add(sceneId);

        // 배경 설정
        const bgImage = document.getElementById('backgroundImage');
        if (scene.background) {
            bgImage.src = scene.background;
            bgImage.style.display = 'block';
        }

        // 장소 표시
        if (scene.place) {
            document.getElementById('placeName').textContent = scene.place;
        }

        // BGM 재생
        if (scene.music) {
            this.playBGM(scene.music);
        }

        // 컷신 처리
        if (scene.cutscene) {
            this.showCutscene(scene.cutscene);
            return;
        }

        // 첫 대사 표시
        this.showDialogue();
        this.updateAffectionDisplay();
    }

    showDialogue() {
        const dialogue = this.currentScene.dialogues[this.currentDialogueIndex];
        
        if (!dialogue) {
            // 대사가 끝나면 선택지 또는 다음 씬으로
            if (this.currentScene.choices && this.currentScene.choices.length > 0) {
                this.showChoices();
            } else if (this.currentScene.next) {
                this.loadScene(this.currentScene.next);
            } else if (this.currentScene.ending) {
                this.showEnding(this.currentScene.ending);
            }
            return;
        }

        // 화자 표시
        document.getElementById('speakerName').textContent = dialogue.speaker || '';
        document.getElementById('dialogueText').innerHTML = dialogue.text + '<span class="next-button" id="nextButton"></span>';

        // 캐릭터 표시
        this.updateCharacters(dialogue.characters || []);

        // 대화창 표시
        document.getElementById('dialogueBox').style.display = 'flex';
        document.getElementById('choiceBox').style.display = 'none';
    }

    nextDialogue() {
        // 선택지가 표시중이면 무시
        if (document.getElementById('choiceBox').style.display === 'flex') {
            return;
        }

        this.currentDialogueIndex++;
        this.showDialogue();
    }

    showChoices() {
        document.getElementById('dialogueBox').style.display = 'none';
        document.getElementById('choiceBox').style.display = 'flex';

        const container = document.getElementById('choicesContainer');
        container.innerHTML = this.currentScene.choices.map((choice, index) => `
            <button class="choice-button" onclick="game.selectChoice(${index})">
                <span class="icon-choice-button"></span>
                <span class="choice-button-text">${choice.text}</span>
            </button>
        `).join('');
    }

    selectChoice(index) {
        const choice = this.currentScene.choices[index];
        this.gameState.choices.push(choice.id);

        // 호감도 변경
        if (choice.affection) {
            Object.entries(choice.affection).forEach(([char, value]) => {
                this.gameState.affection[char] = (this.gameState.affection[char] || 0) + value;
                this.gameState.affection[char] = Math.max(0, Math.min(100, this.gameState.affection[char]));
            });
        }

        // 플래그 설정
        if (choice.setFlag) {
            Object.entries(choice.setFlag).forEach(([flag, value]) => {
                this.gameState.flags[flag] = value;
            });
        }

        // 다음 씬으로
        if (choice.next) {
            this.loadScene(choice.next);
        }
    }

    // ===== 캐릭터 관리 =====
    updateCharacters(characters) {
        const container = document.getElementById('characterDisplay');
        container.innerHTML = '';

        characters.forEach(char => {
            const charData = this.story.characters.find(c => c.id === char.id);
            if (!charData) return;

            const sprite = document.createElement('div');
            sprite.className = `character-sprite ${char.active ? 'active-character' : ''}`;
            sprite.innerHTML = `<img class="character-image sprite fade-in" src="${charData.sprites[char.expression || 'normal']}" alt="${charData.name}">`;
            container.appendChild(sprite);
        });
    }

    // ===== 호감도 =====
    updateAffectionDisplay() {
        const display = document.getElementById('affectionDisplay');
        if (Object.keys(this.gameState.affection).length === 0) {
            display.style.display = 'none';
            return;
        }

        display.style.display = 'block';
        const barsHTML = Object.entries(this.gameState.affection).map(([char, value]) => `
            <div class="affection-item">
                <span class="character-name">${char}</span>
                <div class="affection-bar-container">
                    <div class="affection-bar" style="width: ${value}%; background: ${this.getAffectionColor(value)};"></div>
                </div>
                <span class="affection-value">${value}</span>
            </div>
        `).join('');
        document.getElementById('affectionBars').innerHTML = barsHTML;
    }

    getAffectionColor(value) {
        if (value >= 80) return '#ff69b4';
        if (value >= 60) return '#ffa500';
        if (value >= 40) return '#ffff00';
        return '#90ee90';
    }

    // ===== 컷신 =====
    showCutscene(imagePath) {
        const container = document.getElementById('cutsceneContainer');
        const image = document.getElementById('cutsceneImage');
        
        image.src = imagePath;
        container.style.display = 'flex';
        
        image.onload = () => {
            image.classList.add('cutscene-image-loaded');
            setTimeout(() => {
                container.style.display = 'none';
                image.classList.remove('cutscene-image-loaded');
                this.showDialogue();
            }, 3000);
        };
    }

    // ===== BGM =====
    playBGM(src) {
        if (!this.isMusicEnabled || !src) return;

        if (this.bgmPlayer.src.endsWith(src)) return;

        this.bgmPlayer.src = src;
        this.bgmPlayer.play().catch(e => console.log('BGM 재생 실패:', e));
    }

    toggleMusic() {
        this.isMusicEnabled = !this.isMusicEnabled;
        
        const titleBtn = document.getElementById('titleMusicButton');
        const gameBtn = document.getElementById('musicButton');
        
        if (this.isMusicEnabled) {
            titleBtn.classList.remove('music-off');
            titleBtn.classList.add('music-on');
            gameBtn.classList.remove('music-off');
            gameBtn.classList.add('music-on');
            this.bgmPlayer.play().catch(e => console.log('BGM 재생 실패:', e));
        } else {
            titleBtn.classList.remove('music-on');
            titleBtn.classList.add('music-off');
            gameBtn.classList.remove('music-on');
            gameBtn.classList.add('music-off');
            this.bgmPlayer.pause();
        }
    }

    exitToTitle() {
        this.showConfirmDialog(
            '타이틀로 돌아가시겠습니까?',
            '저장하지 않은 진행상황은 사라집니다.',
            () => {
                this.showTitle();
                this.hideConfirmDialog();
            }
        );
    }

    // ===== 세이브/로드 =====
    showSaveLoadModal() {
        document.getElementById('modalTitle').textContent = this.currentMode === 'save' ? '저장하기' : '불러오기';
        document.getElementById('saveLoadModal').style.display = 'flex';
        this.renderSaveSlots();
    }

    closeSaveLoadModal() {
        document.getElementById('saveLoadModal').style.display = 'none';
    }

    renderSaveSlots() {
        const container = document.getElementById('slotsContainer');
        const slots = [];

        for (let i = 1; i <= 5; i++) {
            const saveData = this.getSaveSlot(i);
            slots.push(this.createSlotHTML(i, saveData));
        }

        container.innerHTML = slots.join('');
    }

    createSlotHTML(slotNumber, saveData) {
        if (!saveData) {
            return `
                <div class="slot-item empty" onclick="game.handleSlotClick(${slotNumber})">
                    <div class="slot-header">
                        <span class="slot-number">슬롯 ${slotNumber}</span>
                    </div>
                    <div class="empty-content">
                        <span class="empty-text">비어있음</span>
                    </div>
                </div>
            `;
        }

        return `
            <div class="slot-item filled" onclick="game.handleSlotClick(${slotNumber})">
                <div class="slot-header">
                    <span class="slot-number">슬롯 ${slotNumber}</span>
                    <div class="slot-actions">
                        <button class="action-btn" onclick="event.stopPropagation(); game.deleteSaveSlot(${slotNumber})"></button>
                    </div>
                </div>
                <div class="slot-info">
                    <div class="scene-name">${saveData.sceneName || '알 수 없음'}</div>
                    <div class="timestamp">${new Date(saveData.timestamp).toLocaleString('ko-KR')}</div>
                </div>
            </div>
        `;
    }

    handleSlotClick(slotNumber) {
        if (this.currentMode === 'save') {
            this.saveToSlot(slotNumber);
        } else {
            this.loadFromSlot(slotNumber);
        }
    }

    saveToSlot(slotNumber) {
        const saveData = {
            timestamp: Date.now(),
            sceneName: this.currentScene?.name || '알 수 없음',
            sceneId: this.currentScene?.id,
            dialogueIndex: this.currentDialogueIndex,
            gameState: JSON.parse(JSON.stringify(this.gameState))
        };

        localStorage.setItem(`vn_save_slot_${slotNumber}`, JSON.stringify(saveData));
        this.renderSaveSlots();
        this.showMessage('저장되었습니다!');
    }

    loadFromSlot(slotNumber) {
        const saveData = this.getSaveSlot(slotNumber);
        if (!saveData) {
            this.showMessage('저장 데이터가 없습니다.');
            return;
        }

        this.gameState = saveData.gameState;
        this.currentDialogueIndex = saveData.dialogueIndex;
        this.loadScene(saveData.sceneId);
        this.closeSaveLoadModal();
        this.hideTitle();
        this.showMessage('불러왔습니다!');
    }

    getSaveSlot(slotNumber) {
        const data = localStorage.getItem(`vn_save_slot_${slotNumber}`);
        return data ? JSON.parse(data) : null;
    }

    deleteSaveSlot(slotNumber) {
        this.showConfirmDialog(
            '삭제 확인',
            `슬롯 ${slotNumber}의 저장 데이터를 삭제하시겠습니까?`,
            () => {
                localStorage.removeItem(`vn_save_slot_${slotNumber}`);
                this.renderSaveSlots();
                this.hideConfirmDialog();
                this.showMessage('삭제되었습니다.');
            }
        );
    }

    exportSave() {
        const allSaves = {};
        for (let i = 1; i <= 5; i++) {
            const saveData = this.getSaveSlot(i);
            if (saveData) {
                allSaves[`slot_${i}`] = saveData;
            }
        }

        const dataStr = JSON.stringify(allSaves, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `visual-novel-save-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showMessage('파일로 저장되었습니다!');
    }

    importSave(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const saves = JSON.parse(e.target.result);
                Object.entries(saves).forEach(([key, saveData]) => {
                    const slotNumber = parseInt(key.split('_')[1]);
                    if (slotNumber >= 1 && slotNumber <= 5) {
                        localStorage.setItem(`vn_save_slot_${slotNumber}`, JSON.stringify(saveData));
                    }
                });
                this.renderSaveSlots();
                this.showMessage('불러오기 완료!');
            } catch (error) {
                console.error('파일 읽기 실패:', error);
                this.showMessage('파일을 읽을 수 없습니다.');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    // ===== UI 유틸리티 =====
    showMessage(text) {
        const message = document.createElement('div');
        message.className = 'save-message';
        message.textContent = text;
        message.style.top = '50%';
        message.style.left = '50%';
        message.style.transform = 'translate(-50%, -50%)';
        
        document.getElementById('saveLoadModal').appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 2000);
    }

    showConfirmDialog(title, message, onConfirm) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').innerHTML = message;
        document.getElementById('confirmDialog').style.display = 'flex';
        
        document.getElementById('confirmYes').onclick = onConfirm;
    }

    hideConfirmDialog() {
        document.getElementById('confirmDialog').style.display = 'none';
    }
}

// 전역 인스턴스 생성
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new VisualNovelEngine();
});
