FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY clasificar.py vigia_bot.py ./
CMD ["python", "-u", "vigia_bot.py"]
