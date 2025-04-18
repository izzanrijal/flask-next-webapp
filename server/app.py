import pymysql
from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from dotenv import load_dotenv
import os
import jwt
from datetime import datetime, timedelta
import requests
import json as pyjson

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Enable CORS for all routes with all origins for debugging
CORS(app, supports_credentials=True)

def get_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT")),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        cursorclass=pymysql.cursors.DictCursor
    )

LOGIN_ATTEMPTS = {}
LOCKOUT_DURATION = timedelta(hours=24)
MAX_ATTEMPTS = 5

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    ip = request.remote_addr
    now = datetime.utcnow()

    attempts = LOGIN_ATTEMPTS.get(ip, {'count': 0, 'timestamp': now})
    if attempts['count'] >= MAX_ATTEMPTS:
        if now - attempts['timestamp'] < LOCKOUT_DURATION:
            return jsonify({'error': 'Too many login attempts', 'message': 'Please try again after 24 hours'}), 429
        else:
            LOGIN_ATTEMPTS[ip] = {'count': 0, 'timestamp': now}
            attempts = LOGIN_ATTEMPTS[ip]

    if email == os.getenv('ADMIN_EMAIL') and password == os.getenv('ADMIN_PASSWORD'):
        LOGIN_ATTEMPTS[ip] = {'count': 0, 'timestamp': now}
        token = jwt.encode(
            {'email': email, 'exp': datetime.utcnow() + timedelta(hours=24)},
            os.getenv('JWT_SECRET'),
            algorithm='HS256'
        )
        return jsonify({'token': token})
    else:
        attempts['count'] += 1
        attempts['timestamp'] = now
        LOGIN_ATTEMPTS[ip] = attempts
        return jsonify({
            'error': 'Authentication failed',
            'message': 'Invalid email or password',
            'attemptsLeft': max(0, MAX_ATTEMPTS - attempts['count'])
        }), 401

@app.route('/api/systems', methods=['GET'])
def get_systems():
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT id, topic FROM system_lists WHERE is_active = 1 ORDER BY topic ASC")
        systems = cursor.fetchall()
        cursor.close()
        connection.close()
        print(f"Systems fetched: {systems}")  # Debug log
        return jsonify(systems)
    except Exception as e:
        print(f"Error in get_systems: {str(e)}")  # Debug log
        return jsonify({'error': str(e)}), 500

