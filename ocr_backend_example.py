# Exemplo de implementação OCR no backend FastAPI
# Este arquivo mostra como implementar OCR para extrair dados de documentos

# requirements.txt (adicione estas dependências)
"""
pytesseract==0.3.10
Pillow==10.0.0
opencv-python==4.8.0.76
python-multipart==0.0.6
"""

# Código FastAPI para OCR
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import pytesseract
from PIL import Image
import cv2
import numpy as np
import re
from typing import Dict, Any
import io

app = FastAPI()

# Configurar pytesseract (ajuste o path se necessário)
pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/tesseract'  # Linux
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'  # Windows

def preprocess_image(image: Image.Image) -> Image.Image:
    # Converter para OpenCV
    opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

    # Converter para escala de cinza
    gray = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2GRAY)

    # Aplicar threshold para melhorar o contraste
    _, threshold = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Reduzir ruído
    denoised = cv2.medianBlur(threshold, 3)

    # Converter de volta para PIL
    pil_image = Image.fromarray(denoised)

    return pil_image

def extract_cpf(text: str) -> str:
    # Padrões comuns de CPF
    cpf_patterns = [
        r'\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b',  # 123.456.789-01
        r'\b\d{11}\b',  # 12345678901
    ]

    for pattern in cpf_patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            # Remover formatação e validar
            cpf_clean = re.sub(r'\D', '', match)
            if len(cpf_clean) == 11 and validate_cpf(cpf_clean):
                return f"{cpf_clean[:3]}.{cpf_clean[3:6]}.{cpf_clean[6:9]}-{cpf_clean[9:]}"
    return ""

def validate_cpf(cpf: str) -> bool:
    # Implementação básica de validação CPF
    if len(cpf) != 11 or cpf == cpf[0] * 11:
        return False

    def calc_digit(cpf_slice: str, factor: int) -> int:
        total = sum(int(digit) * factor for digit, factor in zip(cpf_slice, range(factor, 1, -1)))
        remainder = total % 11
        return 0 if remainder < 2 else 11 - remainder

    d1 = calc_digit(cpf[:9], 10)
    d2 = calc_digit(cpf[:9] + str(d1), 11)

    return cpf[-2:] == f"{d1}{d2}"

def extract_name(text: str) -> str:
    # Procurar por padrões de nome (linhas com maiúsculas)
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        if len(line) > 5 and line[0].isupper() and not any(char.isdigit() for char in line):
            # Verificar se parece com um nome (sem números, com espaços)
            if ' ' in line and len(line.split()) >= 2:
                return line.title()
    return ""

def extract_birth_date(text: str) -> str:
    # Padrões de data de nascimento
    date_patterns = [
        r'\b\d{2}/\d{2}/\d{4}\b',  # 01/01/1990
        r'\b\d{2}-\d{2}-\d{4}\b',  # 01-01-1990
        r'\b\d{4}-\d{2}-\d{2}\b',  # 1990-01-01
    ]

    for pattern in date_patterns:
        matches = re.findall(pattern, text)
        if matches:
            date_str = matches[0]
            # Converter para formato YYYY-MM-DD
            if '/' in date_str:
                day, month, year = date_str.split('/')
            elif '-' in date_str:
                parts = date_str.split('-')
                if len(parts[0]) == 4:  # YYYY-MM-DD
                    year, month, day = parts
                else:  # DD-MM-YYYY
                    day, month, year = parts

            return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
    return ""

def extract_address_info(text: str) -> Dict[str, str]:
    address = {}

    # Procurar por CEP
    cep_match = re.search(r'\b\d{5}-?\d{3}\b', text)
    if cep_match:
        address['zip_code'] = cep_match.group().replace('-', '')[:5] + '-' + cep_match.group().replace('-', '')[5:]

    # Procurar por estado (UF)
    uf_match = re.search(r'\b[A-Z]{2}\b', text)
    if uf_match and len(uf_match.group()) == 2:
        address['state'] = uf_match.group()

    return address

@app.post("/clients/upload-document")
async def upload_document(file: UploadFile = File(...), create_client: bool = True):
    try:
        # Ler a imagem
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # Pré-processar imagem
        processed_image = preprocess_image(image)

        # Extrair texto com OCR
        text = pytesseract.image_to_string(processed_image, lang='por+eng')

        print(f"Texto extraído: {text}")  # Debug

        # Extrair informações
        extracted_data = {
            "name": extract_name(text),
            "cpf": extract_cpf(text),
            "birth_date": extract_birth_date(text),
            "address": extract_address_info(text),
            "raw_text": text  # Para debug
        }

        # Filtrar dados vazios
        extracted_data = {k: v for k, v in extracted_data.items() if v}

        return {
            "success": True,
            "message": "Documento processado com sucesso",
            "extracted_data": extracted_data,
            "filename": file.filename
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no processamento OCR: {str(e)}")

# Para testar: curl -X POST "http://localhost:8000/clients/upload-document" -F "file=@documento.jpg"
"""
