FROM python:3.11

WORKDIR /app

# Yeni context'e göre, requirements.txt artık aynı dizindedir.
COPY requirements.txt .
RUN pip install -r requirements.txt

# fastapi_app klasöründeki kodları kopyala
COPY fastapi_app/ .

EXPOSE 8001
