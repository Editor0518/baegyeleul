// Utility: Convert published XLSX (SheetJS workbook) into storyData structure used by the game
// This is extracted from converter/script.js for runtime use (no DOM dependencies)

const headerMap = {
  game_info: {
    "제목(title)": "title",
    "부제(subtitle)": "subtitle",
    "주인공(me)": "me",
    "배경음악(backgroundMusic)": "backgroundMusic",
  },
  characters: {
    "캐릭터ID(id)": "id",
    "이름(name)": "name",
    "색상(color)": "color",
    "초기호감도(initialAffection)": "initialAffection",
    "최저호감도(minAffection)": "minAffection",
    "최고호감도(maxAffection)": "maxAffection",
    "이미지폴더(imageFolder)": "imageFolder",
    "기본표정이미지(defaultImage)": "기본표정이미지(defaultImage)",
    "emotion1": "emotion1",
    "emotionImage1": "emotionImage1",
    "emotion2": "emotion2",
    "emotionImage2": "emotionImage2",
    "emotion3": "emotion3",
    "emotionImage3": "emotionImage3",
    "emotion4": "emotion4",
    "emotionImage4": "emotionImage4",
    "emotion5": "emotion5",
    "emotionImage5": "emotionImage5",
    "emotion6": "emotion6",
    "emotionImage6": "emotionImage6",
    "emotion7": "emotion7",
    "emotionImage7": "emotionImage7",
    "emotion8": "emotion8",
    "emotionImage8": "emotionImage8",
    "emotion9": "emotion9",
    "emotionImage9": "emotionImage9",
    "emotion10": "emotion10",
    "emotionImage10": "emotionImage10",
    "emotion11": "emotion11",
    "emotionImage11": "emotionImage11",
    "emotionimage11": "emotionimage11",
    "emotion12": "emotion12",
    "emotionImage12": "emotionImage12",
    "emotion13": "emotion13",
    "emotionImage13": "emotionImage13",
    "emotion14": "emotion14",
    "emotionImage14": "emotionImage14",
    "emotion15": "emotion15",
    "emotionImage15": "emotionImage15",
    "emotion16": "emotion16",
    "emotionImage16": "emotionImage16",
    "emotion17": "emotion17",
    "emotionImage17": "emotionImage17",
    "emotion18": "emotion18",
    "emotionImage18": "emotionImage18",
    "emotion19": "emotion19",
    "emotionImage19": "emotionImage19",
    "emotion20": "emotion20",
    "emotionImage20": "emotionImage20",
  },
  places: {
    "장소ID(id)": "id",
    "장소이름(name)": "name",
    "배경이미지(image)": "image",
    "배경색상(color)": "color",
  },
  scenes: {
    "씬ID(id)": "id",
    "씬종류(type)": "type",
    "장소ID(place)": "place",
    "다음씬ID(nextSceneId)": "nextSceneId",
    "컷씬이미지(cutsceneImage)": "cutsceneImage",
    "엔딩호감도체크(checkAffection)": "checkAffection",
    "배경음악(backgroundMusic)": "backgroundMusic",
  },
  dialogues: {
    "씬ID(sceneId)": "sceneId",
    "대사순서(order)": "order",
    "강조캐릭터(activeCharacters)": "activeCharacters",
    "말하는캐릭터(speaker)": "speaker",
    "대사텍스트(text)": "text",
    "명령어(command)": "command",
  },
  choices: {
    "씬ID(sceneId)": "sceneId",
    "선택지번호(choiceIndex)": "choiceIndex",
    "선택지텍스트(text)": "text",
    "반응강조캐릭터(reactionActiveCharacters)": "reactionActiveCharacters",
    "반응하는캐릭터(reactionSpeaker)": "reactionSpeaker",
    "반응텍스트(reactionText)": "reactionText",
    "표시캐릭터1(reactionChar_left)": "reactionChar_left",
    "표시캐릭터1표정(reactionEmotion_left)": "reactionEmotion_left",
    "표시캐릭터2(reactionChar_center)": "reactionChar_center",
    "표시캐릭터2표정(reactionEmotion_center)": "reactionEmotion_center",
    "표시캐릭터3(reactionChar_right)": "reactionChar_right",
    "표시캐릭터3표정(reactionEmotion_right)": "reactionEmotion_right",
    "다음씬ID(nextSceneId)": "nextSceneId",
    "affectioncharacter1": "affectioncharacter1",
    "affectionValue1": "affectionValue1",
    "affectioncharacter2": "affectioncharacter2",
    "affectionValue2": "affectionValue2",
    "affectioncharacter3": "affectioncharacter3",
    "affectionValue3": "affectionValue3",
    "affectioncharacter4": "affectioncharacter4",
    "affectionValue4": "affectionValue4",
    "affectioncharacter5": "affectioncharacter5",
    "affectionValue5": "affectionValue5",
    "affectioncharacter6": "affectioncharacter6",
    "affectionValue6": "affectionValue6",
    "affectioncharacter7": "affectioncharacter7",
    "affectionValue7": "affectionValue7",
    "affectioncharacter8": "affectioncharacter8",
    "affectionValue8": "affectionValue8",
    "affectioncharacter9": "affectioncharacter9",
    "affectionValue9": "affectionValue9",
    "affectioncharacter10": "affectioncharacter10",
    "affectionValue10": "affectionValue10",
    "표시조건(show_if)": "show_if",
    "명령어(command)": "command",
  },
  scene_characters: {
    "씬ID(sceneId)": "sceneId",
    "씬대사번호(lineOrder)": "lineOrder",
    "캐릭터1(character_left)": "character_left",
    "캐릭터1표정(emotion_left)": "emotion_left",
    "캐릭터2(character_center)": "character_center",
    "캐릭터2표정(emotion_center)": "emotion_center",
    "캐릭터3(character_right)": "character_right",
    "캐릭터3표정(emotion_right)": "emotion_right",
    "컷씬(cutscene)": "cutscene",
  },
  ending: {
    "씬ID(sceneId)": "sceneId",
    "캐릭터ID(characterId)": "characterId",
    "엔딩타입(endingType)": "endingType",
    "엔딩제목(title)": "title",
    "엔딩설명(message)": "message",
    "컷씬이미지(cutsceneImage)": "cutsceneImage",
  },
  ending_system: {
    "엔딩등급(rank)": "rank",
    "최소호감도(threshold)": "threshold",
  },
};

