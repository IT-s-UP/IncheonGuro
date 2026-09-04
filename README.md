# IncheonGuro

## 기술 스택

| 영역   | 스택                                                 |
| ------ | ---------------------------------------------------- |
| 프론트 | React 19 + TypeScript 6 + Vite 8 (oxlint / Prettier) |
| 백엔드 | Java 17 + Spring Boot 4.1.0 + Gradle                 |
| 에디터 | VSCode                                               |

## 폴더 구조

```
IncheonGuro/
├─ frontend/          # React + TypeScript (Vite)
│  ├─ src/
│  └─ package.json
├─ backend/           # Spring Boot (Gradle)
│  ├─ src/main/java/com/itsup/incheonguro/
│  ├─ build.gradle
│  └─ gradlew(.bat)
├─ .vscode/           # 공용 에디터 설정
├─ .editorconfig
├─ .gitattributes
├─ .prettierrc.json
└─ .nvmrc
```

## 시작하기

필요한 것: Java 17 이상, Node 20 이상 (권장 24)

```bash
git clone https://github.com/IT-s-UP/IncheonGuro.git
cd IncheonGuro
```

VSCode로 루트 폴더(`IncheonGuro`)를 엽니다. 하위 폴더를 따로 열면 공용 설정이 적용되지 않습니다.
폴더를 열면 추천 확장 설치 알림이 뜹니다.

## 실행

### 백엔드 (터미널 1)

```bash
cd backend
./gradlew bootRun          # Windows: .\gradlew.bat bootRun
```

→ http://localhost:8080

### 프론트엔드 (터미널 2)

```bash
cd frontend
npm install                # 최초 1회
npm run dev
```

→ http://localhost:5173

### 동작 확인

http://localhost:5173/api/health

```json
{ "service": "incheonguro-backend", "status": "ok" }
```

프론트의 `/api/*` 요청은 Vite 프록시가 백엔드(8080)로 전달합니다. 설정은
`frontend/vite.config.ts`의 `server.proxy`에 있습니다.

## 명령어

### frontend

| 명령어              | 설명                     |
| ------------------- | ------------------------ |
| `npm run dev`       | 개발 서버                |
| `npm run build`     | 타입체크 + 프로덕션 빌드 |
| `npm run lint`      | oxlint 검사              |
| `npm run format`    | Prettier 포맷            |
| `npm run typecheck` | 타입 검사                |

`@/` 로 절대경로 import가 가능합니다. → `import Foo from '@/components/Foo'`

### backend

| 명령어              | 설명          |
| ------------------- | ------------- |
| `./gradlew bootRun` | 앱 실행       |
| `./gradlew build`   | 빌드 + 테스트 |
| `./gradlew test`    | 테스트        |

## 인프라

### 배포 환경

| 구성    | 스펙                                                     |
| ------- | -------------------------------------------------------- |
| 백엔드  | AWS EC2 (Amazon Linux 2023, 프리티어, ap-northeast-2)     |
| DB      | AWS RDS PostgreSQL (프리티어, Single-AZ, ap-northeast-2)  |

### RDS 접속 정보

- Endpoint: `incheonguro-db.c7gui428mivt.ap-northeast-2.rds.amazonaws.com`
- Port: `5432`
- 접속 계정/비밀번호는 레포에 커밋하지 않고 팀 채널에서 별도 공유합니다.

### 백엔드 DB 연결 (로컬 개발)

`backend`는 아래 환경변수가 있어야 DB에 연결됩니다. `.env` 커밋 금지 규칙과 동일하게, 값은
직접 실행 환경에 설정합니다.

| 환경변수                    | 설명                                        |
| ---------------------------- | ------------------------------------------- |
| `SPRING_DATASOURCE_URL`      | `jdbc:postgresql://<endpoint>:5432/incheonguro` |
| `SPRING_DATASOURCE_USERNAME` | RDS master username                         |
| `SPRING_DATASOURCE_PASSWORD` | RDS master password                         |

값은 팀 채널에서 공유받아서 로컬 환경변수 또는 IDE 실행 설정에 넣어주세요.

### 참고

- 인프라 구성 이슈: #51
- 현재 보안그룹은 초기 세팅 단계라 넓게 열려 있습니다. 배포 전 팀원 IP 기준으로 좁히는 작업이 필요합니다.

## 협업 규약

1. 저장 시 자동 포맷이 적용됩니다. 설정을 끄지 않습니다.
2. 개행문자는 LF로 통일되어 있습니다 (`.gitattributes`).
3. `.env` 파일은 커밋하지 않습니다. 필요한 키는 `frontend/.env.example`에 추가하고,
   실제 값은 각자 `.env.local`에 넣습니다.
4. 메인 브랜치에 직접 push하지 않고 브랜치를 만들어 PR로 병합합니다.
   - `feature/기능명` — 새 기능
   - `fix/기능명` — 오류 수정
   - `hotfix/기능명` — 리뷰 없이 즉시 반영해야 하는 경우
5. 커밋 메시지는 `타입: 제목` 형식입니다. 예) `Feat: 로그인 기능`
6. `package-lock.json`은 커밋합니다.
