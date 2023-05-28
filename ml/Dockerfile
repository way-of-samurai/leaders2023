FROM python:3.8-alpine

RUN \
  apk --no-cache add musl-dev linux-headers g++ openjdk8 && \
  pip install pyspark numpy && \
  mkdir -p /app

ENV JAVA_HOME="/usr/lib/jvm/java-1.8-openjdk"

WORKDIR /app
COPY . .

RUN \
  echo "0 4 * * * ash -c 'cd /app && python main.py'" >> /etc/crontabs/root

CMD ["crond", "-l", "6", "-f"]
