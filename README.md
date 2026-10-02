# chess · 오프닝 아틀라스

오프닝의 이름과 수순을 넘어 **수의 목적 → 폰 구조 → 말의 역할 → 공격과 반격 → 미들게임 계획**을 연결하는 한국어 체스 학습 사이트입니다.

[운영 중인 사이트](https://ljm92767647.github.io/chess/)

## 포함된 기능

- 74개 한국어 오프닝 가이드와 3,815개 Lichess 오프닝 수순
- 97개의 서로 다른 대표 국면에 연결된 전략 학습
- 목적, 핵심 아이디어, 폰 구조, 말의 역할, 공격 목표, 상대 대응, 미들게임 계획
- 백과 흑 각각의 7단계 계획과 주요 전략 수의 목적·위협·대응 해설
- 폰 구조 보드, 전체 기물 표시, 대표 국면을 메인 보드로 보내기
- 수순 이동·자동 재생·보드 뒤집기·직접 두기·힌트·자유 탐색·되돌리기
- 전략 비교, 출처별 티어 비교, 검색, 브라우저 내 저장·완료 기록
- 모바일 화면과 밝은/어두운 테마

희귀 세부 수순에는 실제 폰 구조 분석과 관련 가이드 연결을 제공합니다. 전용 전략 해설은 주요 가이드 중심입니다. 대표 수순은 강제 수순이나 엔진 최선 수를 뜻하지 않습니다.

## 실행

Node.js 20 이상이 필요합니다. 외부 패키지 설치나 빌드 과정 없이 실행할 수 있습니다.

```sh
node scripts/serve.mjs
```

브라우저에서 `http://localhost:4173`을 엽니다. 종료하려면 실행 중인 터미널에서 `Ctrl+C`를 누릅니다. 다른 포트는 `PORT` 환경변수로 지정할 수 있습니다.

## 검증

```sh
node scripts/verify.mjs
node scripts/review-checks.mjs
```

가이드 및 전체 수순의 합법성, 대표 국면, 양쪽 계획의 구성, 폰 구조와 변형별 해설의 주요 회귀 검사를 실행합니다. 폰 구조 검증 결과는 `outputs/strategy-validation.json`에 저장합니다. 이는 엔진 평가나 전문가의 전수 이론 감수를 대신하지 않습니다.

npm이 설치되어 있다면 `npm run dev`와 `npm test`로도 실행할 수 있습니다.

## 파일 구성

| 파일 | 역할 |
| --- | --- |
| `dist/index.html`, `style.css`, `app.js` | 화면과 기존 인터랙티브 체스 기능 |
| `dist/guides.js`, `database.json` | 한국어 가이드와 전체 수순 |
| `dist/lessons.js`, `strategy*.js` | 대표 구조와 학습 내용 |
| `dist/lesson-review.js`, `additional-cases.js` | 변형별 예외와 추가 대표 국면 |
| `dist/move-reasons.js`, `key-move-reasons.js` | 정확한 수순에 연결된 수의 해설 |
| `dist/learning-ui.js` | 폰 구조·계획·전략 비교 화면 |
| `scripts/` | 로컬 실행과 검증 |

`dist/`를 정적 웹 서버의 루트로 배포하면 됩니다. 이 저장소에는 실행에 필요한 파일을 포함했으며, 기존 Sites 저장소의 연결 정보나 인증 정보는 포함하지 않았습니다. main 브랜치에 변경사항을 저장하면 GitHub Actions가 수순과 학습 자료를 검증한 뒤 GitHub Pages에 자동 배포합니다.

## 자료와 라이선스

기존 참고 자료의 링크와 평가 범위는 사이트의 **출처** 페이지에 정리했습니다. 출처별 티어는 주관적인 입문 학습 평가이며 엔진 순위와 분리됩니다.

- [Lichess chess-openings](https://github.com/lichess-org/chess-openings): 오프닝명·ECO·수순, CC0
- chess.js: `dist/chess-LICENSE.txt`의 라이선스 유지
- Cburnett 기물 이미지: `dist/pieces/NOTICE.txt`와 `dist/pieces/GPL-2.0.txt`의 출처·라이선스 유지

새로 작성한 한국어 해설과 인터페이스는 참고 자료의 문장을 복제하지 않고 편집했습니다. 타사 코드·기물 이미지에는 각각의 라이선스가 적용됩니다.
