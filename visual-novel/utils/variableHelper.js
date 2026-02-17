// variableHelper.js - 사용자 변수 시스템 유틸리티

/**
 * 명령어 문자열을 파싱하여 명령어 객체로 변환
 * @param {string} commandString - 명령어 문자열
 * @returns {Object|null} 파싱된 명령어 객체
 */
export function parseCommand(commandString) {
  if (!commandString || typeof commandString !== 'string') return null;

  const cmd = commandString.trim();
  if (!cmd) return null;

  // 여러 명령어를 ';'로 연결한 경우 처리
  const commandParts = cmd.split(';').map(part => part.trim()).filter(Boolean);

  // 여러 명령어인 경우
  if (commandParts.length > 1) {
    const parsedCommands = commandParts.map(part => parseSingleCommand(part)).filter(Boolean);
    if (parsedCommands.length === 0) return null;
    return { type: 'multiple', commands: parsedCommands };
  }

  // 단일 명령어인 경우
  return parseSingleCommand(cmd);
}

/**
 * 단일 명령어 파싱
 */
function parseSingleCommand(cmd) {
  cmd = cmd.trim();

  // set 변수이름 as 값
  const setMatch = cmd.match(/^set\s+(\S+)\s+as\s+(.+)$/);
  if (setMatch) {
    const value = parseValue(setMatch[2].trim());
    return { type: 'set', varName: setMatch[1], value };
  }

  // add 값 to 변수이름 (단일 또는 콤마로 구분된 여러 개)
  const addMatch = cmd.match(/^add\s+(.+)\s+to\s+(.+)$/);
  if (addMatch) {
    const valuesStr = addMatch[1].trim();
    const varsStr = addMatch[2].trim();

    // 콤마로 구분된 경우
    if (valuesStr.includes(',') || varsStr.includes(',')) {
      const values = valuesStr.split(',').map(v => parseFloat(v.trim()));
      const varNames = varsStr.split(',').map(v => v.trim());

      // 배열 길이가 다르면 에러
      if (values.length !== varNames.length) return null;

      // 모든 값이 숫자인지 확인
      if (values.some(v => isNaN(v))) return null;

      // multiple 타입으로 변환
      const commands = values.map((value, index) => ({
        type: 'add',
        varName: varNames[index],
        value
      }));

      return { type: 'multiple', commands };
    }

    // 단일 값인 경우
    const value = parseFloat(valuesStr);
    if (isNaN(value)) return null;
    return { type: 'add', varName: varsStr, value };
  }

  // delete 변수이름
  const deleteMatch = cmd.match(/^delete\s+(\S+)$/);
  if (deleteMatch) {
    return { type: 'delete', varName: deleteMatch[1] };
  }

  // if 조건문
  if (cmd.startsWith('if ')) {
    return parseIfCommand(cmd);
  }

  // ifs 다중 조건문
  if (cmd.startsWith('ifs ')) {
    return parseIfsCommand(cmd);
  }

  // random 랜덤 이벤트
  if (cmd.startsWith('random ')) {
    return parseRandomCommand(cmd);
  }

  return null;
}

/**
 * 값을 파싱 (문자열 또는 숫자)
 */
function parseValue(valueStr) {
  const trimmed = valueStr.trim();

  // 문자열 (따옴표로 감싸진 경우)
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }

  // 콤마로 구분된 OR 값 목록 (예: 1,2,3,4)
  if (trimmed.includes(',')) {
    return trimmed.split(',').map(v => {
      const t = v.trim();
      const num = parseFloat(t);
      return !isNaN(num) ? num : t;
    });
  }

  // 숫자
  const num = parseFloat(trimmed);
  if (!isNaN(num)) {
    return num;
  }

  // 그 외는 문자열로 처리
  return trimmed;
}

/**
 * if 명령어 파싱
 * if 변수이름 연산자 값 then 씬A [else 씬B]
 * if 변수이름 연산자 값 and 변수이름2 연산자 값2 then 씬A [else 씬B]
 * if 변수이름 연산자 값 then 명령어 [else 명령어]  (예: add 1 to x)
 */
