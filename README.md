# chess · 오프닝 아틀라스

[체스 학습 사이트 열기](https://ljm92767647.github.io/chess/)

오프닝의 **목적 → 현재 구조 → 상대의 다른 수 → 미들게임 계획**을 연결하는 한국어 학습 사이트입니다.

## 핵심 기능

- 접고 펼치는 공통 목적 패널: 선택한 오프닝의 중점과 대표 방향을 색상·글자로 표시
- 두 출처의 평가를 기준으로 74개에서 **49개**로 줄인 학습 목록
- 대표 수순의 목적, 양쪽의 짧은 계획, 상대 반격, 선택해서 보는 폰 구조
- 실전 대응: 현재 차례의 다른 합법 수 선택, 구조·전개·킹 안전 점검, 원래 계획의 조건 확인
- 브라우저 내 **Stockfish 19 lite**: 후보 3개, 약 2초 계산, 최대 8반수 후속 수순과 되돌리기
- 보드 이동·자동 재생·뒤집기, 직접 두기·힌트, 저장·완료 기록, 전략 비교, 모바일·테마

## 선정 기준

체스프릭 S/A/B 또는 히카루·고담 Legendary/Unbreakable/Legit 중 하나라도 있으면 남깁니다. C 이하에 해당하는 평가만 있거나 양쪽 모두 미평가이면 제외합니다. Really, Bro·Tricks Only·Garbage는 제외 구간입니다. 두 척도를 합산하거나 객관적인 오프닝 강함으로 환산하지 않습니다. 출처와 선정 기준은 사이트에서 확인할 수 있습니다.

수천 개의 세부 수순 목록과 중복 설명을 제거했습니다. 내부 구조 자료는 대표 국면 설명과 회귀 검증에 사용하며 별도 오프닝 목록으로 노출하지 않습니다.

## 로컬 실행

Node.js 20 이상에서 패키지 설치 없이 실행합니다.

```sh
node scripts/serve.mjs
```

`http://127.0.0.1:4173`으로 접속합니다.

## 검증

```sh
node scripts/verify.mjs
node scripts/review-checks.mjs
node scripts/learning-checks.mjs
node scripts/engine-checks.mjs
```

수순·구조 해설 회귀, 목록 선정 규칙, 목적 분류, 수순 이탈, UCI 변환, 캐슬링·승진·앙파상, 실제 Stockfish 후보 수순을 확인합니다. `npm test`로도 실행할 수 있습니다.

## 배포

`main`에 변경사항을 저장하면 GitHub Actions가 검증 후 `dist/`를 GitHub Pages에 배포합니다. 빌드는 필요 없습니다. WebAssembly 파일은 `application/wasm` MIME으로 제공합니다.

엔진은 사용자가 계산을 요청할 때 로딩됩니다. 현재 기보를 엔진에 전달해 반복 수순을 반영합니다. 계산 시간과 깊이는 기기에 따라 다르며, 설명 문장은 엔진 평가의 자동 번역이 아닙니다. 저장 기록은 브라우저에만 보관됩니다.

## 파일과 라이선스

- `dist/catalog.js`: 선정 규칙과 학습 목록
- `dist/purposes.js`: 공통 목적과 오프닝별 방향
- `dist/learning.js`: 간결한 학습·비교 화면
- `dist/coach.js`: 현재 국면 점검과 후보의 목적 연결
- `dist/uci.js`, `analysis-worker.js`: Stockfish 통신·수순 합법성 검증
- `dist/engine/`: 변경하지 않은 Stockfish.js 19.0.1 경량 단일 스레드 엔진

Stockfish.js: GPL-3.0, [해당 버전 전체 소스](https://github.com/nmrugg/stockfish.js/tree/v19.0.1), [소스 아카이브](https://github.com/nmrugg/stockfish.js/archive/refs/tags/v19.0.1.zip). 출처와 라이선스는 `dist/engine/NOTICE.txt`, `Copying.txt`에 포함합니다.

chess.js 라이선스는 `dist/chess-LICENSE.txt`, Cburnett 기물의 출처·GPL-2.0은 `dist/pieces/NOTICE.txt`, `GPL-2.0.txt`에 보존했습니다. 오프닝 분류 참고 자료인 Lichess chess-openings는 CC0입니다.
