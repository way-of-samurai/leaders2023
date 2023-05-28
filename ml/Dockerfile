FROM ubuntu:latest

# Install OpenJDK 8
RUN \
  apt-get update && \
  apt-get install -y openjdk-8-jdk cron && \
  rm -rf /var/lib/apt/lists/*

# Install Python
RUN \
    apt-get update && \
    apt-get install -y python-is-python3 python-dev-is-python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Install PySpark and Numpy
RUN \
    pip install --upgrade pip && \
    pip install numpy && \
    pip install pyspark==3.2.1

# Define working directory
WORKDIR /app

COPY . .

RUN \
  echo "* * * * * cd /app && python main.py > /dev/stdout" >> /etc/crontab

CMD ["cron", "-l", "6", "-f"]
