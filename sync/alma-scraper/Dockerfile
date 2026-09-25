# Playwright base image version must match the playwright version in package.json
FROM mcr.microsoft.com/playwright:v1.61.1-noble
WORKDIR /app
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
COPY package.json ./
RUN npm install --omit=dev --no-fund --no-audit
COPY scrape.mjs entrypoint.sh ./
RUN chmod +x entrypoint.sh
# Headed Chromium under a virtual display - required to pass the Cloudflare challenge.
# Xvfb is started directly (not via xvfb-run, whose Xauthority cookie broke
# Chromium's display connection on first deploy).
CMD ["/app/entrypoint.sh"]
