FROM node:16-alpine3.16 AS deps

# If you need libc for any of your deps, uncomment this line:
# RUN apk add --no-cache libc6-compat


WORKDIR /app
COPY ../package*.json ./
RUN npm install --frozwn-lockfile

# END DEPS IMAGE

#Handle our Build
FROM node:16-alpine3.16 AS BUILD_IMAGE

WORKDIR /app

# the rest of the source code to build the Next
# server for production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Remove all the development dependencies since we don't
# need them to run the actual server.
RUN rm -rf node_modules
RUN npm install --production --frozen-lockfile --ignore-scripts --prefer-offline

# END OF BUILD_IMAGE

# This starts our application's run image - the final output of build.
FROM node:16-alpine3.16

ENV NODE_ENV production


RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001


WORKDIR /app
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/next.config.js ./
COPY --from=BUILD_IMAGE --chown= /app/next-i18next.config.js ./
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/package*.json ./
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/public ./public
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/.next ./.next

# 4. OPTIONALLY the next.config.js, if your app has one
# COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/next.config.js  ./

USER nextjs

EXPOSE 3000

CMD [ "npm", "start" ]





