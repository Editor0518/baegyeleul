# 웹노벨 명령어 완전 가이드

## 📌 중요 사항

### 캐시 문제 해결
- 스프레드시트 업데이트가 반영되지 않으면: **탭을 닫았다가 다시 열기**
- 여전히 반영 안 되면: **Ctrl+Shift+R** (브라우저 캐시 삭제, 단 세이브 데이터 삭제됨)

### 작성 규칙
- **띄어쓰기를 정확히 지켜야 합니다**
- 변수이름, 값은 한글 사용 가능
- 예약어 금지: `if`, `then`, `else`, `as`, `go`, `random`, `showif`, `and`, `ifs`

### 사용 위치
- **dialogues 시트 F열(command)**: 대사 출력 후 실행할 명령어
- **choices 시트 S열(command)**: 선택지 클릭 시 실행할 명령어
- **choices 시트 R열(show_if)**: 선택지 표시 조건

---

## 1️⃣ 변수 관리

### 변수 저장
```
set 변수이름 as 값
```
- 값: 정수 또는 문자열 (문자열은 `"` 로 감싸기)
- 예시: `set drink as "coffee"`
- 예시: `set count as 5`

### 변수에 숫자 더하기/빼기
```
add 값 to 변수이름
```
- 양수: 더하기, 음수: 빼기
- 예시: `add 10 to score`
- 예시: `add -5 to health`

**🆕 여러 변수에 한 번에 적용**
```
add 값1,값2,값3 to 변수1,변수2,변수3
```
- 콤마로 구분, 개수는 동일해야 함
- 예시: `add 70,70 to liszt,mendelssohn`
- 예시: `add 50,-30,100 to liszt,mendelssohn,chopin`

### 변수 삭제
```
delete 변수이름
```
- 예시: `delete temp_flag`

---

## 2️⃣ 호감도 관리

### 호감도 증가/감소
```
add 값 to 캐릭터ID
```
- 캐릭터ID가 characters 시트에 등록되어 있으면 자동으로 호감도로 처리
- 예시: `add 70 to liszt`
- 예시: `add -50 to mendelssohn`

**🆕 여러 캐릭터 호감도 한 번에 변경**
```
add 값1,값2 to 캐릭터1,캐릭터2
```
- 예시: `add 70,70 to liszt,mendelssohn`

---

## 3️⃣ 조건 분기 (if)

### 기본 조건 분기
```
if 변수이름 == 값 then 씬이름
```
- 참이면 해당 씬으로 분기, 거짓이면 다음 대사 진행
- 예시: `if meat == 1 then scene1`

### 조건 분기 (else 포함)
```
if 변수이름 == 값 then 씬A else 씬B
```
- 참이면 씬A, 거짓이면 씬B로 분기
- 예시: `if meat == 1 then scene1 else scene2`

### 지원하는 비교 연산자
- `==` : 같음
- `!=` : 다름
- `<` : 작음
- `>` : 큼
- `<=` : 작거나 같음
- `>=` : 크거나 같음

예시:
```
if mendelssohn >= 50 then scene_good
if score < 10 then scene_bad else scene_normal
```

### 🆕 AND 조건 (여러 조건 동시 확인)
```
if 변수1 == 값1 and 변수2 == 값2 then 씬A
```
- 모든 조건이 참일 때만 분기
- `and`로 여러 조건 연결 가능
- 예시: `if liszt >= 50 and scene1 == 1 then scene_9`
- 예시: `if score > 100 and flag == 1 and level >= 5 then scene_ending`

---

## 4️⃣ 다중 조건 분기 (ifs)

### 단일 변수, 여러 값 비교
```
ifs 변수이름 == 값1,값2,값3 then 씬1,씬2,씬3
```
- 변수 값이 값1이면 씬1, 값2면 씬2...
- 첫 번째로 일치하는 조건으로 분기
- 예시: `ifs scene1_choice == 1,2,3,4 then scene11,scene12,scene13,scene14`

### 크기 비교
```
ifs 변수이름 >= 값1,값2,값3 then 씬1,씬2,씬3
```
- 순서대로 비교하여 첫 번째로 참인 조건으로 분기
- 예시: `ifs mendelssohn >= 50,30,10,0 then scene_love,scene_friend,scene_normal,scene_bad`

### 🆕 여러 변수 동시 비교
```
ifs 변수1,변수2,변수3 == 값1,값2,값3 then 씬1,씬2,씬3
```
- 각 변수를 각 값과 비교하여 첫 번째로 참인 조건으로 분기
- 배열 길이는 모두 동일해야 함
- 예시: `ifs scene1,scene2,scene3 == 1,1,1 then scene5,scene6,scene7`
  - `scene1 == 1`이 참이면 `scene5`로 분기 (이후 조건 무시)
  - `scene1 == 1`이 거짓이고 `scene2 == 1`이 참이면 `scene6`로 분기
  - 둘 다 거짓이고 `scene3 == 1`이 참이면 `scene7`로 분기

---

## 5️⃣ 씬 방문 기록 활용

### 씬 방문 여부 확인
```
if 씬ID == 1 then 분기씬
```
- 해당 씬을 방문했으면 `1`, 방문 안 했으면 `0`
- 예시: `if scene1 == 1 then scene8`
- 예시: `if scene1 == 0 then scene_first_time`

### 선택지 기록 확인
```
if 선택지씬ID == 선택지번호 then 분기씬
```
- 선택지 씬에서 몇 번째 선택지를 골랐는지 확인 (1부터 시작)
- 예시: `if scene1_choice1 == 1 then scene8`
- 예시: `if scene1_choice1 <= 2 then scene_early`

