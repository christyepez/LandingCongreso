FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN cat assets_b64/index.html.part* | base64 -d > index.html \
 && cat assets_b64/styles.css.part* | base64 -d > styles.css \
 && cat assets_b64/logo-indoamerica.png.part* | base64 -d > logo-indoamerica.png \
 && cat assets_b64/hero-cover.webp.part* | base64 -d > hero-cover.webp \
 && cat assets_b64/hero-background.mp4.part* | base64 -d > hero-background.mp4 \
 && mkdir -p /app/data
EXPOSE 8080
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "1", "--threads", "4", "server:app"]
