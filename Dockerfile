# build app
FROM node:18.15.0 as builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# run app
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
