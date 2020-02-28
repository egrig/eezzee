var blob, url = document.location.href;

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
                console.log(this.response.type);
                if (this.response.type == "application/png" || this.response.type == "application/jpg" || this.response.type == "application/jpeg" || this.response.type == "image/png" || this.response.type == "image/jpeg" || this.response.type == "image/jpg" || this.response.type == "image/gif" || this.response.type == "image/bmp") {
                    var w, h, img = new Image();

                    var blob = URL.createObjectURL(this.response);
                    img.src = blob;

                    img.onload = function () {
                        w = img.width;
                        h = img.height;
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
            //document.getElementById('animationTXTtoPDF').style.pointerEvents = "auto";
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
            scope: 'https://www.googleapis.com/auth/drive',
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

        apiKey: 'AIzaSyBpVUPPAwmrvl-zBqDHgIMoQhB0vbC8alo',
        clientId: '927698673820-vdtd3se61vmdsf96qe3reae7d4isjj7v.apps.googleusercontent.com',
        type: type,
        onSelect: function (file, fileName, imgWidth, imgHeight) {

            if (imgWidth >= 1920 && imgHeight >= 1080) {
                [imgWidth, imgHeight] = [imgWidth / 2, imgHeight / 2];
            }
            else if (imgWidth - imgHeight > 600 || imgHeight - imgWidth > 600) {
                [imgWidth, imgHeight] = [imgWidth / 2, imgHeight / 2];
            }

            readFile(file, fileName, imgWidth, imgHeight);
            convertToBase64(file);
            document.getElementById("labelForSVG").hidden = true;
            document.getElementById("progressBar").hidden = false;
            document.getElementById("file").hidden = true;
            //document.getElementById("input-label").hidden = true;
            animationProgressBar();
            
        }
    });
    picker.open();

}

_doAuth1 = (immediate, callback) => {
    gapi.auth.authorize({
        client_id: '927698673820-vdtd3se61vmdsf96qe3reae7d4isjj7v.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/drive',
        immediate: immediate,
    }, callback);
}

_doUnauth = (immediate, callback) => {
    gapi.auth.authorize({
        client_id: '927698673820-vdtd3se61vmdsf96qe3reae7d4isjj7v.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/drive',
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
    }).then((res) => res.json())
    .then(function(val) {
        console.log(val);
    });
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
        if (width < 500 && height < 500 && width > height) {
            [width, height] = [width / 3, height / 3];
            doc = new jsPDF('l', 'mm', [width, height]);
        } else if (width > height && width - height > 100) {
            doc = new jsPDF('l', 'mm', [width, height]);
        }
        else {
            doc = new jsPDF('p', 'mm', [width, height]);
        }
        doc.addImage(base64, 'JPEG', 0, 0, width, height);
        width = 200;
        height = 150;
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
        type = ['.png', '.jpg', '.jpeg', '.bmp', '.gif']
    }

    else if (url.includes("TXTtoPDF")) {
        type = ['.txt']
    }

    var options = {
        success: async function (files) {
            for (const file of files) {

               await fetch(file.link)
                    .then(res => res.blob())
                    .then(blob => {
                        var img = new Image(); 
                        img.src = URL.createObjectURL(blob);;

                        img.onload = function () {

                            if(img.width>=1920 && img.height>=1080){
                                [img.width, img.height] = [img.width/2, img.height/2];
                            }
                            else if(img.width-img.height>600 || img.height-img.width>600){
                                [img.width, img.height] = [img.width/2, img.height/2];
                            }
                            readFile(blob, file.name, img.width, img.height);
                            convertToBase64(blob);
                            document.getElementById("labelForSVG").hidden = true;
                            document.getElementById("progressBar").hidden = false;
                            document.getElementById("file").hidden = true;
                           // document.getElementById("input-label").hidden = true;
                            animationProgressBar();
                        }
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
        doc.addImage(base64, 'JPEG', 0, 0, width, height);
        width = 200;
        height = 150;
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