function parseIfCommand(cmd) {
  // Step 1: then 기준으로 조건부와 나머지를 분리 (나머지는 다중 단어 허용)
  const mainMatch = cmd.match(/^if\s+(.+?)\s+then\s+(.+)$/);
  if (!mainMatch) return null;

  const conditionsStr = mainMatch[1];
  const afterThen = mainMatch[2].trim();

  // Step 2: else로 then파트/else파트 분리
  let thenPart, elsePart;
  const elseMatch = afterThen.match(/^(.+?)\s+else\s+(.+)$/);
  if (elseMatch) {
    thenPart = elseMatch[1].trim();
    elsePart = elseMatch[2].trim();
  } else {
    thenPart = afterThen;
    elsePart = null;
  }

  // Step 3: 조건 파싱 ('and'로 분리)
  const conditionParts = conditionsStr.split(/\s+and\s+/);
  const conditions = [];
  const conditionPattern = /^(\S+)\s+(==|!=|<=|>=|<|>)\s+(.+)$/;

  for (const part of conditionParts) {
    const match = part.trim().match(conditionPattern);
    if (!match) return null; // 파싱 실패

    conditions.push({
      varName: match[1],
      operator: match[2],
      value: parseValue(match[3])
    });
  }

  // Step 4: then/else 파트가 명령어인지 씬 이름인지 판별
  const isCommandStr = (str) => /^(set|add|delete)\s/.test(str);
  const thenIsCommand = isCommandStr(thenPart);
  const elseIsCommand = elsePart ? isCommandStr(elsePart) : false;

  // 명령어가 포함된 경우: 단일 if 구조로 반환 (분리하지 않음)
  if (thenIsCommand || elseIsCommand) {
    return {
      type: 'if',
      conditions,
      thenCommand: thenIsCommand ? parseSingleCommand(thenPart) : null,
      thenScene: thenIsCommand ? null : thenPart,
      elseCommand: elseIsCommand ? parseSingleCommand(elsePart) : null,
      elseScene: (elsePart && !elseIsCommand) ? elsePart : null,
    };
  }

  // 씬 이름만인 경우: 기존 로직 유지
  const thenScene = thenPart;
  const elseScene = elsePart;

  // else가 있는 경우, 드모르간 법칙으로 두 개의 if로 분리
  if (elseScene) {
    const invertedConditions = conditions.map(condition => ({
      varName: condition.varName,
      operator: invertOperator(condition.operator),
      value: condition.value
    }));

    const commands = [
      {
        type: 'if',
        conditions: conditions,
        logicOperator: 'and',
        thenScene,
        elseScene: null
      },
      {
        type: 'if',
        conditions: invertedConditions,
        logicOperator: 'or',
        thenScene: elseScene,
        elseScene: null
      }
    ];

    return { type: 'multiple', commands };
  }

  return {
    type: 'if',
    conditions,
    thenScene,
    elseScene
  };
}

/**
 * 연산자 반전
 */
function invertOperator(operator) {
  const invertMap = {
    '==': '!=',
    '!=': '==',
    '<': '>=',
    '<=': '>',
    '>': '<=',
    '>=': '<'
  };
  return invertMap[operator] || operator;
}

/**
 * ifs 명령어 파싱
 * ifs 변수이름 == 값1,값2,값3 then 씬1,씬2,씬3 (기존)
 * ifs 변수1,변수2,변수3 == 값1,값2,값3 then 씬1,씬2,씬3 (신규)
 */
