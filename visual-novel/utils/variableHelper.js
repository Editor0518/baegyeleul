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

  // set 변수이름 as 값
  const setMatch = cmd.match(/^set\s+(\S+)\s+as\s+(.+)$/);
  if (setMatch) {
    const value = parseValue(setMatch[2].trim());
    return { type: 'set', varName: setMatch[1], value };
  }

  // add 값 to 변수이름
  const addMatch = cmd.match(/^add\s+(.+)\s+to\s+(\S+)$/);
  if (addMatch) {
    const value = parseFloat(addMatch[1].trim());
    if (isNaN(value)) return null;
    return { type: 'add', varName: addMatch[2], value };
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
 */
function parseIfCommand(cmd) {
  // if 변수이름 == 값 then 씬A else 씬B
  // if 변수이름 != 값 then 씬A else 씬B
  // if 변수이름 < 값 then 씬A
  // if 변수이름 > 값 then 씬A
  // if 변수이름 <= 값 then 씬A
  // if 변수이름 >= 값 then 씬A
  
  const ifPattern = /^if\s+(\S+)\s+(==|!=|<=|>=|<|>)\s+(.+?)\s+then\s+(\S+)(?:\s+else\s+(\S+))?$/;
  const match = cmd.match(ifPattern);
  
  if (match) {
    return {
      type: 'if',
      varName: match[1],
      operator: match[2],
      value: parseValue(match[3]),
      thenScene: match[4],
      elseScene: match[5] || null
    };
  }
  
  return null;
}

/**
 * ifs 명령어 파싱
 * ifs 변수이름 == 값1,값2,값3 then 씬1,씬2,씬3
 * ifs 변수이름 >= 값1,값2,값3 then 씬1,씬2,씬3
 */
function parseIfsCommand(cmd) {
  const ifsPattern = /^ifs\s+(\S+)\s+(==|!=|<=|>=|<|>)\s+(.+?)\s+then\s+(.+)$/;
  const match = cmd.match(ifsPattern);
  
  if (match) {
    const values = match[3].split(',').map(v => parseValue(v.trim()));
    const scenes = match[4].split(',').map(s => s.trim());
    
    return {
      type: 'ifs',
      varName: match[1],
      operator: match[2],
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
export function executeConditionalCommand(command, context) {
  const { type } = command;
  const { variables, affection } = context;
  
  if (type === 'if') {
    const { varName, operator, value, thenScene, elseScene } = command;
    const varValue = getVariableValue(varName, variables, affection);
    
    const conditionMet = evaluateCondition(varValue, operator, value);
    
    if (conditionMet) {
      return { nextScene: thenScene, shouldContinue: false };
    } else if (elseScene) {
      return { nextScene: elseScene, shouldContinue: false };
    }
    
    return { nextScene: null, shouldContinue: true };
  }
  
  if (type === 'ifs') {
    const { varName, operator, values, scenes } = command;
    const varValue = getVariableValue(varName, variables, affection);
    
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
 * 변수 값 가져오기 (변수, 호감도, 씬 이름 모두 지원)
 */
function getVariableValue(varName, variables, affection) {
  // 변수에서 먼저 찾기
  if (variables && varName in variables) {
    return variables[varName];
  }
  
  // 호감도에서 찾기
  if (affection && varName in affection) {
    return affection[varName];
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
 * showif 조건 평가
 * @param {string} showIfString - showif 문자열
 * @param {Object} variables - 사용자 변수
 * @param {Object} affection - 호감도
 * @returns {boolean} 조건 만족 여부
 */
export function evaluateShowIf(showIfString, variables, affection) {
  if (!showIfString || typeof showIfString !== 'string') return true;
  
  const cmd = showIfString.trim();
  if (!cmd) return true;
  
  // showif 변수이름 연산자 값
  const showIfPattern = /^showif\s+(\S+)\s+(==|!=|<=|>=|<|>)\s+(.+)$/;
  const match = cmd.match(showIfPattern);
  
  if (match) {
    const varName = match[1];
    const operator = match[2];
    const value = parseValue(match[3]);
    
    const varValue = getVariableValue(varName, variables, affection);
    return evaluateCondition(varValue, operator, value);
  }
  
  return true;
}
