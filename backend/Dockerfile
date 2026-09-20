# Dùng Python 3.12 bản slim (nhẹ hơn bản đầy đủ, đủ chạy FastAPI)
FROM python:3.12-slim

# Thư mục làm việc bên trong container
WORKDIR /app

# Copy requirements trước để tận dụng cache của Docker
# (chỉ cài lại pip package khi requirements.txt thay đổi, không phải mỗi lần sửa code)
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code backend vào container
COPY . .

# Port FastAPI sẽ chạy bên trong container
EXPOSE 8000

# Lệnh khởi động server khi container chạy
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]