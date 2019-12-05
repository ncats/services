FROM keymetrics/pm2:8-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh tzdata

# Add global node packages
RUN npm i -g lsc

COPY motd /etc/motd

RUN echo '[ ! -z "$TERM" -a -r /etc/motd ] && cat /etc/motd' >> /root/.bashrc

CMD ["exec","$@"]
