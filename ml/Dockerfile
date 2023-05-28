FROM python:3.8-alpine

RUN \
  pip install pyspark && \
  mkdir -p /app

WORKDIR /app
COPY . .

RUN \
  echo "0 4 * * * ash -c 'cd /app && python main.py'" >> /etc/crontabs/root

CMD ["crond", "-l", "6", "-f"]
