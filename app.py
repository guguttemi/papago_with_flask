from flask import Flask, render_template, request, jsonify
import urllib.request
import json

app = Flask(__name__)

# 감지 & 번역 공통 API key
client_id = 'yzseDax86RTVIqs_dTBJ'
client_secret = 'XkcPmAR2VT'

# papago 메인 페이지
@app.route('/') # localhost:5000/ 라고 입력했을 때 렌더링되는 화면
def hello_word():
    # return '<p>Hello, World!</p>' # 응답 데이터 출력용 테스트 코드
    return render_template('index.html')

# 감지 및 번역 요청 기능
@app.route('/translate', methods = ['POST'])
def do_papago():
    if request.method == 'POST':
        text, target_language = request.json.values()

        # 언어 감지 함수 호출
        source_language = detect_language(text)
        
        # 동일한 언어 타입으로 요청 시 예외처리
        if source_language == target_language: # 소스 언어와 타겟 언어의 언어가 같고,
            if source_language != 'ko': # 소스 언어가 한국어가 아니면
                target_language = 'ko' # 타겟 언어를 한국어로 변경
            elif source_language == 'ko': # 소스 언어가 한국어면
                target_language = 'en' # 타겟 언어를 영어로 변경
            
        encoded_text = urllib.parse.quote(text)
        data = f'source={source_language}&target={target_language}&text={encoded_text}'

        response_json = neural_machine_translation(data)

        return jsonify(response_json)

# 언어 감지 API 
def detect_language(text):
    encoded_query = urllib.parse.quote(text)
    data = 'query=' + encoded_query

    ntm_url = 'https://openapi.naver.com/v1/papago/detectLangs'
    request = urllib.request.Request(ntm_url)

    # HTTP 요청 헤더(Request header)에 클라이언트 아이디와 클라이언트 시크릿 추가
    request.add_header('X-Naver-Client-Id', client_id)
    request.add_header('X-Naver-Client-Secret', client_secret)

    response = urllib.request.urlopen(request, data=data.encode('utf-8'))
    response_status_code = response.getcode()
    source_lang_code = '' # 감지된 언어 코드를 담을 변수

    if(response_status_code == 200):
        response_body = response.read()
        parsed_to_json = json.loads(response_body.decode('utf-8')) # convert str to dict(JSON format)
        source_lang_code = parsed_to_json['langCode']

    else:
        print('Error Code:' + response_status_code)

    return source_lang_code # 감지된 언어 코드(ko, ja 등)

# 언어 번역 API
def neural_machine_translation(data) :
    url = 'https://openapi.naver.com/v1/papago/n2mt'
    api_request = urllib.request.Request(url)

    # HTTP 요청 헤더(Request header)에 클라이언트 아이디와 클라이언트 시크릿 추가
    api_request.add_header('X-Naver-Client-Id', client_id)
    api_request.add_header('X-Naver-Client-Secret', client_secret)

    response = urllib.request.urlopen(api_request, data=data.encode('utf-8'))
    response_status_code = response.getcode()
    if(response_status_code == 200):
        response_body = response.read() # bytes
        response_body = response_body.decode('utf-8') # str
        response_json = json.loads(response_body)
        return response_json
    else:
        print('Error Code:' + response_status_code)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)