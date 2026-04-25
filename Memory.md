# Memory

## 2026-04-25 - Frontend UI redesign (dashboard + auth)

### Muc tieu
- Cai thien giao dien frontend de dep hon, co ban sac ro rang va gan voi mock-up mong muon.
- Giam inline style, chuyen sang he thong class + stylesheet tap trung de de bao tri.
- Dam bao responsive desktop/mobile va khong pha vo logic hien co.

### Da chinh sua
- [frontend/src/index.css](frontend/src/index.css)
  - Thiet ke lai visual system toan cuc: color variables, typography, spacing, animation, background atmosphere.
  - Them style cho dashboard, header, stat card, topic card, activity card, login page, placeholder page.
  - Them responsive breakpoints (980px, 720px), focus states va loading/skeleton effects.

- [frontend/src/components/Header.tsx](frontend/src/components/Header.tsx)
  - Refactor header sang class-based styles.
  - Dung logo tu hero.png de dong bo nhan dien.
  - Cai thien user profile chip + dropdown menu + button Sign in.

- [frontend/src/components/StatCard.tsx](frontend/src/components/StatCard.tsx)
  - Don gian API component, bo truyen mau qua props.
  - Them tone system: ember, azure, rose de tao nhat quan giao dien.

- [frontend/src/components/PracticeTopicCard.tsx](frontend/src/components/PracticeTopicCard.tsx)
  - Lam moi card chu de voi gradient tones, border/shadow, hover transition.
  - Chuyen toan bo style sang class + style object toi thieu.

- [frontend/src/components/ActivityCard.tsx](frontend/src/components/ActivityCard.tsx)
  - Them tone theo loai activity: cyan, sunset, violet.
  - Cai thien icon badge, hierarchy text va hover states.

- [frontend/src/pages/HomePage.tsx](frontend/src/pages/HomePage.tsx)
  - Bo tri lai dashboard theo section ro rang:
    - Intro panel
    - Stats
    - Topics need practice
    - Learning activities
  - Them metric level/XP next level.
  - Dung skeleton card khi loading data.
  - Dong bo style voi he thong moi, giu nguyen logic lay du lieu.

- [frontend/src/pages/LoginPage.tsx](frontend/src/pages/LoginPage.tsx)
  - Thiet ke lai giao dien login/register de hien dai hon.
  - Dung logo hero.png, nhat quan style input/button/error.
  - Them aria-label cho button hien/an mat khau.

- [frontend/src/App.tsx](frontend/src/App.tsx)
  - Redesign PlaceholderPage de dong bo visual voi app.
  - Dung logo va class styles thay inline styles.

### Kiem tra
- Da chay build frontend thanh cong:
  - Lenh: `npm run build` trong `frontend/`
  - Ket qua: success, khong co TypeScript errors.

### Ghi chu
- Co giu nguyen logic API/auth hien tai; thay doi tap trung vao giao dien va trai nghiem.
- Khong can thay doi backend de su dung giao dien moi.