function sheetToJson(workbook, sheetName, map, xlsxUtils) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    console.warn(`[XLSX Debug] Sheet not found: ${sheetName}`);
    return [];
  }
  const json = xlsxUtils.sheet_to_json(sheet, { defval: "" });
  console.log(`[XLSX Debug] Sheet '${sheetName}' loaded. Rows: ${json.length}`);
  
  if (json.length > 0) {
    console.log(`[XLSX Debug] Sheet '${sheetName}' first row keys:`, Object.keys(json[0]));
    // 매핑된 첫 행 샘플 출력
    const mappedFirst = {};
    const row = json[0];
    for (const k in row) {
      const key = String(k).trim();
      const internalKey = map?.[key] || map?.[k] || key;
      mappedFirst[internalKey] = row[k];
    }
    console.log(`[XLSX Debug] Sheet '${sheetName}' mapped first row:`, mappedFirst);
  }

  return json.map((row, idx) => {
    const obj = { _rowNumber: idx + 2 };
    for (const k in row) {
      const key = String(k).trim();
      const internalKey = map?.[key] || map?.[k] || key;
      obj[internalKey] = row[k];
    }
    return obj;
  });
}

function normalizeEndingMeta(row) {
  let type = (row.endingType || "").toString().trim().toLowerCase();
  let charIdRaw = (row.characterId || "").toString().trim();
  const sceneIdRaw = (row.sceneId || "").toString().trim();

  if (type && (charIdRaw || type === "duo" || charIdRaw === "common")) {
    if (String(charIdRaw).trim().toLowerCase() === "common") {
      return { type, characters: [], isCommon: true, sceneIdRaw };
    }

    const chars = String(charIdRaw)
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    return { type, characters: chars, isCommon: false, sceneIdRaw };
  }

  const candidate = sceneIdRaw || charIdRaw;
  const s = (candidate || "").trim();
  if (!s) return { type: "", characters: [], isCommon: false, sceneIdRaw };

  const cleaned = s.replace(/^(ending|end)[-_]/i, "");

  const tokens = cleaned
    .split(/[_-\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const typeWords = ["bad", "normal", "good", "best", "duo"];

  if (tokens.includes("common")) {
    const t = type || tokens.find((x) => typeWords.includes(x)) || "";
    return { type: t, characters: [], isCommon: true, sceneIdRaw };
  }

  const typeCand = type || tokens.find((x) => typeWords.includes(x)) || "";

  const charTokens = tokens.filter((t) => !typeWords.includes(t));
  let chars = [];
  if (charTokens.length) {
    chars = charTokens
      .join(",")
      .split(/[,+/&]/)
      .map((c) => c.trim())
      .filter(Boolean);
  }

  return { type: typeCand, characters: chars, isCommon: false, sceneIdRaw };
}

function makeEndingSceneId(type, characters) {
  const t = (type || "").toString().trim().toLowerCase();
  const chars = (characters || []).map((c) => String(c).trim()).filter(Boolean);

  if (!t) return "";
  if (chars.length === 0) return `${t}_ending`;
  if (chars.length === 1) return `${t}_ending_${chars[0]}`;
  return `${t}_ending_${chars.join("_")}`;
}

function buildEndingSceneIdRemap(endingRows) {
  const remap = {};

  (endingRows || []).forEach((row) => {
    const meta = normalizeEndingMeta(row);
    if (!meta.type) return;

    const newId = makeEndingSceneId(meta.type, meta.characters);
    if (!newId) return;

    const oldId = (row.sceneId || "").toString().trim();

    if (oldId) remap[oldId] = newId;

    if (meta.characters.length === 0) {
      remap["ending"] = newId;
    }

    if (meta.characters.length === 1) {
      const ch = meta.characters[0];
      const aliases = new Set([
        `${ch}_ending`,
        `ending_${ch}`,
        `${meta.type}_${ch}_ending`,
        `${ch}_${meta.type}_ending`,
        `${meta.type}_ending_${ch}`,
      ]);
      aliases.forEach((a) => (remap[a] = newId));
    }
  });

  return remap;
}

function applySceneIdRemapToSheets(
  { scenesRows, dialoguesRows, choicesRows, sceneCharRows },
  remap
) {
  const mapId = (id) => {
    const key = (id || "").toString().trim();
    return remap[key] || id;
  };

  scenesRows.forEach((s) => {
    s.id = mapId(s.id);
    s.nextSceneId = mapId(s.nextSceneId);
  });

  dialoguesRows.forEach((d) => {
    d.sceneId = mapId(d.sceneId);
  });

  choicesRows.forEach((c) => {
    c.sceneId = mapId(c.sceneId);
    c.nextSceneId = mapId(c.nextSceneId);
  });

  sceneCharRows.forEach((r) => {
    r.sceneId = mapId(r.sceneId);
  });
}

function buildCharacters(rows) {
  const result = {};

  rows.forEach((r) => {
    if (!r.id) return;

    const emotions = {};
    const defaultKey = "기본표정이미지(defaultImage)";
    if (r[defaultKey]) emotions.default = r[defaultKey];

    // 동적으로 emotionN, emotionImageN 패턴 감지
    // emotion1부터 emotion20까지 확인 (중간에 빠진 번호도 체크)
    for (let i = 1; i <= 20; i++) {
      const name = r[`emotion${i}`];
      const img = r[`emotionImage${i}`];

      // 대소문자 구분 없이 emotionimage도 체크 (오타 대응)
      const imgLower = r[`emotionimage${i}`];
      const finalImg = img || imgLower;

      if (name && finalImg) {
        emotions[name.trim()] = finalImg.trim();
      }
    }

    if (!("default" in emotions)) emotions.default = "";

    // initialAffection이 "x"인 경우 호감도 공략 불가 캐릭터로 설정
    const affectionValue = r.initialAffection;
    const isNonPlayable = affectionValue === "x" || affectionValue === "X";

    result[r.id] = {
      id: r.id,
      name: r.name,
      color: r.color || "#ffffff",
      initialAffection: isNonPlayable ? 0 : Number(affectionValue || 0),
      minAffection: Number(r.minAffection ?? -999),
      maxAffection: Number(r.maxAffection ?? 999),
      imageFolder: r.imageFolder || "",
      emotions,
      nonPlayable: isNonPlayable, // 호감도 공략 불가 플래그
    };
  });

  return result;
}

function buildPlaces(rows) {
  const result = {};
  rows.forEach((r) => {
    if (!r.id) return;
    result[r.id] = {
      id: r.id,
      name: r.name,
      image: r.image || "",
      color: r.color || "",
    };
  });
  return result;
}

function expandLineOrder(value) {
  if (value === null || value === undefined) return [];
  const str = String(value).trim();
  if (!str) return [];

  const rangeMatch = str.match(/^(\d+)\s*[-~]\s*(\d+)$/);
  if (rangeMatch) {
    const start = Number(rangeMatch[1]);
    const end = Number(rangeMatch[2]);
    if (Number.isNaN(start) || Number.isNaN(end)) return [];
    const s = Math.min(start, end);
    const e = Math.max(start, end);
    const res = [];
    for (let i = s; i <= e; i++) res.push(i);
    return res;
  }

  if (/^\d+$/.test(str)) {
    const n = Number(str);
    if (Number.isNaN(n)) return [];
    return [n];
  }

  return [];
}

function buildScenes(sceneRows, dialogueRows, choiceRows, sceneCharRows) {
  console.log(`[XLSX Debug] buildScenes input - scenes: ${sceneRows.length}, dialogues: ${dialogueRows.length}, choices: ${choiceRows.length}`);
  const sceneMap = {};
  let lastPlace = "";

  const sceneOrder = [];
  sceneRows.forEach((s) => {
    if (!s.id) return;

    let place = s.place || "";
    if (!place) place = lastPlace;
    else lastPlace = place;

    sceneMap[s.id] = {
      id: s.id,
      type: (() => {
        const t = (s.type || "normal").toString().trim().toLowerCase();
        if (t === "주의" || t === "warning") return "warning";
        return t;
      })(),
      place,
      nextSceneId: s.nextSceneId || "",
      cutsceneImage: s.cutsceneImage || "",
      checkAffection:
        s.checkAffection === true ||
        String(s.checkAffection).trim().toLowerCase() === "true",
      backgroundMusic: s.backgroundMusic || "",
    };

    sceneOrder.push(s.id);
  });

  const defaultNextMap = {};
  for (let i = 0; i < sceneOrder.length - 1; i++) {
    defaultNextMap[sceneOrder[i]] = sceneOrder[i + 1];
  }

  const dialoguesByScene = {};
  dialogueRows.forEach((d) => {
    if (!d.sceneId) return;
    if (!dialoguesByScene[d.sceneId]) dialoguesByScene[d.sceneId] = [];
    dialoguesByScene[d.sceneId].push({
      order: Number(d.order || 0),
      speaker: d.speaker || "narrator",
      text: d.text || "",
      activeCharacters: d.activeCharacters || "",
      command: d.command || "",
    });
  });

  const choicesByScene = {};
  choiceRows.forEach((c) => {
    if (!c.sceneId) return;
    if (!choicesByScene[c.sceneId]) choicesByScene[c.sceneId] = [];

    const choiceObj = {
      text: c.text,
      next: c.nextSceneId || null,
      index: Number(c.choiceIndex || 0),
    };

    const aff = {};
    for (let i = 1; i <= 10; i++) {
      const charKey = c[`affectioncharacter${i}`];
      const valKey = c[`affectionValue${i}`];
      const charId = charKey ? String(charKey).trim() : "";
      const val = Number(valKey);
      if (charId && !Number.isNaN(val)) aff[charId] = val;
    }
    if (Object.keys(aff).length > 0) choiceObj.affectionChanges = aff;

    const reactionSpeaker = (c.reactionSpeaker || "").toString().trim();
    const reactionText = (c.reactionText || "").toString().trim();

    // reactionText가 비어있지 않을 때만 reaction 생성
    if (reactionText) {
      const reaction = {
        speaker: reactionSpeaker || "narrator",
        text: reactionText,
      };

      const reactionChars = [];
      const defs = [
        { pos: "left", ck: "reactionChar_left", ek: "reactionEmotion_left" },
        { pos: "center", ck: "reactionChar_center", ek: "reactionEmotion_center" },
        { pos: "right", ck: "reactionChar_right", ek: "reactionEmotion_right" },
      ];

      defs.forEach(({ pos, ck, ek }) => {
        const cid = c[ck];
        if (cid) {
          reactionChars.push({
            id: String(cid).trim(),
            emotion: (c[ek] || "default").toString().trim(),
            position: pos,
          });
        }
      });

      const activeIds = new Set();
      if (
        reactionSpeaker &&
        !["narrator", "me", "player"].includes(reactionSpeaker)
      ) {
        activeIds.add(reactionSpeaker);
      }
      if (c.reactionActiveCharacters) {
        String(c.reactionActiveCharacters)
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
          .forEach((id) => activeIds.add(id));
      }

      if (reactionChars.length > 0) {
        reaction.characters = reactionChars.map((ch) =>
          activeIds.has(ch.id) ? { ...ch, active: true } : ch
        );
      }

      choiceObj.reaction = reaction;
    }

    // show_if 조건 추가
    if (c.show_if) {
      choiceObj.show_if = c.show_if;
    }

    // command 추가
    if (c.command) {
      choiceObj.command = c.command;
    }

    choicesByScene[c.sceneId].push(choiceObj);
  });

  Object.values(choicesByScene).forEach((arr) =>
    arr.sort((a, b) => a.index - b.index)
  );

  const baseCharsByScene = {};
  const lineCharsByScene = {};
  const cutsceneLinesByScene = {};

  sceneCharRows.forEach((row) => {
    const sceneId = row.sceneId;
    if (!sceneId) return;

    const chars = [];
    const defs = [
      { pos: "left", ck: "character_left", ek: "emotion_left" },
      { pos: "center", ck: "character_center", ek: "emotion_center" },
      { pos: "right", ck: "character_right", ek: "emotion_right" },
    ];

    defs.forEach((d) => {
      const cid = row[d.ck];
      if (cid) {
        chars.push({
          id: cid,
          emotion: row[d.ek] || "default",
          position: d.pos,
        });
      }
    });

    const cutVal = row.cutscene;
    const isCutscene =
      cutVal === 1 ||
      cutVal === "1" ||
      String(cutVal).trim().toLowerCase() === "true";

    const orders = expandLineOrder(row.lineOrder);

    if (!orders.length) {
      baseCharsByScene[sceneId] = chars;
      if (isCutscene) {
        if (!cutsceneLinesByScene[sceneId]) cutsceneLinesByScene[sceneId] = {};
        cutsceneLinesByScene[sceneId].__all = true;
      }
      return;
    }

    if (!lineCharsByScene[sceneId]) lineCharsByScene[sceneId] = {};
    if (!cutsceneLinesByScene[sceneId]) cutsceneLinesByScene[sceneId] = {};

    orders.forEach((ord) => {
      lineCharsByScene[sceneId][ord] = chars;
      if (isCutscene) cutsceneLinesByScene[sceneId][ord] = true;
    });
  });

  const storyScenes = [];

  Object.values(sceneMap).forEach((scene) => {
    const hasChoices = (choicesByScene[scene.id] || []).length > 0;

    // scene.type이 비어있거나 잘못 입력된 경우, choices가 존재하면 자동으로 choice로 보정
    const effectiveType = scene.type || (hasChoices ? "choice" : "normal");

    const base = { id: scene.id, type: hasChoices ? "choice" : effectiveType };

    if (scene.place) base.place = scene.place;
    if (scene.cutsceneImage) base.cutsceneImage = scene.cutsceneImage;
    if (scene.checkAffection) base.checkAffection = true;
    if (scene.backgroundMusic) base.backgroundMusic = scene.backgroundMusic;

    const ds = dialoguesByScene[scene.id] || [];
    const lineMap = lineCharsByScene[scene.id] || {};
    const cutMap = cutsceneLinesByScene[scene.id] || {};
    const sceneCutAll = !!cutMap.__all;

    const hasBaseChars = Object.prototype.hasOwnProperty.call(
      baseCharsByScene,
      scene.id
    );
    const baseChars = hasBaseChars ? baseCharsByScene[scene.id] : null;

    const builtDialogues = ds.map((d) => {
      const dlg = { speaker: d.speaker, text: d.text };

      const hasOverride = Object.prototype.hasOwnProperty.call(
        lineMap,
        d.order
      );
      const overrideChars = hasOverride ? lineMap[d.order] : undefined;

      if (hasOverride) dlg.characters = overrideChars || [];
      else if (baseChars && baseChars.length) dlg.characters = baseChars;

      if (sceneCutAll || cutMap[d.order]) dlg.cutscene = true;

      const activeIds = new Set();
      if (d.speaker && !["narrator", "me", "player"].includes(d.speaker)) {
        activeIds.add(String(d.speaker).trim());
      }
      if (d.activeCharacters) {
        String(d.activeCharacters)
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
          .forEach((id) => activeIds.add(id));
      }

      if (dlg.characters && dlg.characters.length) {
        dlg.characters = dlg.characters.map((ch) =>
          activeIds.has(ch.id) ? { ...ch, active: true } : ch
        );
      }

      // command 추가
      if (d.command) {
        dlg.command = d.command;
      }

      return dlg;
    });

    base.dialogues = builtDialogues;

    if (hasChoices) {
      base.choices = choicesByScene[scene.id] || [];
      base.type = "choice";
    }

    const rawNext = scene.nextSceneId;
    const explicitNext = rawNext == null ? "" : String(rawNext).trim();
    if (explicitNext) base.next = explicitNext;
    else if (defaultNextMap[scene.id]) base.next = defaultNextMap[scene.id];

    storyScenes.push(base);
  });

  console.log(`[XLSX Debug] buildScenes output - final storyScenes length: ${storyScenes.length}`);
  return storyScenes;
}

function buildEndingConfig(endingSystemRows, endingConfigRows) {
  const thresholds = {};
  (endingSystemRows || []).forEach((row) => {
    const rank = (row.rank || "").toString().trim();
    const t = Number(row.threshold);
    if (rank && !Number.isNaN(t)) thresholds[rank] = t;
  });

  const common = {};
  const duo = [];
  const characterEndings = {};

  (endingConfigRows || []).forEach((row) => {
    const meta = normalizeEndingMeta(row);
    const type = meta.type;
    const characters = meta.characters;
    const isCommon = meta.isCommon;

    if (!type) return;

    if (isCommon || characters.length === 0) {
      common[type] = {
        title: row.title || "",
        message: row.message || "",
      };
      return;
    }

    if (type === "duo" || characters.length > 1) {
      duo.push({
        characters,
        title: row.title || "",
        message: row.message || "",
      });
      return;
    }

    const charId = characters[0];
    if (!characterEndings[charId]) characterEndings[charId] = {};
    characterEndings[charId][type] = {
      title: row.title || "",
      message: row.message || "",
    };
  });

  return { thresholds, common, duo, characterEndings };
}

export function convertXlsxToStoryData(arrayBuffer, XLSX) {
  if (!arrayBuffer) throw new Error("arrayBuffer is required");
  if (!XLSX || !XLSX.read) throw new Error("XLSX (SheetJS) is required");

  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
  const utils = XLSX.utils;

  const gameInfoRows = sheetToJson(workbook, "game_info", headerMap.game_info, utils);
  const gi = gameInfoRows[0] || {};
  const gameInfo = {
    title: (gi.title || "").toString(),
    subtitle: (gi.subtitle || "").toString(),
    me: (gi.me || "").toString(),
    backgroundMusic: (gi.backgroundMusic || "").toString(),
  };

  const characters = buildCharacters(
    sheetToJson(workbook, "characters", headerMap.characters, utils)
  );
  const places = buildPlaces(
    sheetToJson(workbook, "places", headerMap.places, utils)
  );

  let scenesRows = sheetToJson(workbook, "scenes", headerMap.scenes, utils);
  let dialoguesRows = sheetToJson(
    workbook,
    "dialogues",
    headerMap.dialogues,
    utils
  );
  let choicesRows = sheetToJson(workbook, "choices", headerMap.choices, utils);
  let sceneCharRows = sheetToJson(
    workbook,
    "scene_characters",
    headerMap.scene_characters,
    utils
  );

  const endingSystemRows = sheetToJson(
    workbook,
    "ending_system",
    headerMap.ending_system,
    utils
  );
  const endingConfigRows = sheetToJson(
    workbook,
    "ending",
    headerMap.ending,
    utils
  );

  const endingSceneIdRemap = buildEndingSceneIdRemap(endingConfigRows);

  applySceneIdRemapToSheets(
    { scenesRows, dialoguesRows, choicesRows, sceneCharRows },
    endingSceneIdRemap
  );

  const storyScenes = buildScenes(
    scenesRows,
    dialoguesRows,
    choicesRows,
    sceneCharRows
  );

  const endingConfig = buildEndingConfig(endingSystemRows, endingConfigRows);

  return { gameInfo, characters, places, storyScenes, endingConfig };
}

export default convertXlsxToStoryData;
