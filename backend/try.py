
import os
from PyPDF2 import PdfReader



def extract_text_from_pdf(file_obj):
    reader = PdfReader(file_obj)
    text = ''
    for page in reader.pages:
        text += page.extract_text() or ""
    return text

pdf = open('vce unit 1.pdf', 'rb')
text = extract_text_from_pdf(pdf)
print(text)

