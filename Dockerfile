FROM node:20-alpine AS builder

ARG CHINA_MIRROR=false

# enable china mirror when CHINA_MIRROR is true
RUN if [ "$CHINA_MIRROR" = "true" ] ; then \
    echo "Enable China Alpine Mirror" && \
    sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories; \
    fi

RUN if [ "$CHINA_MIRROR" = "true" ] ; then \
    echo "Enable China NPM Mirror" && \
    npm config set registry https://registry.npmmirror.com; \
    fi

# build toolchain for native dependencies (sqlite3)
RUN apk add --update python3 make g++ curl

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --omit=dev


FROM node:20-alpine

LABEL org.opencontainers.image.title="WhiteboardRT Storage Backend"
LABEL org.opencontainers.image.description="Self-hosted HTTP storage backend for WhiteboardRT scenes, rooms, and files"
LABEL org.opencontainers.image.source="https://github.com/homeserverhq/whiteboardrt-storage-backend"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist

USER node

EXPOSE 8080

ENTRYPOINT ["npm", "run", "start:prod"]