function parseIfsCommand(cmd) {
  const ifsPattern = /^ifs\s+(.+?)\s+(==|!=|<=|>=|<|>)\s+(.+?)\s+then\s+(.+)$/;
  const match = cmd.match(ifsPattern);

  if (match) {
    const varNamesStr = match[1].trim();
    const operator = match[2];
    const valuesStr = match[3].trim();
    const scenesStr = match[4].trim();

    const varNames = varNamesStr.split(',').map(v => v.trim());
    const values = valuesStr.split(',').map(v => parseValue(v.trim()));
    const scenes = scenesStr.split(',').map(s => s.trim());

    // 여러 변수를 비교하는 경우 (새로운 문법)
    if (varNames.length > 1) {
      // 배열 길이가 모두 같아야 함
      if (varNames.length !== values.length || varNames.length !== scenes.length) {
        return null;
      }

      // multiple 타입으로 변환 (여러 if 명령어로)
      const commands = varNames.map((varName, index) => ({
        type: 'if',
        conditions: [{
          varName,
          operator,
          value: values[index]
        }],
        thenScene: scenes[index],
        elseScene: null
      }));

      return { type: 'multiple', commands };
    }

    // 기존 문법 (단일 변수, 여러 값)
    return {
      type: 'ifs',
      varName: varNames[0],
      operator,
      values,
      scenes
    };
  }

  return null;
}

/**
 * random 명령어 파싱
 * random 시작~끝 go 범위1~범위2:씬1,범위3~범위4:씬2
 */
function parseRandomCommand(cmd) {
  const randomPattern = /^random\s+(\d+)~(\d+)\s+go\s+(.+)$/;
  const match = cmd.match(randomPattern);

  if (match) {
    const start = parseInt(match[1]);
    const end = parseInt(match[2]);
    const rangesStr = match[3];

    const ranges = rangesStr.split(',').map(r => {
      const parts = r.trim().split(':');
      if (parts.length !== 2) return null;

      const rangeStr = parts[0].trim();
      const scene = parts[1].trim();

      // 범위 파싱 (1~3 또는 4)
      if (rangeStr.includes('~')) {
        const [rangeStart, rangeEnd] = rangeStr.split('~').map(n => parseInt(n.trim()));
        return { start: rangeStart, end: rangeEnd, scene };
      } else {
        const num = parseInt(rangeStr);
        return { start: num, end: num, scene };
      }
    }).filter(Boolean);

    return {
      type: 'random',
      start,
      end,
      ranges
    };
  }

  return null;
}

/**
 * 명령어 실행
 * @param {Object} command - 파싱된 명령어 객체
 * @param {Object} context - 실행 컨텍스트 { variables, affection, sceneHistory, setVariable, getVariable, deleteVariable, addToVariable }
 * @returns {Object} { nextScene: string|null, shouldContinue: boolean }
 */
export function executeCommand(command, context) {
  if (!command) return { nextScene: null, shouldContinue: true };

  const { type } = command;

  // 여러 명령어를 순차 실행
  if (type === 'multiple') {
    let finalNextScene = null;

    for (const cmd of command.commands) {
      const result = executeCommand(cmd, context);

      // 첫 번째 씬 분기만 적용 (이후 분기는 무시)
      if (result.nextScene && finalNextScene === null) {
        finalNextScene = result.nextScene;
      }
    }

    return {
      nextScene: finalNextScene,
      shouldContinue: finalNextScene === null
    };
  }

  if (type === 'set' || type === 'add' || type === 'delete') {
    return executeVariableCommand(command, context);
  }

  if (type === 'if' || type === 'ifs') {
    return executeConditionalCommand(command, context);
  }

  if (type === 'random') {
    return executeRandomCommand(command);
  }

  return { nextScene: null, shouldContinue: true };
}

/**
 * 변수 조작 명령어 실행
 */
export function executeVariableCommand(command, context) {
  const { type, varName, value } = command;
  const { setVariable, deleteVariable, addToVariable } = context;

  if (type === 'set') {
    setVariable(varName, value);
  } else if (type === 'add') {
    addToVariable(varName, value);
  } else if (type === 'delete') {
    deleteVariable(varName);
  }

  return { nextScene: null, shouldContinue: true };
}

/**
 * 조건 분기 명령어 실행
 */
/**
 * 조건 분기 명령어 실행
 */
