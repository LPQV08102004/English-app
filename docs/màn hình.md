● Dựa vào business-context, ứng dụng cần khoảng 15 màn hình cho phía người dùng (user-facing), chia theo nhóm chức năng:                                            
                                                                                                                                                                    
  ---                                                                                                                                                               
  Auth (2 màn hình)                                                                                                                                                                                                                                                                                                                     
  ┌─────┬──────────┬───────────────────┐                                                                                                                            
  │  #  │ Màn hình │       Mô tả       │
  ├─────┼──────────┼───────────────────┤
  │ 1   │ Login    │ Email/password    │
  ├─────┼──────────┼───────────────────┤
  │ 2   │ Register │ Đăng ký tài khoản │
  └─────┴──────────┴───────────────────┘

  Home (1 màn hình)

  ┌─────┬──────────┬──────────────────────────────────────────┐
  │  #  │ Màn hình │                  Mô tả                   │
  ├─────┼──────────┼──────────────────────────────────────────┤
  │ 3   │ Home     │ Streak, XP, topics sai nhiều đẩy lên đầu │
  └─────┴──────────┴──────────────────────────────────────────┘

  Courses & Lessons (3 màn hình)

  ┌─────┬───────────────┬──────────────────────────────────────┐
  │  #  │   Màn hình    │                Mô tả                 │
  ├─────┼───────────────┼──────────────────────────────────────┤
  │ 4   │ Course List   │ Danh sách khóa học theo CEFR (A1–C2) │
  ├─────┼───────────────┼──────────────────────────────────────┤
  │ 5   │ Lesson List   │ Danh sách bài học trong một khóa     │
  ├─────┼───────────────┼──────────────────────────────────────┤
  │ 6   │ Lesson Detail │ Preview bài học trước khi bắt đầu    │
  └─────┴───────────────┴──────────────────────────────────────┘

  Quiz / Exercise (3 màn hình)

  ┌─────┬────────────────────────┬─────────────────────────────────────┐
  │  #  │        Màn hình        │                Mô tả                │
  ├─────┼────────────────────────┼─────────────────────────────────────┤
  │ 7   │ Quiz                   │ Trắc nghiệm & fill-in-the-blank     │
  ├─────┼────────────────────────┼─────────────────────────────────────┤
  │ 8   │ Quiz Result            │ Kết quả đúng/sai + giải thích       │
  ├─────┼────────────────────────┼─────────────────────────────────────┤
  │ 9   │ Retry / Practice Wrong │ Luyện lại câu sai sau khi xong khóa │
  └─────┴────────────────────────┴─────────────────────────────────────┘

  Vocabulary (3 màn hình)

  ┌─────┬──────────────┬───────────────────────────────────┐
  │  #  │   Màn hình   │               Mô tả               │
  ├─────┼──────────────┼───────────────────────────────────┤
  │ 10  │ Dictionary   │ Tìm kiếm, dịch Anh↔Việt, bookmark │
  ├─────┼──────────────┼───────────────────────────────────┤
  │ 11  │ Saved Words  │ Từ đã lưu cá nhân                 │
  ├─────┼──────────────┼───────────────────────────────────┤
  │ 12  │ Review Words │ Từ hay sai, cần ôn tập            │
  └─────┴──────────────┴───────────────────────────────────┘

  Profile & Progress (3 màn hình)

  ┌─────┬──────────┬────────────────────────────────────┐
  │  #  │ Màn hình │               Mô tả                │
  ├─────┼──────────┼────────────────────────────────────┤
  │ 13  │ Profile  │ Avatar, thông tin cá nhân, cấp độ  │
  ├─────┼──────────┼────────────────────────────────────┤
  │ 14  │ Progress │ XP, streak, % hoàn thành theo khóa │
  ├─────┼──────────┼────────────────────────────────────┤
  │ 15  │ Settings │ Cài đặt push notification giờ học  │
  └─────┴──────────┴────────────────────────────────────┘

  ---
  Admin CMS (3 màn hình — web hoặc tab riêng)

  ┌─────┬──────────────────────────────────┐
  │  #  │             Màn hình             │
  ├─────┼──────────────────────────────────┤
  │ 16  │ Admin: Quản lý Course            │
  ├─────┼──────────────────────────────────┤
  │ 17  │ Admin: Quản lý Lesson            │
  ├─────┼──────────────────────────────────┤
  │ 18  │ Admin: Quản lý Exercise/Question │
  ├─────┼──────────────────────────────────┤
  │ 18  │ Admin: Quản lý Exercise/Question │
  └─────┴──────────────────────────────────┘

  ---
  Tổng kết:
  - User app: 15 màn hình cốt lõi
  - Admin CMS: 3 màn hình thêm (thường làm web app riêng)

  Roadmap AI (upload PDF/URL → flashcard) sẽ thêm 1–2 màn hình nữa nhưng chưa cần ở giai đoạn này.

※ recap: Building a Flutter/Spring Boot English learning app. We just analyzed the business context and identified 15 user-facing screens needed. Next step is to     start implementing them. (disable recaps in /config)
                                                                                                                                                                    ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
❯  
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  ? for shortcuts
  │  #  │             Màn hình             │
  ├─────┼──────────────────────────────────┤
  │ 16  │ Admin: Quản lý Course            │
  ├─────┼──────────────────────────────────┤
  │ 17  │ Admin: Quản lý Lesson            │
  ├─────┼──────────────────────────────────┤
  │ 18  │ Admin: Quản lý Exercise/Question │
  └─────┴──────────────────────────────────┘

  ---
  Tổng kết:
  - User app: 15 màn hình cốt lõi
  - Admin CMS: 3 màn hình thêm (thường làm web app riêng)

  Roadmap AI (upload PDF/URL → flashcard) sẽ thêm 1–2 màn hình nữa nhưng chưa cần ở giai đoạn  
  này.
