"""
Example AI Proxy Server (Python + Flask)

This is a simple server that proxies AI requests to OpenAI/Anthropic.
Replace with your actual AI provider credentials and endpoints.

Setup:
1. pip install flask flask-cors openai anthropic python-dotenv
2. Create .env file with: OPENAI_API_KEY=your_key_here
3. python example-server.py
"""

import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

SYSTEM_PROMPT = """You are a compassionate, succinct recovery coach writing for a 62-year-old investigative journalist in San Francisco named Michael who is several weeks into daily oral naltrexone. Evenings (5–8 pm) are his risk window. He tends to isolate when anticipating evaluation by others ('audience problem'), uses secrecy as competence protection, and historically drank alone to 'get lost' (amnesty from roles). He values exercise, walking/hiking, music/jazz, and wants more social/structured activities as he approaches retirement. Tone: non-judgmental, specific, pragmatic, never shaming. Output only 2–4 reflection questions plus 1–2 supportive context notes. Keep total under 180 words."""

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/ai/generate', methods=['POST'])
def generate_ai_reflection():
    try:
        data = request.json
        chapter_summary = data.get('chapterSummary', '')
        prior_notes = data.get('priorNotes', [])
        recent_resonances = data.get('recentResonances', [])
        user_context = data.get('userContext', {})
        
        # Build context message
        notes_text = '\n'.join([f"{i+1}. {note}" for i, note in enumerate(prior_notes)]) if prior_notes else 'None yet'
        resonances_text = '\n'.join([f"{i+1}. {r}" for i, r in enumerate(recent_resonances)]) if recent_resonances else 'None yet'
        
        context_message = f"""
Chapter: {chapter_summary}

Recent notes from Michael:
{notes_text}

Recent resonant lines:
{resonances_text}

Current context:
- Time: {user_context.get('localTime', 'unknown')}
- Companionship: {user_context.get('companionship', 'unknown')}

Generate 2-4 tailored reflection questions and 1-2 supportive context notes (under 180 words total).
Format your response as JSON:
{{
  "prompts": ["question 1", "question 2", ...],
  "supportiveNotes": ["note 1", "note 2"]
}}
"""

        # OPTION 1: Use OpenAI API
        if os.getenv('OPENAI_API_KEY'):
            import openai
            openai.api_key = os.getenv('OPENAI_API_KEY')
            
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": context_message}
                ],
                temperature=0.7,
                max_tokens=400
            )
            
            response_text = response.choices[0].message.content
            
            # Extract JSON from response
            import re
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                result = json.loads(json_match.group(0))
                return jsonify(result)
            else:
                raise ValueError('Invalid AI response format')
        
        # OPTION 2: Use Anthropic Claude API
        elif os.getenv('ANTHROPIC_API_KEY'):
            import anthropic
            
            client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
            
            message = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=400,
                system=SYSTEM_PROMPT,
                messages=[
                    {"role": "user", "content": context_message}
                ]
            )
            
            response_text = message.content[0].text
            
            # Extract JSON from response
            import re
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                result = json.loads(json_match.group(0))
                return jsonify(result)
            else:
                raise ValueError('Invalid AI response format')
        
        # FALLBACK: Return mock response
        else:
            print('No API key found. Returning mock response.')
            return jsonify({
                "prompts": [
                    "What small action could you take today that aligns with this chapter's insight?",
                    "Which part of this resonates most with your experience right now?",
                    "If you could share one thing about this with Jean, what would it be?"
                ],
                "supportiveNotes": [
                    "Small steps compound over time.",
                    "Your context suggests this might be a good moment for reflection."
                ]
            })
            
    except Exception as e:
        print(f'AI generation error: {e}')
        return jsonify({
            'error': 'AI generation failed',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    api_provider = 'OpenAI' if os.getenv('OPENAI_API_KEY') else 'Anthropic' if os.getenv('ANTHROPIC_API_KEY') else 'Mock'
    print('\n✨ Recovery Reflections Server')
    print('📍 http://localhost:8000')
    print(f'🤖 AI: {api_provider}\n')
    app.run(port=8000, debug=True)
