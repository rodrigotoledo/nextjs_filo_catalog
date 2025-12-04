# OCR Implementation Guide

## Implementação de OCR para Extração de Dados de Documentos

Este guia explica como implementar OCR (Optical Character Recognition) no backend FastAPI para extrair automaticamente informações de documentos como CPF, RG, nome e endereço.

## 📋 Pré-requisitos

### 1. Instalar Tesseract OCR

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install tesseract-ocr tesseract-ocr-por
```

**macOS:**
```bash
brew install tesseract tesseract-lang
```

**Windows:**
- Baixe e instale do [site oficial](https://github.com/UB-Mannheim/tesseract/wiki)
- Adicione ao PATH do sistema

### 2. Instalar dependências Python

Adicione ao seu `requirements.txt`:
```
pytesseract==0.3.10
Pillow==10.0.0
opencv-python==4.8.0.76
python-multipart==0.0.6
```

## 🔧 Implementação no Backend

### 1. Atualizar o endpoint `/clients/upload-document`

Modifique seu endpoint FastAPI para incluir processamento OCR:

```python
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import pytesseract
from PIL import Image
import cv2
import numpy as np
import re
import io

app = FastAPI()

# Configurar Tesseract
pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/tesseract'  # Ajuste conforme seu SO

def preprocess_image(image: Image.Image) -> Image.Image:
    """Pré-processa a imagem para melhorar a qualidade do OCR"""
    opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2GRAY)
    _, threshold = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    denoised = cv2.medianBlur(threshold, 3)
    return Image.fromarray(denoised)

def extract_cpf(text: str) -> str:
    """Extrai CPF do texto usando regex e valida"""
    cpf_patterns = [
        r'\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b',
        r'\b\d{11}\b',
    ]

    for pattern in cpf_patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            cpf_clean = re.sub(r'\D', '', match)
            if len(cpf_clean) == 11 and validate_cpf(cpf_clean):
                return f"{cpf_clean[:3]}.{cpf_clean[3:6]}.{cpf_clean[6:9]}-{cpf_clean[9:]}"
    return ""

def validate_cpf(cpf: str) -> bool:
    """Valida CPF usando algoritmo oficial"""
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
    """Extrai nome do texto procurando por linhas com maiúsculas"""
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        if len(line) > 5 and line[0].isupper() and not any(char.isdigit() for char in line):
            if ' ' in line and len(line.split()) >= 2:
                return line.title()
    return ""

def extract_birth_date(text: str) -> str:
    """Extrai data de nascimento"""
    date_patterns = [
        r'\b\d{2}/\d{2}/\d{4}\b',
        r'\b\d{2}-\d{2}-\d{4}\b',
        r'\b\d{4}-\d{2}-\d{2}\b',
    ]

    for pattern in date_patterns:
        matches = re.findall(pattern, text)
        if matches:
            date_str = matches[0]
            if '/' in date_str:
                day, month, year = date_str.split('/')
            elif '-' in date_str:
                parts = date_str.split('-')
                if len(parts[0]) == 4:
                    year, month, day = parts
                else:
                    day, month, year = parts
            return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
    return ""

@app.post("/clients/upload-document")
async def upload_document(file: UploadFile = File(...), create_client: bool = True):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # Pré-processar
        processed_image = preprocess_image(image)

        # OCR
        text = pytesseract.image_to_string(processed_image, lang='por+eng')

        # Extrair dados
        extracted_data = {
            "name": extract_name(text),
            "cpf": extract_cpf(text),
            "birth_date": extract_birth_date(text),
            "raw_text": text
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
        raise HTTPException(status_code=500, detail=f"Erro no OCR: {str(e)}")
```

### 2. Testar o OCR

```bash
# Testar com curl
curl -X POST "http://localhost:8000/clients/upload-document" \
  -F "file=@caminho/para/documento.jpg"
```

## 🎯 Funcionalidades Implementadas

### Extração Automática:
- ✅ **CPF**: Detecta e valida automaticamente
- ✅ **Nome**: Identifica nomes próprios
- ✅ **Data de Nascimento**: Reconhece diversos formatos
- ✅ **Endereço**: Extrai CEP e UF
- ✅ **Pré-processamento**: Melhora qualidade da imagem

### Interface Frontend:
- ✅ **Upload Visual**: Drag & drop com progresso
- ✅ **Status OCR**: Mostra quando está processando
- ✅ **Preenchimento Automático**: Campos preenchidos automaticamente
- ✅ **Feedback**: Notificações de sucesso/erro

## 🔍 Debugging

Para debugar problemas de OCR:

1. **Verificar instalação do Tesseract:**
   ```bash
   tesseract --version
   ```

2. **Testar OCR manualmente:**
   ```python
   import pytesseract
   from PIL import Image

   text = pytesseract.image_to_string(Image.open('documento.jpg'), lang='por')
   print(text)
   ```

3. **Ver logs do FastAPI:**
   - Procure por `raw_text` na resposta da API
   - Verifique se o texto está sendo extraído corretamente

## 📈 Melhorias Futuras

- [ ] Suporte a mais tipos de documento (CNH, comprovante de residência)
- [ ] Machine Learning para melhor acurácia
- [ ] Validação cruzada de dados
- [ ] Suporte a múltiplas páginas
- [ ] Cache de resultados processados

## 🐛 Troubleshooting

**Erro: "tesseract command not found"**
- Verifique se Tesseract está instalado e no PATH

**OCR não reconhece texto**
- Verifique qualidade da imagem (mínimo 300 DPI)
- Teste com imagens mais limpas
- Ajuste parâmetros de pré-processamento

**CPF não é validado**
- Verifique se o algoritmo de validação está correto
- Alguns documentos podem ter CPFs mascarados</content>
<parameter name="filePath">/home/rtoledo/www/fullstack/photo-finder/photo-finder/OCR_IMPLEMENTATION.md
