# ===== Giai đoạn 1: Build =====
# Dùng Node để build ra file tĩnh (HTML/CSS/JS)
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Biến môi trường cần có LÚC BUILD (Vite nhúng thẳng vào file JS)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

# ===== Giai đoạn 2: Serve =====
# Dùng Nginx nhẹ để phục vụ file tĩnh đã build ở bước trên
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Cấu hình Nginx để React Router hoạt động đúng (SPA fallback về index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]