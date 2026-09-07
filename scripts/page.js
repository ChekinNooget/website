//this should eventually streamline adding images

document.createElement("cropped-image");
function loadImages() {
	const images = document.getElementsByTagName("cropped-image");
	for (let i = 0; i < images.length; i++) {
		console.log(images[i]);
	}
}

function youtube() {
	const videos = document.getElementsByClassName("youtube-video");
	for (let i = 0; i < videos.length; i++) {
		var link = videos[i].textContent;
		videos[i].innerHTML = `
        <div class="video_wrapper">
            <img src=http://img.youtube.com/vi/${link.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/).pop()}/sddefault.jpg></img>
            <a href="${link}" target="_blank" class="play_button"></a>
        </div>`;
		console.log(link);
	}
}

window.addEventListener("load", function () {
	runWhenPageLoaded();
});

function runWhenPageLoaded() {
	youtube();
}
