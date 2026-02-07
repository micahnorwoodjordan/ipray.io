FROM python:3.12-slim

ENV MYSQL_DATABASE=""
ENV MYSQL_USER=""
ENV MYSQL_PASSWORD=""
ENV MYSQL_HOST=""
ENV MYSQL_PORT=""
ENV MAILGUN_API_KEY=""
ENV MAILGUN_DOMAIN=""
ENV MAILGUN_FROM=""
ENV ADMIN_NOTIFICATION_EMAIL=""
ENV RATE_LIMIT_MINUTES=""
ENV SITE_HOSTS=""
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential libpq-dev default-libmysqlclient-dev pkg-config && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN ls -ahl && sleep 5

CMD ["python", "manage.py", "runserver", "0.0.0.0:80"]
