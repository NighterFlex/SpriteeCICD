FROM nginx:1.27-alpine

ARG BUILD_COMMIT=local

COPY *.html *.css *.js *.ttf /usr/share/nginx/html/
COPY images/ /usr/share/nginx/html/images/

RUN sed -i "s/__BUILD_COMMIT__/${BUILD_COMMIT}/g" /usr/share/nginx/html/index.html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
