# https://hub.docker.com/hardened-images/catalog/dhi/node
FROM dhi.io/node:26-alpine-sfw-dev

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json yarn.lock /usr/src/app/
RUN yarn install
COPY . /usr/src/app
EXPOSE 3000
CMD ["yarn", "start"]