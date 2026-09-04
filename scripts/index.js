var data = pages; //import this from the other data file
var selected = "";
var currentPath = []; //path should be ["thing", "next thing"] all the way to where user is selected like data["thing"]
const spaceChar = "+"; //character that replaces the space in the url
const joinChar = "---"; //character that separates tabs from each other

window.addEventListener("load", function () {
	var mainTabGroup = document.querySelector(".tab_group_1");
	var temp = "";
	for (let i = 0; i < Object.keys(data).vlength; i++) {
		var tempTabName = Object.keys(data)[i];
		temp += `<div class="tab_item" onClick="onTabClick('${tempTabName}')">${tempTabName}</div>`;
	}
	mainTabGroup.innerHTML = temp;

	const url = new URL(window.location);
	if (url.searchParams.get("path") != null) {
		var pastPath = url.searchParams.get("path").split(joinChar);
		for (let i = 0; i < pastPath.length; i++) {
			onTabClick(pastPath[i].split(spaceChar).join(" "));
			//incredibly janky in that it clicks successive tabs instead of going straight to the page
			//is bad but ill probably never make it better, it works so it works :P
		}
	} else {
		onTabClick("Main");
	}
});

function onTabClick(name) {
	selected = name;
	if (getRecursive(currentPath.concat(selected)) != false) {
		currentPath = currentPath.concat(selected);
	} else if (getRecursive(currentPath.concat(selected)).length == 0) {
		currentPath = currentPath.concat(selected);
	} else {
		currentPath = [selected];
		var tempFind = selected;
		while (true) {
			var tempFound = false;
			for (const a of document.querySelectorAll(".tab_item")) {
				if (a.textContent == tempFind) {
					tempFound = true;

					if (a.parentElement.className.split("tab_group_")[1].split(" ")[0] == 0) {
						tempFound = false;
						break;
					}

					tempFind = document
						.querySelector(`.tab_group_${a.parentElement.className.split("tab_group_")[1].split(" ")[0] - 1}`)
						.querySelector(".was_selected").textContent;

					currentPath.unshift(tempFind);
					break;
				}
			}
			if (!tempFound) {
				break;
			}
		}
	}

	var allTabsWrapper = document.querySelector(".top_tabs");
	var temp = "";
	var newTabGroup = "";

	allTabsWrapper.innerHTML = "";
	for (let i = 0; i < currentPath.length + 1; i++) {
		//add tabs for user to click
		temp = "";
		for (let j = 0; j < getRecursive(currentPath.slice(0, i)).length; j++) {
			var tempTabName = getRecursive(currentPath.slice(0, i))[j];
			temp += `<div class="tab_item" onClick="onTabClick('${tempTabName}')">${tempTabName}</div>`;
		}

		//add a group of tabs for each "layer" in the json that the user can see
		var newTabGroup = "";
		if (temp != "" || i != currentPath.length) {
			newTabGroup = `<div class="tab_group_${i} tab_group">${temp}</div>`;
		}

		allTabsWrapper.innerHTML = allTabsWrapper.innerHTML + newTabGroup;
	}

	//color the tabs if they are selected
	for (const a of document.querySelectorAll(".tab_item")) {
		if (a.textContent == selected) {
			a.classList.add("selected");
		}
		if (currentPath.includes(a.textContent)) {
			a.classList.add("was_selected");
		}
	}

	//this changes the url "path" parameter to selected
	var endingParamString = currentPath.join(joinChar);
	const urlParams = new URLSearchParams(window.location.search);
	if (urlParams.get("path") != endingParamString || urlParams.get("path") == null) {
		urlParams.set("path", endingParamString);
		window.history.replaceState(null, null, "?" + urlParams);
	}

	//this is the part that changes the page to the tab selected
	var mainContentWrapper = document.querySelector(".main_content_wrapper");
	mainContentWrapper.innerHTML = `<include class="main_content" src="./pages/${currentPath.join("/")}.html">Loading...</include>`;
	const includes = document.getElementsByTagName("include");
	[].forEach.call(includes, (i) => {
		let filePath = i.getAttribute("src");
		fetch(filePath).then((file) => {
			file.text().then((content) => {
				if (i.parentElement != null) {
					i.insertAdjacentHTML("afterend", content);
					i.remove();
				}
			});
		});
	});

	//loadImages() do this eventually
}

function getRecursive(path) {
	var tempString = "";
	for (let i = 0; i < path.length; i++) {
		tempString = tempString + `['${path[i]}']`;
	}
	try {
		eval(`Object.keys(data${tempString})`);
		return eval(`Object.keys(data${tempString})`);
	} catch (err) {
		return false;
	}
}