export function executeConditionalCommand(command, context) {
  const { type } = command;
  const { variables, affection, history, choiceHistory } = context;

  if (type === 'if') {
    const { conditions, varName, operator, value, thenScene, elseScene, thenCommand, elseCommand, logicOperator } = command;

    let allConditionsMet = true;

    // 새로운 형식 (conditions 배열)
    if (conditions && Array.isArray(conditions)) {
      // OR 로직 (내부 사용)
      if (logicOperator === 'or') {
        allConditionsMet = false; // OR는 하나라도 참이면 됨
        for (const condition of conditions) {
          const varValue = getVariableValue(condition.varName, variables, affection, history, choiceHistory);
          const conditionMet = evaluateCondition(varValue, condition.operator, condition.value);

          if (conditionMet) {
            allConditionsMet = true;
            break; // 하나라도 참이면 종료
          }
        }
      }
      // AND 로직 (기본)
      else {
        for (const condition of conditions) {
          const varValue = getVariableValue(condition.varName, variables, affection, history, choiceHistory);
          const conditionMet = evaluateCondition(varValue, condition.operator, condition.value);

          if (!conditionMet) {
            allConditionsMet = false;
            break;
          }
        }
      }
    }
    // 기존 형식 (하위 호환성)
    else if (varName && operator !== undefined && value !== undefined) {
      const varValue = getVariableValue(varName, variables, affection, history, choiceHistory);
      allConditionsMet = evaluateCondition(varValue, operator, value);
    } else {
      return { nextScene: null, shouldContinue: true };
    }

    if (allConditionsMet) {
      if (thenCommand) return executeCommand(thenCommand, context);
      return { nextScene: thenScene, shouldContinue: false };
    } else {
      if (elseCommand) return executeCommand(elseCommand, context);
      if (elseScene) return { nextScene: elseScene, shouldContinue: false };
    }

    return { nextScene: null, shouldContinue: true };
  }

  if (type === 'ifs') {
    const { varName, operator, values, scenes } = command;
    const varValue = getVariableValue(varName, variables, affection, history, choiceHistory);

    for (let i = 0; i < values.length; i++) {
      const conditionMet = evaluateCondition(varValue, operator, values[i]);
      if (conditionMet && scenes[i]) {
        return { nextScene: scenes[i], shouldContinue: false };
      }
    }

    return { nextScene: null, shouldContinue: true };
  }

  return { nextScene: null, shouldContinue: true };
}

/**
 * 랜덤 이벤트 명령어 실행
 */
export function executeRandomCommand(command) {
  const { start, end, ranges } = command;

  // 랜덤 값 생성
  const randomValue = Math.floor(Math.random() * (end - start + 1)) + start;

  // 해당하는 범위 찾기
  for (const range of ranges) {
    if (randomValue >= range.start && randomValue <= range.end) {
      return { nextScene: range.scene, shouldContinue: false };
    }
  }

  // 해당하는 범위가 없으면 계속 진행
  return { nextScene: null, shouldContinue: true };
}

/**
 * 변수 값 가져오기 (변수, 호감도, 씬 방문 기록, 선택지 체크 지원)
 */
function getVariableValue(varName, variables, affection, history, choiceHistory) {
  // 변수에서 먼저 찾기
  if (variables && varName in variables) {
    return variables[varName];
  }

  // 호감도에서 찾기
  if (affection && varName in affection) {
    return affection[varName];
  }

  // 선택지 기록 확인
  if (choiceHistory && varName in choiceHistory) {
    return choiceHistory[varName];
  }

  // 씬 방문 기록 확인
  if (history && Array.isArray(history)) {
    // 디버깅용 로그


    // 1. 변수명 자체가 씬 ID인 경우 (예: if scene1 == 1)
    if (history.includes(varName)) {
      return 1;
    }

    // 2. seen_ 접두사를 사용하는 경우 (하위 호환성)
    if (varName.startsWith('seen_')) {
      const sceneId = varName.replace('seen_', '');
      return history.includes(sceneId) ? 1 : 0;
    }

    // 3. 변수/호감도에도 없고 방문 기록에도 없으면, 
    // 방문하지 않은 씬 ID로 간주하여 0 반환
    return 0;
  }

  // 없으면 undefined
  return undefined;
}

