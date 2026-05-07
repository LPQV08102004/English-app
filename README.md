# English Learning App

Ứng dụng học tiếng Anh full-stack với lộ trình học theo chuẩn CEFR (A1–C2), hệ thống từ vựng, quiz tương tác và bảng quản trị nội dung.

## Tính năng

- **Đăng ký / Đăng nhập** — xác thực JWT, phân quyền USER / ADMIN
- **Khóa học & Bài học** — phân cấp Course → Lesson → Exercise theo chuẩn CEFR
- **Quiz tương tác** — nhiều dạng bài tập, chấm điểm tự động, lưu lịch sử làm bài
- **Từ điển** — tra cứu, lọc theo chủ đề / trình độ, lưu từ yêu thích
- **Ôn lỗi sai** — tự động tổng hợp từ làm sai để ôn lại
- **Hồ sơ cá nhân** — theo dõi XP, level, streak học hàng ngày
- **Bảng quản trị** — CRUD khóa học, bài học, bài tập, từ vựng, người dùng; xem event log

## Công nghệ sử dụng

### Backend

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| Java | 21 | Ngôn ngữ chính |
| Spring Boot | 4.0.2 | Framework web |
| Spring Security + JWT | — | Xác thực & phân quyền |
| Spring Data JPA / Hibernate | — | ORM, tương tác database |
| PostgreSQL | — | Cơ sở dữ liệu quan hệ |
| Lombok | — | Giảm boilerplate code |
| SpringDoc OpenAPI (Swagger) | — | Tài liệu API tự động |
| Maven | — | Build tool |

### Frontend

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 6 | Type-safe JavaScript |
| Vite | 8 | Build tool & dev server |
| Tailwind CSS | 4 | Utility-first CSS |
| React Router | 7 | Client-side routing |
| Axios | — | HTTP client với JWT interceptor |
| Lucide React | — | Icon library |

## Cấu trúc project

```
English_App/
├── backend/backend/          # Spring Boot application
│   └── src/main/java/com/englishapp/backend/
│       ├── auth/             # Đăng ký, đăng nhập, JWT, profile
│       ├── content/          # Course, Lesson, Exercise entities & API
│       ├── progress/         # XP, streak, lịch sử làm bài
│       ├── vocab/            # Từ điển, từ đã lưu, ôn lỗi sai
│       ├── admin/            # CRUD nội dung & quản lý user
│       ├── anylytics/        # Event logging & thống kê (giữ nguyên typo)
│       └── common/           # ApiResponse wrapper, exception handling
├── frontend/                 # React + Vite application
│   └── src/
│       ├── pages/            # Các trang (Home, Courses, Lesson, Quiz, Admin...)
│       ├── components/       # Shared components (Header, Card...)
│       ├── services/         # API client (api.ts, adminApi.ts)
│       ├── context/          # AuthContext (JWT + user state)
│       └── types/            # TypeScript type definitions
└── vocabulary_school.json    # Dữ liệu từ vựng chủ đề School
```

## Yêu cầu cài đặt

- **Java 21+**
- **Maven 3.9+** (hoặc dùng `./mvnw` wrapper đi kèm)
- **Node.js 18+** và **npm**
- **PostgreSQL** đang chạy trên `localhost:5432`

## Hướng dẫn cài đặt & chạy

### 1. Chuẩn bị Database

Tạo database PostgreSQL:

```sql
CREATE DATABASE english_db;
```

> Hibernate sẽ tự tạo bảng khi backend khởi động lần đầu (`ddl-auto=update`).

### 2. Cấu hình Backend

Mở `backend/backend/src/main/resources/application.properties` và cập nhật thông tin kết nối nếu cần:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/english_db
spring.datasource.username=postgres
spring.datasource.password=<your_password>
```

### 3. Chạy Backend

```bash
cd backend/backend
./mvnw spring-boot:run
```

Backend sẽ khởi động tại `http://localhost:8080`.

Swagger UI: `http://localhost:8080/swagger-ui.html`

### 4. Chạy Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại `http://localhost:3000`.

## API chính

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/auth/register` | Đăng ký tài khoản |
| `POST` | `/api/auth/login` | Đăng nhập, nhận JWT |
| `GET` | `/api/me` | Thông tin người dùng hiện tại |
| `GET` | `/api/courses` | Danh sách khóa học |
| `GET` | `/api/courses/{id}` | Chi tiết khóa học + danh sách bài học |
| `GET` | `/api/lessons/{id}` | Chi tiết bài học + danh sách bài tập |
| `POST` | `/api/lessons/{id}/exercises/{eid}/submit` | Nộp đáp án bài tập |
| `GET` | `/api/vocab/dictionary` | Tra từ điển |
| `POST` | `/api/vocab/save` | Lưu từ yêu thích |
| `GET` | `/api/vocab/mistakes` | Danh sách từ làm sai |
| `POST` | `/api/events/log` | Ghi event log |
| `GET` | `/api/admin/**` | Các API quản trị (yêu cầu role ADMIN) |

## Lệnh build & test

```bash
# Backend — chạy tests
cd backend/backend
./mvnw test

# Backend — build JAR (bỏ qua test)
./mvnw clean package -DskipTests

# Frontend — build production
cd frontend
npm run build

# Frontend — lint
npm run lint
```

## Lưu ý phát triển

- **Bảo mật:** Security hiện đang mở hoàn toàn (không enforce auth) — cần khóa lại trước khi deploy production.
- **Database:** `ddl-auto=update` phù hợp cho môi trường dev, đổi sang `validate` hoặc dùng migration tool (Flyway/Liquibase) cho production.
- **JWT Secret:** Thay thế secret trong `application.properties` bằng biến môi trường trước khi deploy.
- **Typo cố ý:** Thư mục `anylytics/` (thiếu chữ 'a') — giữ nguyên để không phá vỡ import.
