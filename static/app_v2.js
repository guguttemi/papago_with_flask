const textAreaArray = document.getElementsByClassName('Card__body__content');
const [sourceTextArea, targetTextArea] = textAreaArray;
const [sourceSelect, targetSelect] = document.getElementsByClassName('form-select');

let targetLanguage = 'en';

targetSelect.addEventListener('change', () => {
    targetLanguage = targetSelect.value;
});

let debouncer;
sourceTextArea.addEventListener('input', (event) => {
    if (debouncer) {
        clearTimeout(debouncer);
    }

    debouncer = setTimeout(async () => {
        const text = event.target.value;
        if (!text) return;

        const body = {
            text,
            targetLanguage,
        };

        const url = '/translate';
        await fetch(url, optionsFrom('POST', body))
            .then(response => response.json())
            .then(async data => {
                const result = data.message.result;

                sourceSelect.value = result.srcLangType;
                targetTextArea.value = result.translatedText;
                targetSelect.value = result.tarLangType;
            })
            .catch(error => console.error(error));
    }, 2000);

});

// 유틸 메서드
const optionsFrom = (method, body, headers) => {
    return {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
    }
};