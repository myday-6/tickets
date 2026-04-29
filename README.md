# 🎫 티켓 관리 시스템

계정별 콘서트 티켓 데이터를 관리하는 웹앱입니다.  
**GitHub Pages** + **Google Apps Script** + **Google Sheets** 로 완전 무료로 운영할 수 있습니다.

---

## 📋 주요 기능

- 계정 관리 (네이버 / 이메일 / 기존인팍)
- 콘서트 & 공연날짜 관리
- 티켓 추가 (연속 입력 지원)
- 티켓 리스트 인라인 편집 (상태, 판매경로, 판매결과, 메모)
- 테이블형 / 카드형 보기 전환
- 콘서트, 날짜, 계정, 상태별 필터 & 정렬
- 삭제 전 확인창, 저장 실패 에러 메시지
- 모바일 완전 대응

---

## 🗂️ 파일 구조

```
ticket-manager/
├── index.html              ← 메인 진입점
├── config.js               ← ⭐ API URL 설정 (여기서만 수정)
├── css/style.css
├── js/
│   ├── app.js              ← 라우팅
│   ├── api.js              ← GAS API 통신
│   ├── store.js            ← 상태 관리
│   ├── utils.js            ← 유틸리티
│   ├── components/         ← modal, toast, loader
│   └── pages/              ← dashboard, accounts, concerts, addTicket
├── gas/Code.gs             ← Google Apps Script 코드
└── README.md
```

---

## 🚀 세팅 단계별 가이드

### Step 1. Google Sheets 생성

1. [Google Sheets](https://sheets.google.com) 접속 → 새 스프레드시트 생성
2. 시트 이름을 기억해두세요 (나중에 Apps Script에서 자동 생성됩니다)

---

### Step 2. Google Apps Script 설정

1. Google Sheets 메뉴에서 **확장 프로그램 → Apps Script** 클릭
2. 기존 코드를 전부 지우고 `gas/Code.gs` 파일의 내용 **전체 붙여넣기**
3. 저장 (💾 또는 Ctrl+S)

#### 시트 초기화 (최초 1회)
4. 상단 함수 드롭다운에서 `initAllSheets` 선택
5. ▶ 실행 버튼 클릭
6. 권한 요청 창이 뜨면 → **검토 → 고급 → 계속** 클릭 후 허용
7. 실행 완료 후 Sheets로 돌아오면 `Accounts`, `Concerts`, `ConcertDates`, `Tickets` 시트 4개가 자동 생성됩니다

---

### Step 3. Apps Script 웹앱 배포

1. Apps Script 에디터 상단 **배포 → 새 배포** 클릭
2. ⚙️ 톱니바퀴 → **웹 앱** 선택
3. 설정:
   - **설명**: 티켓 관리 API (아무 내용이나)
   - **실행 계정**: 나 (본인 계정)
   - **액세스 권한**: **모든 사용자** ← 반드시 이걸로!
4. **배포** 클릭
5. 권한 재확인 후 **웹앱 URL 복사** (이 URL이 필요합니다)

> ⚠️ **중요**: 코드 수정 후 반드시 **새 버전으로 재배포**해야 변경이 반영됩니다.  
> (배포 → 배포 관리 → ✏️ 수정 → 새 버전 → 배포)

---

### Step 4. config.js에 URL 입력

`config.js` 파일을 열고 복사한 URL을 붙여넣으세요:

```javascript
const CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/AKfycb.../exec',  // ← 여기!
  APP_NAME: '🎫 티켓 관리 시스템',
};
```

---

### Step 5. GitHub Pages 배포

#### 방법 A. GitHub 웹사이트에서 직접 업로드

1. [GitHub](https://github.com) → 새 Repository 생성
   - Repository 이름 예시: `ticket-manager`
   - Public으로 설정
2. **Add file → Upload files** → 프로젝트 폴더 전체 업로드
3. Repository 설정 → **Pages** 탭
4. Source: **Deploy from a branch** → Branch: `main` / `/ (root)` → **Save**
5. 몇 분 후 `https://[your-username].github.io/ticket-manager/` 에서 접속 가능

#### 방법 B. Git CLI 사용

```bash
cd ticket-manager
git init
git add .
git commit -m "초기 배포"
git branch -M main
git remote add origin https://github.com/[username]/ticket-manager.git
git push -u origin main
```

→ GitHub에서 Pages 설정 (위 방법 A의 3~5번 동일)

---

## 🎛️ Google Sheets 구조

시트 4개가 자동으로 생성됩니다:

| 시트명 | 컬럼 |
|--------|------|
| **Accounts** | id, accountName, idType, createdAt, updatedAt |
| **Concerts** | id, concertName, createdAt, updatedAt |
| **ConcertDates** | id, concertId, concertDate, createdAt, updatedAt |
| **Tickets** | id, accountId, concertId, concertDateId, section, row, seatNumber, attendanceType, saleChannel, saleResult, saleCompletedDetail, memo, createdAt, updatedAt |

---

## 🎨 티켓 상태 UX 흐름

```
참석/판매 상태
├── 미진/미나  → 판매 관련 필드 비활성화
└── 판매
    └── 판매경로
        ├── 미진티베 → 판매결과 자동 "판매중"
        └── 미나티베 → 판매결과 자동 "판매중"
            └── (수동으로 "판매완료"로 변경 시)
                └── 판매완료상세 선택
                    ├── 미진티베완료
                    ├── 미나티베완료
                    ├── 번장
                    └── 오카
```

---

## 🔧 자주 묻는 질문

**Q: 데이터가 안 불러와져요.**  
A: config.js의 GAS_URL을 다시 확인하세요. Apps Script 배포 시 "모든 사용자" 설정인지 확인하세요.

**Q: 저장이 안 돼요.**  
A: Apps Script를 코드 수정 후 **재배포(새 버전)**했는지 확인하세요. 기존 URL로는 이전 버전이 동작합니다.

**Q: 공연날짜 필터가 없어요.**  
A: 먼저 콘서트 필터를 선택하면 해당 콘서트의 공연날짜만 표시됩니다.

**Q: 모바일에서 테이블이 너무 작아요.**  
A: 우측 상단 ⊞ 버튼으로 카드 보기로 전환하세요.

---

## 🛡️ 데이터 보안 참고

- Apps Script 웹앱 URL을 알면 누구나 데이터에 접근 가능합니다.
- URL을 외부에 공유하지 마세요.
- 중요한 데이터는 Sheets에서 주기적으로 백업하세요.

---

## 📝 라이선스

개인 사용 목적 자유롭게 사용 가능합니다.
