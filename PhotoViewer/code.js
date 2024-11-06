'use strict';

let images = [];
let currentImageIndex = 0;
let animationId, animationStarted = false, photosLoaded = false;

function load_from_local() {
    if (!check_invalid()) {
        return;
    }

    let path = "";
    let folder = document.querySelector("[name='photo_folder']").value;
    let commonName = document.querySelector("[name='common_name']").value;
    let startNum = parseInt(document.querySelector("[name='start_photo']").value);
    let endNum = parseInt(document.querySelector("[name='end_photo']").value);

    images = [];
    for (let i = startNum; i <= endNum; i++) {
        path = `${folder}${commonName}${i}.jpg`;
        images.push(path);
        console.log(path);
    }
    currentImageIndex = 0;
    photosLoaded = true;
    update_photo();
}


function update_photo() {
    if (images.length > 0) {
        const img = document.querySelector("#photo_container img");
        img.src = images[currentImageIndex];

        const url = document.querySelector("#photo_display");
        url.value = images[currentImageIndex];
    }
}

function prev_photo() {
    if (!check_load()) return;
    if (!photosLoaded || images.length <= 0) return;
    currentImageIndex = (currentImageIndex > 0) ? currentImageIndex - 1 : images.length - 1;
    update_photo();
}

function next_photo() {
    if (!check_load()) return;
    if (!photosLoaded || images.length <= 0) return;
    currentImageIndex = (currentImageIndex < images.length - 1) ? currentImageIndex + 1 : 0;
    update_photo();
}


function first_photo() {
    if (!check_load()) return;
    if (!photosLoaded) return;
    currentImageIndex = 0;
    update_photo();
}

function last_photo() {
    if (!check_load()) return;
    if (!photosLoaded) return;
    currentImageIndex = images.length - 1;
    update_photo();
}


function check_invalid() {
    let startNum = parseInt(document.querySelector("[name='start_photo']").value);
    let endNum = parseInt(document.querySelector("[name='end_photo']").value);
    if (startNum > endNum) {
        document.getElementById("photo_view").innerText = "Error: Invalid Range";
        return false;
    } else {
        document.getElementById("photo_view").innerText = "Photo View System";
        return true
    }
}

function check_load() {
    if (document.querySelector("#load_image_with_json").value === ""
        || document.querySelector("#photo_container img").value === ""
        || !photosLoaded) {
        document.getElementById("photo_view").innerText = "Error: you must load data first";
        return false;
    } else {
        document.getElementById("photo_view").innerText = "Photo View System";
        return true;
    }
}



function load_from_json() {
    let url = document.querySelector("#load_image_with_json").value;
    /* LAMBDA */
    fetch(url)
        .then(response => response.json())
        .then(json => {
            images = json.images.map(item => item.imageURL);
            if (images.length > 0) {
                const img = document.querySelector("#photo_container img");
                img.src = images[0];

                const url = document.querySelector("#photo_display");
                url.value = images[0];
                update_photo();
                currentImageIndex = 0;
                photosLoaded = true;
            }
        });
}


function show_slide_show() {
    if (!check_load()) return;
    if (!animationStarted) { //avoid image duplication
        let intervalInMillisecs = 1000;
        animationId = setInterval(next_photo, intervalInMillisecs);
        animationStarted = true;
    }
}

function random_slide_show() {
    if (!check_load()) return;
    if (!photosLoaded) return;
    if (!animationStarted) {
        let intervalInMillisecs = 1000;
        animationId = setInterval(generateRandom, intervalInMillisecs);
        animationStarted = true;
    }
}

function stop_slide_show() {
    if (!check_load()) return;
    clearInterval(animationId);
    animationStarted = false;
    photosLoaded = false;
}

function generateRandom() {
    if (images.length === 0) return;

    let randomIndex = Math.floor(Math.random() * images.length);

    let newPath = images[randomIndex];

    const img = document.querySelector("#photo_container img");
    img.src = newPath;

    const url = document.querySelector("#photo_display");
    url.value = newPath;
}

function reset() {
    document.getElementById("photo_display").value = "";
    document.getElementById("photo_view").innerText = "Photo View System";
    document.getElementById("load_image_with_json").value

}

