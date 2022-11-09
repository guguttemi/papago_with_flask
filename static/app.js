/**
 * 변수 네이밍 기준
 * source~ - 원본 언어 부분과 관련된 용어, 사용자가 번역하기 위해 작성하는 텍스트
 * target~ - 번역할 언어와 관련된 용어, 번역된 결과와 관련된 부분
 */

const textAreaArray = document.getElementsByClassName('Card__body__content');
const [sourceTextArea, targetTextArea] = textAreaArray;
const [sourceSelect, targetSelect] = document.getElementsByClassName('form-select');

let targetLanguage = 'en';

targetSelect.addEventListener('change', () => {
    const targetValue = targetSelect.value;
    targetLanguage = targetValue;
});

let debouncer;
sourceTextArea.addEventListener('input', (event) => {
    if (debouncer) {// 디바운싱
        clearTimeout(debouncer);
    }

    debouncer = setTimeout(() => {
        const xhr = new XMLHttpRequest(); // Ajax API 객체 선언 및 초기화
        const text = event.target.value; // 번역할 텍스트
        if (!text) return

        const url = '/translate'; // flask 서버의 번역 요청 전달을 위한 url

        xhr.onreadystatechange = () => {
            if (xhr.readyState === xhr.DONE && xhr.status === 200) {
                const parsedData = JSON.parse(xhr.responseText);
                const result = parsedData.message.result;

                // 감지된 언어 결과 화면에 렌더링
                sourceSelect.value = result.srcLangType;

                // 번역된 결과 텍스트 결과 화면에 렌더링
                targetTextArea.value = result.translatedText;
                targetSelect.value = result.tarLangType;
            }
        };

        // 요청 준비
        xhr.open('POST', url);

        // 요청을 보낼 때 동봉할 JS object
        const requestData = {
            text, // text: text // 프로퍼티와 변수명이 동일할 경우 하나만 써도 됨
            targetLanguage, // targetLanguage: targetLanguage와 같음
        };

        // 클라이언트가 서버에게 보내는 요청 데이터의 형식이 json 형식임을 명시
        xhr.setRequestHeader('Content-type', 'application/json');

        // 보내기 전에 해야 할 일, JS object를 문자열 타입의 JSON 포맷으로 변환(직렬화, Serialization)
        const jsonData = JSON.stringify(requestData);

        // 실제 요청 전송
        xhr.send(jsonData);

    }, 3000);
});