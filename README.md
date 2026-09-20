# TodoList App

Ứng dụng quản lý công việc (Todo List) cho phép người dùng tạo, phân loại và theo dõi tiến độ các công việc cá nhân, tổ chức theo không gian làm việc (Space).

## Công nghệ sử dụng

**Frontend**
- React (Vite)
- Material UI
- React Router
- Axios / Fetch API

**Backend**
- Python — FastAPI
- SQLAlchemy (ORM)
- MySQL (hosted trên Aiven)
- JWT (python-jose) cho xác thực
- Passlib/Bcrypt cho mã hoá mật khẩu

**Triển khai (Deployment)**
- Frontend: Vercel
- Backend: Render
- Database: Aiven (MySQL)

## Tính năng chính

- Đăng ký / đăng nhập bằng email và mật khẩu
- Đăng nhập bằng Google (Google OAuth 2.0)
- Quản lý Task: tạo, sửa, xoá, đánh dấu hoàn thành, dời lịch (reschedule)
- Phân loại Task: Important, Planned
- Quản lý Space: tạo không gian làm việc riêng, nhóm task theo Space
- Giao diện responsive, hỗ trợ đăng nhập nhanh qua Google

## Vấn đề đã biết (Known Issues)

### Xác thực email (Email Verification)

Dự án có xây dựng sẵn cơ chế xác thực email sau khi đăng ký (gửi link xác nhận qua email thật), sử dụng SMTP (Gmail) hoặc Resend API. Tuy nhiên, tính năng này **hiện chưa hoạt động ổn định trên môi trường production** vì các lý do sau:

1. **SMTP bị chặn trên hosting miễn phí**: Render (gói Free) chặn kết nối outbound qua các cổng SMTP thông thường (587, 465), khiến việc gửi email trực tiếp qua Gmail SMTP từ server production bị timeout.
2. **Giới hạn của domain gửi mail miễn phí**: Khi chuyển sang dùng Resend (gửi email qua HTTP API), địa chỉ gửi thư mặc định (`onboarding@resend.dev`) chỉ cho phép gửi tới đúng email đã đăng ký tài khoản Resend, do domain gửi thư chưa được xác thực (cần sở hữu và verify một domain riêng qua bản ghi DNS).

→ **Kết quả**: Hiện tại, chức năng đăng ký bằng email/mật khẩu tồn tại nhưng bước xác thực email không gửi được cho người dùng bất kỳ. Vì vậy, **phương thức đăng nhập khuyến nghị và hoạt động ổn định trong bản deploy này là đăng nhập bằng Google**, không yêu cầu xác thực email bổ sung.

### Hướng khắc phục trong tương lai

- Mua và xác thực một domain riêng trên Resend để gỡ bỏ giới hạn gửi email
- Hoặc chuyển backend sang nền tảng hosting không chặn cổng SMTP (Railway, Fly.io...)
- Hoặc tạm thời vô hiệu hoá yêu cầu xác thực email bắt buộc khi đăng nhập bằng email/mật khẩu

## Cách sử dụng (hiện tại)

1. Truy cập ứng dụng
2. Chọn **"Login with Google"**
3. Đăng nhập bằng tài khoản Google — hệ thống tự động tạo tài khoản nếu chưa tồn tại
4. Bắt đầu quản lý công việc

> Đăng ký/đăng nhập bằng email và mật khẩu vẫn khả dụng để tạo tài khoản, nhưng do vấn đề xác thực email nêu trên, người dùng nên ưu tiên dùng **Google Login** để có trải nghiệm đầy đủ ngay lập tức.

## Cài đặt và chạy local

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Cần tạo file `.env` ở cả hai thư mục với các biến môi trường tương ứng (database, JWT secret, Google Client ID, cấu hình email...).

## Tác giả
Nguyễn Văn Tiến Đạt.

Cảm ơn mọi người đã sử dụng! Nếu có vấn đề gì hay lỗi gặp phải trong sử dụng, hãy email mình thông qua Email: nvtdat30052006@gmail.com
