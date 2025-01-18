# syntax=docker/dockerfile:1

ARG NODE_VERSION=23

################################################################################

FROM node:${NODE_VERSION}-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build

RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app

# Install turbo globally
RUN pnpm add -g turbo

COPY . .

# Generate a partial monorepo with a pruned lockfile for a target workspace.
# Assuming "web" is the name entered in the project's package.json: { name: "web" }
RUN turbo prune @warden/discord --docker

FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --from=build /app/out/json/ .
RUN pnpm install

COPY --from=build /app/out/full/ .
RUN pnpm turbo run build --filter=@warden/discord...

RUN pnpm deploy --filter=@warden/discord --prod /prod/discord

# Run the application as a non-root user.
USER node

################################################################################

FROM base AS rest

COPY --from=installer /prod/discord/dist/rest/ /prod/discord/dist/rest/
COPY --from=installer /prod/discord/dist/config.js /prod/discord/dist/config.js
COPY --from=installer /prod/discord/dist/util.js /prod/discord/dist/util.js
COPY --from=installer /prod/discord/node_modules /prod/discord/node_modules

WORKDIR /prod/discord
EXPOSE 8000

# Run the application.
CMD ["node", "dist/rest/index.js"]

################################################################################

FROM base AS gateway

COPY --from=installer /prod/discord/dist/gateway/ /prod/discord/dist/gateway/
COPY --from=installer /prod/discord/dist/config.js /prod/discord/dist/config.js
COPY --from=installer /prod/discord/dist/util.js /prod/discord/dist/util.js
COPY --from=installer /prod/discord/node_modules /prod/discord/node_modules

WORKDIR /prod/discord
EXPOSE 8080

# Run the application.
CMD ["node", "dist/gateway/index.js"]

################################################################################

FROM base AS bot

COPY --from=installer /prod/discord/dist/bot/ /prod/discord/dist/bot/
COPY --from=installer /prod/discord/dist/config.js /prod/discord/dist/config.js
COPY --from=installer /prod/discord/dist/util.js /prod/discord/dist/util.js
COPY --from=installer /prod/discord/node_modules /prod/discord/node_modules
WORKDIR /prod/discord
EXPOSE 8081

# Run the application.
CMD ["node", "dist/bot/index.js"]

################################################################################

FROM rabbitmq:4.0-management-alpine AS rabbitmq

# Copy the rabbitmq plugins
COPY /apps/discord/rabbitmq/plugins/** plugins

HEALTHCHECK --interval=30s --timeout=30s --start-period=30s --retries=5 \
  CMD rabbitmq-diagnostics -q ping || exit 1

# Enable the required plugins
RUN rabbitmq-plugins enable rabbitmq_message_deduplication
