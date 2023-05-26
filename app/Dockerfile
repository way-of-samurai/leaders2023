ARG NODE_VERSION="20.2.0"
FROM node:${NODE_VERSION}-alpine as build

WORKDIR /app
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN \
    npm install && \
    npx prisma generate && \
    npm run build

FROM node:${NODE_VERSION}-alpine

WORKDIR /app

RUN \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    npm install prisma --no-save

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=build /app/public ./public
COPY --from=build /app/next.config.js .
COPY --from=build /app/package.json .
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
