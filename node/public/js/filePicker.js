var blob, width1 = 200, height1 = 150, url = document.location.href;

class FilePicker {
    constructor(options) {
        this.apiKey = options.apiKey;
        this.clientId = options.clientId;
        this.type = options.type;
        this.onSelect = options.onSelect;

        gapi.client.setApiKey(this.apiKey);
        gapi.client.load('drive', 'v2'/*, this._driveApiLoaded.bind(this)*/);
        google.load('picker', '1', { callback: /*this._pickerApiLoaded.bind(this)*/() => { } });
    }

    open() {
        var token = gapi.auth.getToken();
        if (token == null) {
            this._doAuth(false, function (authResult) {
                if (authResult && !authResult.error) {
                    this._showPicker();
                }
            }.bind(this));
        }
        else {
            this._showPicker();
        }
    }

    _showPicker() {
        let type;
        var accessToken = gapi.auth.getToken().access_token;
        //var uploadView = new google.picker.DocsUploadView();
        //var view = new google.picker.DocsView();
        //console.log(view);
        if (this.type == "image") {
            type = google.picker.ViewId.DOCS_IMAGES;
        }
        else if (this.type == "txt") {
            type = new google.picker.View(google.picker.ViewId.DOCS);
            type.setMimeTypes("text/plain");         
        }
        
        //view.setIncludeFolders(true);
        if (accessToken !== null) {
            this.picker = new google.picker.PickerBuilder()
                .enableFeature(google.picker.Feature.NAV_HIDDEN)
                //.enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
                .addView(type)
                //.addView(uploadView)
                //.addView(google.picker.ViewId.PDFS)
                .setAppId(this.clientId)
                .setLocale(localStorage.getItem("language"))
                //.setDeveloperKey(this.apiKey)
                .setOAuthToken(accessToken)
                .setCallback(this._pickerCallback.bind(this))
                .build()
                .setVisible(true);
        }
    }

    _pickerCallback(data) {
        //document.getElementById('animationTXTtoPDF').style.pointerEvents = "none";
        if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
            let x = this;
            var file = data[google.picker.Response.DOCUMENTS];
            var accessToken = gapi.auth.getToken().access_token;
            var xhr = new XMLHttpRequest();
            var url = "https://www.googleapis.com/drive/v3/files/" + file[0][google.picker.Document.ID] + "?alt=media";
            xhr.open('GET', url);
            xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
            xhr.responseType = "blob";

            xhr.addEventListener('load', function (e) {
                var fileResponse = this.response;
                if (this.response.type == "application/png" || this.response.type == "application/jpg" || this.response.type == "application/jpeg") {
                    var w, h, img = new Image();

                    var blob = URL.createObjectURL(this.response);
                    img.src = blob;

                    img.onload = function () {
                        w = img.width;
                        h = img.height;
                        console.log("NEW IMAGE width", this.naturalWidth);
                        console.log("NEW IMAGE height: ", this.naturalHeight);
                        x.onSelect(fileResponse, file[0].name, w, h);
                    }
                }
                else {                   
                    x.onSelect(fileResponse, file[0].name);
                }
            });

            xhr.send();
        }
        /*for (var i = 0; i < file.length; i++) {
            //id = file[i][google.picker.Document.ID],
            var request = gapi.client.drive.files.get({
                fileId: file[i][google.picker.Document.ID]
            });
            request.execute(this._fileGetCallback.bind(this));
        }*/
        else if (data[google.picker.Response.ACTION] == google.picker.Action.CANCEL) {
            document.getElementById('animationTXTtoPDF').style.pointerEvents = "auto";
        }
    }

    /*_fileGetCallback(file) {
        if (this.onSelect) {
            this.onSelect(file);
        }
    }*/

    _doAuth(immediate, callback) {
        gapi.auth.authorize({
            client_id: this.clientId,
            scope: 'https://www.googleapis.com/auth/drive.readonly',
            immediate: immediate
        }, callback);
    }
}

function initPicker() {
    let type;
    
    if (url.includes("JPEGtoPDF")) {
        type = 'image';
    }
    else if (url.includes("TXTtoPDF")) {
        type = 'txt';
    }

    var picker = new FilePicker({

        apiKey: 'AIzaSyCFUlNuZydQ9boh2lV7_YKwPtAqZn2fEBE',
        clientId: '106961012888-muimu47gclf1hrvht93nvajd13i3jv8g.apps.googleusercontent.com',
        type: type,
        onSelect: function (file, fileName, imgWidth, imgHeight) {

            if (imgWidth < imgHeight && imgHeight - imgWidth > 50) {
                [width1, height1] = [height1 + 50, width1];
            }

            else if (imgWidth < imgHeight && imgHeight - imgWidth <= 50) {
                height1 = width1;
            }

            readFile(file, fileName, width1, height1);
            convertToBase64(file);
            document.getElementById("labelForSVG").hidden = true;
            document.getElementById("progressBar").hidden = false;
            document.getElementById("file").hidden = true;
            document.getElementById("input-label").hidden = true;
            animationProgressBar();
            
        }
    });
    picker.open();

}