@app.route('/api/questions', methods=['GET'])
def get_questions():
    try:
        system_id = request.args.get('systemId')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        offset = (page - 1) * limit

        connection = get_connection()
        cursor = connection.cursor()
        query = '''
            SELECT q.id, q.already_updated
            FROM questions_duplicated q
            JOIN subtopic_lists s ON q.subtopic_list_id = s.id
            JOIN topic_lists t ON s.topic_id = t.id
            WHERE t.system_id = %s
            ORDER BY q.id ASC
            LIMIT %s OFFSET %s
        '''
        cursor.execute(query, (system_id, limit, offset))
        questions = cursor.fetchall()
        cursor.close()
        connection.close()
        return jsonify(questions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/questions/<int:id>', methods=['GET'])
def get_question(id):
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute('SELECT * FROM questions_duplicated WHERE id = %s', (id,))
        question = cursor.fetchone()
        cursor.close()
        connection.close()
        if not question:
            return jsonify({
                'error': 'Question not found',
                'message': f'No question found with ID {id}'
            }), 404
        return jsonify(question)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/questions/<int:id>/generate', methods=['POST'])
def generate_question(id):
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute('SELECT scenario, question, option_a, option_b, option_c, option_d, option_e, correct_answer, discussion, learning_objective FROM questions_duplicated WHERE id = %s', (id,))
        original = cursor.fetchone()
        cursor.close()
        connection.close()
        if not original:
            return jsonify({'error': 'Question not found'}), 404
        # Compose prompt
        prompt = f'''
Berikut ini adalah soal klinis tingkat UKMPPD yang telah ada, dalam format JSON dari aplikasi:

{original}

Tugas Anda:
1. Identifikasi topik klinis atau diagnosis utama yang sedang diuji dari soal tersebut (berdasarkan jawaban yang benar).
2. Buat soal baru yang menguji diagnosis yang sama, namun dengan skenario klinis yang **sepenuhnya berbeda** (bukan parafrase, bukan pengulangan pola).
3. Skenario boleh berdasarkan anamnesis, pemeriksaan fisik, EKG, hasil lab, radiologi, atau gabungan data klinis lainnya.
4. Fokus soal tetap pada **penegakan diagnosis**, dan peserta harus dituntun untuk bernalar klinis untuk sampai ke diagnosis tersebut.
5. Buat lima pilihan jawaban (A–E), hanya satu yang benar, dan pastikan semua opsi terlihat kredibel secara medis.
6. Buat **pembahasan komprehensif**, menjelaskan:
    - Kenapa satu jawaban paling tepat,
    - Kenapa opsi lain salah, berdasarkan ilmu dan data klinis.
7. **Tentukan "learning_objective"** untuk soal tersebut, yang merupakan konsep inti atau tujuan pembelajaran yang diuji dalam soal ini. "Learning_objective" ini harus mencakup hal-hal seperti teori dasar, diagnosis utama, tanda klinis relevan, dan pendekatan pengobatan yang diperlukan untuk menjawab dengan benar. Fokus utama adalah pada apa yang perlu dipahami oleh calon dokter agar dapat menjawab soal dengan tepat, tanpa perlu mengungkapkan rincian soal atau skenario klinis secara keseluruhan. Buatlah dalam format yang ringkas dan langsung ke inti, yang mudah untuk dianalisis oleh AI.

**Format output HARUS dalam bentuk JSON**, dengan struktur berikut:
{{
  "scenario": "",
  "question": "",
  "option_a": "",
  "option_b": "",
  "option_c": "",
  "option_d": "",
  "option_e": "",
  "correct_answer": "",
  "discussion": "",
  "learning_objective": ""
}}

Gunakan Bahasa Indonesia akademik yang jelas, logis, dan mengalir klinis.
'''
        api_key = os.getenv('GROK_API_KEY')
        headers = {'Authorization': f'Bearer {api_key}'}
        payload = {
            'model': 'grok-3',
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are an expert medical question generator for a clinical education app. Your job is to create new, high-quality clinical case questions (with scenario, options, correct answer, discussion, and learning objective) for Indonesian medical students, following strict academic and clinical standards.'
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'max_tokens': 4000,
            'temperature': 0.9,
            'stream': False
        }
        response = requests.post('https://api.x.ai/v1/chat/completions', json=payload, headers=headers)
        if response.status_code != 200:
            return jsonify({'error': 'Grok API error', 'message': response.text}), 500
        result = response.json()
        # Flexible extraction: handle both direct object and content-in-message
        try:
            # Case 1: result is already the desired dict
            if all(k in result for k in ["scenario","question","option_a","option_b","option_c","option_d","option_e","correct_answer","discussion","learning_objective"]):
                return jsonify({'result': result})
            # Case 2: OpenAI-style response with choices/message/content
            if "choices" in result and result["choices"]:
                content = result["choices"][0]["message"]["content"]
                import json as pyjson
                parsed = pyjson.loads(content)
                return jsonify({'result': parsed})
            # Case 3: result is already wrapped in 'result' key
            if "result" in result and isinstance(result["result"], dict):
                return jsonify({'result': result["result"]})
            # Fallback
            return jsonify({'error': 'Unknown Grok response structure', 'raw': result}), 500
        except Exception as err:
            return jsonify({'error': 'Failed to parse Grok content', 'message': str(err), 'raw': result}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/questions/<int:id>', methods=['PATCH'])
def update_question(id):
    data = request.get_json()
    required = ['scenario', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'option_e', 'correct_answer', 'discussion', 'learning_objective']
    for key in required:
        if not data.get(key):
            return jsonify({'error': f'Missing or empty field: {key}'}), 400
    if data['correct_answer'] not in {'A', 'B', 'C', 'D', 'E'}:
        return jsonify({'error': 'correct_answer must be one of: A, B, C, D, E'}), 400
    try:
        connection = get_connection()
        cursor = connection.cursor()
        # Backup original
        cursor.execute('SELECT * FROM questions_duplicated WHERE id = %s', (id,))
        original = cursor.fetchone()
        if not original:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Question not found'}), 404
        cols = ','.join(original.keys())
        vals = tuple(original.values())
        placeholders = ','.join(['%s'] * len(original))
        # cursor.execute(f'INSERT INTO questions_backup ({cols}) VALUES ({placeholders})', vals)

        # Update ke tabel questions_duplicated sesuai schema dan id
        update_query = '''UPDATE questions_duplicated SET scenario=%s, question=%s, option_a=%s, option_b=%s, option_c=%s, option_d=%s, option_e=%s, correct_answer=%s, discussion=%s, learning_objective=%s, already_updated=1 WHERE id=%s'''
        update_values = (
            data['scenario'],
            data['question'],
            data['option_a'],
            data['option_b'],
            data['option_c'],
            data['option_d'],
            data['option_e'],
            data['correct_answer'],
            data['discussion'],
            data['learning_objective'],
            id
        )
        cursor.execute(update_query, update_values)
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/progress', methods=['GET'])
def get_progress():
    try:
        connection = get_connection()
        cursor = connection.cursor()
        
        cursor.execute('SELECT COUNT(*) as total FROM questions_duplicated')
        total = cursor.fetchone()['total']
        
        cursor.execute('SELECT COUNT(*) as updated FROM questions_duplicated WHERE already_updated = TRUE')
        updated = cursor.fetchone()['updated']
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'totalCount': total,
            'updatedCount': updated
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/raw-questions', methods=['GET'])
def get_raw_questions():
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM questions")
        result = cursor.fetchall()
        column_names = [desc[0] for desc in cursor.description]
        # Optionally: return as list of dicts (for JSON)
        questions = [dict(zip(column_names, row.values())) for row in result]
        cursor.close()
        connection.close()
        return jsonify(questions)
    except Exception as err:
        return jsonify({'error': str(err)}), 500

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    return jsonify({"status": "ok", "message": "Flask API is working"})

if __name__ == '__main__':
    app.run(port=3001, debug=True)