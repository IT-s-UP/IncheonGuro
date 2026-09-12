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


## 카카오·구글 로그인

기존 팀 Auth의 Member, JwtService, SecurityConfig를 공유합니다. 소셜 전용 코드는 socialauth 패키지에 있습니다.
일반 회원가입·로그인 API와 필수 입력 검증은 유지합니다. oauth: 접두사는 소셜 계정 전용으로 일반 회원가입에서 사용할 수 없습니다.
소셜 제공자가 주지 않는 전화번호·생년월일·성별·이메일·관심 지역은 null로 저장하며, 가짜 개인정보를 만들지 않습니다.

### 기존 DB 배포 준비

기존 PostgreSQL에는 **배포 전에 backend/database/social-member-nullable.sql을 적용**해야 합니다.
Hibernate ddl-auto=update만으로 기존 NOT NULL 제약이 해제된다고 가정하지 마세요. SQL은 기존 회원 데이터를 삭제하거나 변경하지 않습니다.
신규 DB는 엔티티 기준으로 생성됩니다. 소셜 회원의 위 선택 정보는 null일 수 있습니다.

backend/.env 또는 실행 환경에 JWT_SECRET(32바이트 이상), KAKAO_REST_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET을 설정합니다.
카카오 Client Secret이 활성화되어 있으면 KAKAO_CLIENT_SECRET도 필요합니다. 실제 키와 .env는 커밋하지 않습니다.
로컬 콜백은 http://localhost:5173/api/auth/kakao/callback 및 http://localhost:5173/api/auth/google/callback 입니다.
배포 시 KAKAO_REDIRECT_URI, GOOGLE_REDIRECT_URI, AUTH_FRONTEND_URL을 HTTPS 서비스 주소로 지정하고 SESSION_COOKIE_SECURE=true를 사용하세요.
프론트와 /api는 같은 출처로 제공하며, 여러 백엔드 인스턴스를 운영한다면 OAuth 세션이 유지되도록 구성해야 합니다.

### 선택: 독립 로컬 DB

Windows에서 backend/start-local.ps1을 실행하면 local 프로필의 파일형 H2 DB(backend/data)를 사용합니다.
팀 서버는 local 프로필 없이 실행합니다. local 프로필은 실행마다 별도 무작위 JWT 키를 생성하므로 팀 JWT_SECRET을 사용하지 않습니다.
따라서 로컬 토큰은 팀 서버에서 사용할 수 없으며 백엔드 재시작 후 다시 로그인해야 합니다.
로컬 DB 파일은 backend/data/social-login입니다. 이전 local-login 파일은 보존되며 새 DB로 시작합니다.

기본 포트는 8080입니다. 개인 PC에서 충돌하면 Git에서 제외된 backend/.env에 SERVER_PORT=8081,
frontend/.env.local에 BACKEND_URL=http://127.0.0.1:8081을 설정합니다. 팀 공통 설정을 바꿀 필요는 없습니다.
프론트엔드는 frontend에서 npm run dev로 실행하고 http://localhost:5173/login 에 접속합니다.
/api/auth/me로 세션 및 JWT를 복구하고 auth/api.ts의 apiFetch로 Bearer 요청을 보냅니다.
로그아웃은 브라우저 토큰과 세션을 삭제하며 이미 발급한 JWT는 최대 1시간 뒤 만료됩니다.
테스트: Java 17에서 backend/gradlew test, 프론트엔드에서 npm run build.
