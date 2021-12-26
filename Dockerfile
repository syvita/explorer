FROM node:16-alpine AS deps

COPY . .

RUN apk --no-cache add --virtual \
  native-deps \
  g++ \
  gcc \
  libgcc \
  libstdc++ \
  linux-headers \
  make \
  python3 \
  && npm install --quiet node-gyp -g \
  && yarn \
  && apk del native-deps

ENV NODE_ENV=production

RUN yarn build
RUN yarn cache clean

EXPOSE 3000
CMD [ "yarn", "start" ]
