from google import genai
from config import config_instance

client = genai.Client(api_key=config_instance.gemeni_api_key)

def get_answer_from_gemeni(prompt: str) -> str:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return response.text