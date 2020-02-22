let reader = new FileReader(), width = 0, height = 0, base64, name, downloadName;
function readFile(input, nameFile = 'file', imgWidth = 200, imgHeight = 150) {
    /*if(imgWidth<imgHeight && imgHeight-width>50){
        [width, height] = [height, width];
    }
    else if(imgWidth<imgHeight && imgHeight-width<=50){
        height = width;
    }*/
    width = imgWidth;
    height = imgHeight;

    let file;

    if (nameFile !== 'file') {
        file = input;
        name = nameFile;
        downloadName = nameFile.split(".");
    }
    else {
        file = input.files[0];
        name = file.name;
        downloadName = name.split(".");
    }

    reader.readAsText(file);
}


var animationProgressBar = () => {
    if (document.getElementById("animationTXTtoPDF")) document.getElementById("animationTXTtoPDF").style.border = "2px solid #d2694c";
    if (document.getElementById("animationJPEGtoPDF")) document.getElementById("animationJPEGtoPDF").style.border = "2px solid #d2694c";
    var count = $(('#count'));
    $({ Counter: 0 }).animate({ Counter: count.text() }, {
        duration: 4000,
        easing: 'linear',
        step: function () {
            count.text(Math.ceil(this.Counter) + "%");
            if (Math.ceil(this.Counter) == 100) {
                setTimeout(() => {
                    document.getElementById("progressBar").hidden = true;
                    document.getElementById("convFile").hidden = false;
                    document.getElementById("input-label").hidden = true;
                    document.getElementById("convFileName").innerHTML = `CONVERTED${downloadName[0]}.pdf`;
                    //document.getElementById('animationTXTtoPDF').style.pointerEvents = "auto";
                }, 1000);
            }
        }
    });
}




//$(document).ready(function(){
    $('input[type="file"]').change(function(e){
        //if (localStorage.getItem("type") == "txtToPDF")
        var fileName = e.target.files[0].name;
        if (localStorage.getItem("type") == "txtToPDF") {
            if (!fileName.endsWith(".txt")){
                document.getElementById("animationTXTtoPDF").hidden = true;
                document.getElementById("cfTXTtoPDF").hidden = true;
                document.getElementById("errorTXTtoPDF").hidden = false;
            }
            else {
                document.getElementById("labelForSVG").hidden = true;
                document.getElementById("progressBar").hidden = false;
                document.getElementById("file").hidden = true;
                animationProgressBar();
            }

        } else if (localStorage.getItem("type") == "jpegToPDF") {

            if (!fileName.endsWith(".jpeg") && !fileName.endsWith(".jpg") && !fileName.endsWith(".svg") && !fileName.endsWith(".giv") && !fileName.endsWith(".bmp") && !fileName.endsWith(".webm") && !fileName.endsWith(".png")){
                document.getElementById("animationJPEGtoPDF").hidden = true;
                document.getElementById("cfJPEGtoPDF").hidden = true;
                document.getElementById("errorJPEGtoPDF").hidden = false;
            }
            else {
                document.getElementById("labelForSVG").hidden = true;
                document.getElementById("progressBar").hidden = false;
                document.getElementById("file").hidden = true;
                animationProgressBar();
            }

        }

        document.getElementById("actionStartOver").addEventListener('click', () => {
            document.location.reload(true);
        });

        // document.getElementById("GD").hidden = true;
        



        // const animationPromise = new Promise((resolve, reject) => {
        //     resolve(animationProgressBar());
        // })

        // animationPromise.then((result) => {
        //     console.log(result);
        //     document.getElementById("progressBar").hidden = true;
        // })


        //convertToBase64();
        // alert('The file "' + fileName +  '" has been selected.');
    });
//});





function convertToBase64(file) {

    var FR = new FileReader();

    FR.addEventListener("load", function (e) {
        base64 = e.target.result;
    });

    if (this.files && this.files[0]) {
        FR.readAsDataURL(this.files[0]);
    }

    else {
        FR.readAsDataURL(file);
    }

}


document.getElementById("file").addEventListener("change", convertToBase64);

document.getElementById('actionD').addEventListener("click", () => {

    var doc = new jsPDF();

    if (localStorage.getItem("type") == "txtToPDF") {
        doc.text(reader.result, 10, 20);
        doc.save(`CONVERTED${downloadName[0]}.pdf`);
        document.getElementById("convFileName").innerHTML = `CONVERTED${downloadName[0]}.pdf`;
    }

    else if (localStorage.getItem("type") == "jpegToPDF") {
        doc.addImage(base64, 'JPEG', 0, 0, width, height);
        width = 0;
        height = 0;
        doc.save(`CONVERTED${downloadName[0]}.pdf`);
    }

});

document.getElementById('dd').addEventListener('click', function (event) {
    $('.wrapper-dropdown-5').toggleClass('active');
    event.stopPropagation();
});

$('html').click(function (e) {
    if ($('#dd').attr('class') == 'wrapper-dropdown-5 active') {
        $('.wrapper-dropdown-5').toggleClass('active');
    }
});
