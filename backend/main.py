from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from datetime import date
import os
import google.generativeai as genai
import random
import string

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GENAI_API_KEY = os.getenv("GEMINI_API_KEY")
if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)

class DNARequest(BaseModel):
    dna: dict

def generate_specimen_name():
    colors = ["Veridian", "Cobalt", "Crimson", "Amber", "Azure", "Obsidian", "Ivory", "Jade", "Sable", "Coral"]
    return f"Synth-{random.choice(colors)}-{random.randint(1, 99)}"

DNA_TO_PERSONALITY_PROMPT = '''
You are Dr. Aris Thorne, a synthetic biologist studying artificial life.

Given the DNA structure of a digital organism from MorphLink, write a professional, imaginative *Zoologist’s Report* analyzing its behavior, instincts, and environment.

Output the report in this structure:

**Zoologist's Report: *Specimen Designation: [autogenerate]* **
**Date:** [current date]
**Subject:** Behavioral Analysis of Synthetic Organism based on provided genetic data.

...

Use this DNA data:

{dna_json}
'''

@app.post("/api/v1/creatures/personality")
async def generate_personality(req: DNARequest):
    if not GENAI_API_KEY:
        return {"error": "Gemini API key not set on server."}
    specimen = generate_specimen_name()
    today = date.today().strftime("%B %d, %Y")
    prompt = DNA_TO_PERSONALITY_PROMPT.format(dna_json=req.dna)
    prompt = prompt.replace("[autogenerate]", specimen).replace("[current date]", today)
    model = genai.GenerativeModel(model_name="gemini-1.5-flash")
    response = model.generate_content(prompt)
    return {"personality": response.text} 