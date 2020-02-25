var all = document.querySelectorAll('[key]');

var sendAjaxQuery = (language) => {
    $.ajax({
        url: 'languages/' + language + '.json',
        dataType: 'json',
        async: true,
        success: function (lang) {
            all.forEach(element => {
                element.textContent = lang[element.attributes.key.value];
            })
        },
        error: function (jqXhr, textStatus, errorMessage) {
            $('p').append('Error: ' + errorMessage);
        }
    });
}

function setLanguage(language) {
    localStorage.setItem("language", language);
    sendAjaxQuery(language);
}


var defineBrowserlanguage = () => {
    var language;
    if (localStorage.getItem("language") == null || localStorage.getItem("language") == undefined) {
        language = window.navigator ? (window.navigator.language ||
            window.navigator.systemLanguage ||
            window.navigator.userLanguage) : "en";
        language = language.substr(0, 2).toLowerCase();
        localStorage.setItem("language", language);
    }
    else {
        language = localStorage.getItem("language");
    }
    sendAjaxQuery(language);
}

defineBrowserlanguage();