_doAuth1 = (immediate, callback) => {
    gapi.auth.authorize({
        client_id: '992900011626-f4bgsmm95qqsiknum7ron5ko7maqr1n9.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        immediate: immediate,
    }, callback);
}

_doUnauth = (immediate, callback) => {
    gapi.auth.authorize({
        client_id: '992900011626-f4bgsmm95qqsiknum7ron5ko7maqr1n9.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        immediate: immediate,
        authuser: -1,
        prompt: 'select_account'
    }, callback);
}

uploadToGoogleDrive = (token, file, metadata) => {
    var form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
        method: 'POST',
        headers: new Headers({ 'Authorization': 'Bearer ' + token }),
        body: form,
    }).then((res) => res.json()).then(alert("file was sent"))
}

// $("#change").on("click", function () {
//     var token = gapi.auth.getToken();

//     if (token == null) {
//         _doUnauth(true, function () {
//             google.load('picker', '1', { callback: () => { } });
//         });
//     }
//     else {
//         _doUnauth(false, function () {

//         });
//     }

// })

$("#uploadToGoogleDrive").on("click", function () {

    var doc = new jsPDF();
    var metadata = {
        'name': `CONVERTED${downloadName[0]}.pdf`,
        'mimeType': 'application/pdf'
    };

    if (url.includes("JPEGtoPDF")) {
        doc.addImage(base64, 'JPEG', 0, 0, width1, height1);
        width1 = 200;
        height1 = 150;       
    }

    else if (url.includes("TXTtoPDF")) {
        doc.text(reader.result, 10, 20);
    }

    var token = gapi.auth.getToken();

    if (token == null) {
        _doAuth1(false, function (authResult) {
            if (authResult && !authResult.error) {
                google.load('picker', '1', { callback: () => { } });
                uploadToGoogleDrive(gapi.auth.getToken().access_token, doc.output('blob'), metadata);
            }
        });
    }

    else {
        uploadToGoogleDrive(gapi.auth.getToken().access_token, doc.output('blob'), metadata);
    }

});

initDropbox = () => {
    //document.getElementById('animationTXTtoPDF').style.pointerEvents = "none";
    let type = [];

    if (url.includes("JPEGtoPDF")) {
        type = ['.png', '.jpg', '.jpeg', '.bmp']
    }

    else if (url.includes("TXTtoPDF")) {
        type = ['.txt']
    }

    var options = {
        success: function (files) {
            for (const file of files) {
                fetch(file.link)
                    .then(res => res.blob())
                    .then(blob => {
                        readFile(blob, file.name);
                        convertToBase64(blob);
                        document.getElementById("labelForSVG").hidden = true;
                        document.getElementById("progressBar").hidden = false;
                        document.getElementById("file").hidden = true;
                        document.getElementById("input-label").hidden = true;
                        animationProgressBar();
                    })
            }
            //document.getElementById('animationTXTtoPDF').style.pointerEvents = "auto";
        },

        cancel: function () {
            //document.getElementById('animationTXTtoPDF').style.pointerEvents = "auto";
        },

        linkType: "direct",
        multiselect: false,
        extensions: type,
    };

    Dropbox.choose(options);
};

uploadToDropbox = () => {
    var doc = new jsPDF();
    let name = `CONVERTED${downloadName[0]}.pdf`;
    
    if (url.includes("JPEGtoPDF")) {       
        doc.addImage(base64, 'JPEG', 0, 0, width1, height1);
        width1 = 200;
        height1 = 150;
        ToBase64(doc.output('blob'), name);
    }

    else if(url.includes("TXTtoPDF")) {
        doc.text(reader.result, 10, 20)      
        ToBase64(doc.output('blob'), name);
    }

}

const dropboxSave = (fileUrl, name) => {

    //document.getElementById('animationTXTtoPDF').style.pointerEvents = "none";

    var options = {

        files: [
            { 'url': fileUrl, 'filename': name },
        ],

        success: function () {
            //document.getElementById('animationTXTtoPDF').style.pointerEvents = "auto";
            alert("Success! File saved to your Dropbox.");
        },

        progress: function (progress) { },

        cancel: function () {
            //document.getElementById('animationTXTtoPDF').style.pointerEvents = "auto";
        },

        error: function (errorMessage) {
            console.log(errorMessage)
        },

        linkType: 'direct',

    };

    Dropbox.save(options);
}

function ToBase64(file, name) {

    var FR1 = new FileReader();

    FR1.addEventListener("load", function (e) {
        dropboxSave(e.target.result, name);
    });

    FR1.readAsDataURL(file);

}


// Download = (file) => {
//     console.log(file);
//     var a = document.createElement("a");
//     document.body.appendChild(a);
//     a.style = "display: none";
//     url = URL.createObjectURL(file);
//     a.href = url;
//     a.download = file.name;
//     a.click();
//     URL.revokeObjectURL(url);
// }
// document.getElementById('download').onclick = function (event) {
//     //var file = $("#files")[0].files[0];
//     var image = document.getElementById('image');
//     fetch(image.src)
//         .then(function (response) {
//             return response.blob()
//         })
//         .then(function (blob) {
//             Download(blob);
//         });
//     //Download(newfile); 
// }



