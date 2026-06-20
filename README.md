# 교실 마피아 추리 게임

초등학교 6학년 교실용 웹 기반 마피아 게임입니다. 선생님이 방을 만들고, 학생들이 게임 코드와 닉네임으로 입장하며, 프로그램이 게임 진행자 역할을 합니다.

## 기술 스택

- **Next.js 14** (App Router)
- **TypeScript**
- **Firebase** (Firestore, Authentication)
- **Tailwind CSS**
- **Vercel** (배포)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Firestore Database 활성화
3. Authentication에서 익명 로그인 활성화
4. 서비스 계정 키 생성 (프로젝트 설정 > 서비스 계정)

### 3. 환경 변수 설정

`.env.local.example`을 복사하여 `.env.local` 파일 생성:

```bash
cp .env.local.example .env.local
```

Firebase 콘솔에서 값을 복사하여 입력:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

ADMIN_CODE=teacher_secret_code  # 선생님 로그인 코드

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 4. Firestore 규칙 배포

```bash
firebase deploy --only firestore:rules
```

### 5. 개발 서버 실행

```bash
npm run dev
```

## 게임 방법

### 선생님

1. `/teacher/login`에서 관리자 코드로 로그인
2. 방 이름, 인원수, 역할 수 설정 후 방 생성
3. 화면에 표시된 게임 코드를 학생들에게 알려줌 (프로젝터 활용)
4. 학생들이 입장하면 게임 시작
5. 각 단계마다 "다음 단계" 버튼 클릭

### 학생

1. `/join`에서 게임 코드와 닉네임 입력
2. 역할 확인 후 게임 참여
3. 밤에는 역할에 따라 행동 선택
4. 낮에는 토론 후 투표

## 역할 설명

- **🎭 마피아**: 밤에 시민을 탈락시킵니다
- **🔍 경찰**: 밤에 한 명의 정체를 조사합니다
- **⚕️ 의사**: 밤에 한 명을 보호합니다
- **👤 시민**: 낮 투표로 마피아를 찾아냅니다

## 승리 조건

- **시민팀**: 모든 마피아를 탈락시키면 승리
- **마피아팀**: 살아있는 마피아 수가 시민 수 이상이 되면 승리

## 배포 (Vercel)

```bash
vercel deploy
```

환경 변수를 Vercel 대시보드에서도 설정해야 합니다.
