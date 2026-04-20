FROM nginx:alpine

RUN apk --no-cache upgrade \
    && rm -rf /usr/share/nginx/html/*

COPY . /usr/share/nginx/html/

EXPOSE 80