/**
 * 조건 평가
 */
export function evaluateCondition(leftValue, operator, rightValue) {
  // undefined는 조건 평가 실패
  if (leftValue === undefined) return false;

  // OR 값 목록 처리 (콤마로 구분된 값 → 배열)
  if (Array.isArray(rightValue)) {
    switch (operator) {
      case '==':
        return rightValue.some(v => leftValue == v);   // 하나라도 같으면 참
      case '!=':
        return rightValue.every(v => leftValue != v);   // 모두 다르면 참
      default:
        return rightValue.some(v => evaluateCondition(leftValue, operator, v));
    }
  }

  switch (operator) {
    case '==':
      return leftValue == rightValue;
    case '!=':
      return leftValue != rightValue;
    case '<':
      return Number(leftValue) < Number(rightValue);
    case '>':
      return Number(leftValue) > Number(rightValue);
    case '<=':
      return Number(leftValue) <= Number(rightValue);
    case '>=':
      return Number(leftValue) >= Number(rightValue);
    default:
      return false;
  }
}

/**
 * 조건 문자열 평가 (showif/unlockif 공통)
 * @param {string} conditionsStr - 키워드 제거 후 조건 문자열
 * @param {Object} variables - 사용자 변수
 * @param {Object} affection - 호감도
 * @param {Array} history - 씬 방문 기록 (선택적)
 * @param {Object} choiceHistory - 선택지 기록 (선택적)
 * @returns {boolean} 조건 만족 여부
 */
export function evaluateConditionString(conditionsStr, variables, affection, history, choiceHistory) {
  if (!conditionsStr || !conditionsStr.trim()) return true;

  // 'and'로 조건 분리
  const conditionParts = conditionsStr.trim().split(/\s+and\s+/);

  // 각 조건 평가
  const conditionPattern = /^(\S+)\s+(==|!=|<=|>=|<|>)\s+(.+)$/;

  for (const part of conditionParts) {
    const match = part.trim().match(conditionPattern);
    if (!match) return true; // 파싱 실패 시 표시

    const varName = match[1];
    const operator = match[2];
    const value = parseValue(match[3]);

    const varValue = getVariableValue(varName, variables, affection, history, choiceHistory);
    const conditionMet = evaluateCondition(varValue, operator, value);

    // 하나라도 거짓이면 전체 거짓 (AND 로직)
    if (!conditionMet) {
      return false;
    }
  }

  // 모든 조건이 참
  return true;
}

/**
 * showif 조건 평가
 * @param {string} showIfString - showif 문자열
 * @param {Object} variables - 사용자 변수
 * @param {Object} affection - 호감도
 * @param {Array} history - 씬 방문 기록 (선택적)
 * @param {Object} choiceHistory - 선택지 기록 (선택적)
 * @returns {boolean} 조건 만족 여부
 */
export function evaluateShowIf(showIfString, variables, affection, history, choiceHistory) {
  if (!showIfString || typeof showIfString !== 'string') return true;
  const cmd = showIfString.trim();
  if (!cmd || !cmd.startsWith('showif ')) return true;
  return evaluateConditionString(cmd.substring(7).trim(), variables, affection, history, choiceHistory);
}

/**
 * unlockif 조건 평가
 * @param {string} unlockIfString - unlockif 문자열
 * @param {Object} variables - 사용자 변수
 * @param {Object} affection - 호감도
 * @param {Array} history - 씬 방문 기록 (선택적)
 * @param {Object} choiceHistory - 선택지 기록 (선택적)
 * @returns {boolean} 조건 만족 여부 (true = 잠금 해제, false = 잠김)
 */
export function evaluateUnlockIf(unlockIfString, variables, affection, history, choiceHistory) {
  if (!unlockIfString || typeof unlockIfString !== 'string') return true;
  const cmd = unlockIfString.trim();
  if (!cmd || !cmd.startsWith('unlockif ')) return true;
  return evaluateConditionString(cmd.substring(9).trim(), variables, affection, history, choiceHistory);
}