---

## 6️⃣ 랜덤 분기

```
random 시작~끝 go 범위1~범위2:씬1,범위3~범위4:씬2
```
- 시작~끝 범위에서 랜덤 숫자 생성
- 해당 숫자가 속한 범위의 씬으로 분기
- 범위는 콤마로 구분
- 단일 숫자도 가능 (물결 없이)

예시:
```
random 1~10 go 1~3:scene_30,4:scene_10,5~10:scene_60
```
- 30% 확률로 scene_30
- 10% 확률로 scene_10
- 60% 확률로 scene_60

```
random 1~2 go 1:scene_A,2:scene_B
```
- 50% 확률로 scene_A 또는 scene_B

---

## 7️⃣ 여러 명령어 연결

### 🆕 세미콜론(;)으로 명령어 연결
```
명령어1; 명령어2; 명령어3
```
- 여러 명령어를 순차적으로 실행
- 조건 분기는 **첫 번째로 참인 것만 실행**

예시:
```
add 70 to liszt; add 70 to mendelssohn
```

```
set flag as 1; add 50 to score; if score >= 100 then scene_win
```

```
if scene_test1 == 1 then scene_test5; if scene_test2 == 1 then scene_test6; if scene_test3 == 1 then scene_test7
```
- scene_test1이 1이면 scene_test5로 분기하고 종료
- scene_test1이 0이고 scene_test2가 1이면 scene_test6로 분기
- 둘 다 0이고 scene_test3이 1이면 scene_test7로 분기

---

## 8️⃣ 선택지 표시 조건 (show_if)

**choices 시트의 R열(show_if)에 작성**

### 기본 문법
```
showif 변수이름 == 값
showif 변수이름 >= 값
showif 변수이름 != 값
```
- 조건이 참일 때만 선택지 표시
- 거짓이면 선택지 숨김

예시:
```
showif liszt >= 50
showif scene1 == 1
showif flag != 0
```

### 🆕 AND 조건 (여러 조건 동시 확인)
```
showif 변수1 == 값1 and 변수2 == 값2
```
- 모든 조건이 참일 때만 선택지 표시
- `and`로 여러 조건 연결 가능

예시:
```
showif liszt >= 50 and scene1 == 1
showif score >= 100 and flag == 1 and level >= 5
showif scene1_choice1 == 1 and mendelssohn >= 30
```

---

## 📋 명령어 요약표

| 분류 | 명령어 | 예시 |
|------|--------|------|
| **변수** | `set 변수 as 값` | `set flag as 1` |
| | `add 값 to 변수` | `add 10 to score` |
| | `add 값1,값2 to 변수1,변수2` | `add 70,70 to liszt,mendelssohn` |
| | `delete 변수` | `delete temp` |
| **조건** | `if 변수 == 값 then 씬` | `if flag == 1 then scene2` |
| | `if 변수 == 값 then 씬A else 씬B` | `if score >= 50 then good else bad` |
| | `if 변수1 == 값1 and 변수2 == 값2 then 씬` | `if liszt >= 50 and scene1 == 1 then scene9` |
| **다중조건** | `ifs 변수 == 값1,값2 then 씬1,씬2` | `ifs choice == 1,2,3 then s1,s2,s3` |
| | `ifs 변수1,변수2 == 값1,값2 then 씬1,씬2` | `ifs scene1,scene2 == 1,1 then s5,s6` |
| **랜덤** | `random 1~10 go 1~5:씬A,6~10:씬B` | `random 1~2 go 1:sceneA,2:sceneB` |
| **연결** | `명령1; 명령2; 명령3` | `add 10 to score; if score >= 100 then win` |
| **표시조건** | `showif 변수 == 값` | `showif liszt >= 50` |

---

## 💡 활용 팁

### 1. 호감도 기반 엔딩 분기
```
ifs liszt >= 100,50,0 then ending_best,ending_good,ending_normal
```

### 2. 복잡한 조건 분기
```
if liszt >= 50 and scene_date == 1 and choice_gift == 2 then scene_special_ending
```

### 3. 씬 방문 여부로 대사 변경
```
if scene_intro == 1 then scene_returning else scene_first_visit
```

### 4. 여러 캐릭터 호감도 동시 조정
```
add 30,30,30 to liszt,mendelssohn,chopin
```

### 5. 조건부 랜덤 이벤트
```
if luck >= 50 then scene_good; random 1~2 go 1:scene_normal,2:scene_bad
```
- luck이 50 이상이면 무조건 scene_good
- 아니면 50% 확률로 normal 또는 bad

---

## ⚠️ 주의사항

1. **띄어쓰기 엄수**: `if flag==1` ❌ → `if flag == 1` ✅
2. **콤마 구분 시 개수 일치**: 값, 변수, 씬의 개수가 모두 같아야 함
3. **예약어 사용 금지**: 변수명이나 씬 이름으로 `if`, `then` 등 사용 불가
4. **문자열은 큰따옴표**: `set name as "Alice"` (작은따옴표 ❌)
5. **세미콜론 분기 우선순위**: 첫 번째로 참인 조건만 실행됨

---

## 🔄 버전 정보

- 기본 변수 시스템
- 조건 분기 (if/ifs)
- 랜덤 분기
- **v2.0**: AND 조건, 세미콜론 연결, 콤마 배열 문법
- **v2.1**: 씬 방문 기록, 선택지 기록 추적
