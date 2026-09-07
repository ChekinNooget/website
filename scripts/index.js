var data = pages; //import this from the other data file
var selected = "";
var currentPath = []; //path should be ["thing", "next thing"] all the way to where user is selected like data["thing"]
var currentFilePath = []; //path should be ["thing", "next thing"] all the way to where user is selected like data["thing"]
var redirectPath = [];
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
	var tempGetChildren = getChildrenOfPath(currentPath.concat(name));

	if (tempGetChildren != false) {
		currentPath = currentPath.concat(name);
		currentFilePath = currentFilePath.concat(name);
	} else if (tempGetChildren.length == 0) {
		currentPath = currentPath.concat(name);
		currentFilePath = currentFilePath.concat(name);
	} else {
		currentPath = [name];
		currentFilePath = [name];
		var tempFind = name;
		while (true) {
			var tempFound = false;
			for (const a of document.querySelectorAll(".tab_item")) {
				if (a.textContent == tempFind) {
					tempFound = true;

					if (a.parentElement.className.split("tab_group_")[1].split(" ")[0] == 0) {
						tempFound = false;
						break;
					}

					tempFind = document.querySelector(`.tab_group_${a.parentElement.className.split("tab_group_")[1].split(" ")[0] - 1}`).querySelector(".was_selected").textContent;

					currentPath.unshift(tempFind);
					currentFilePath.unshift(tempFind);
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
        var tempSlicedChildren = getChildrenOfPath(currentPath.slice(0, i))
		for (let j = 0; j < tempSlicedChildren.length; j++) {
			var tempTabName = tempSlicedChildren[j];
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
		if (a.textContent == name) {
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
		let filePath = "";
		if (redirectPath.length > 0) {
			filePath = `./pages/${redirectPath.join("/")}.html`;
		} else {
			filePath = i.getAttribute("src");
		}

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

function getChildrenOfPath(path, changeRedirect = false) {
	var tempString = "";
	redirectPath = path;

	for (let i = 0; i < path.length; i++) {
		tempString = tempString + `['${path[i]}']`;

		try {
			if (eval(`Object.keys(data${tempString})`).includes("redirect") && i <= redirectPath.length - 1) {
				changeRedirect = true;

				var newPath = eval(`data${tempString}['redirect']`);
				var tempString = "";

				for (let j = 0; j < newPath.length; j++) {
					tempString = tempString + `['${newPath[j]}']`;
				}

				if (i < path.length - 1) {
					redirectPath = newPath.concat(redirectPath.slice(i + 1, path.length));
				}
                /*
                console.log("newPath: " + newPath)
                console.log("tempString: " + tempString)
                console.log("redirectPath: " + redirectPath)
                */
			}
		} catch (err) {}
	}
    /*
    console.log("FINAL: " + newPath)
    console.log("tempString: " + tempString)
    console.log("redirectPath: " + redirectPath)
    */
	try {
		var childTabs = eval(`Object.keys(data${tempString})`);
		return childTabs;
	} catch (err) {
		//console.log("Error in getChildrenOfPath: " + err);
		return false;
	}
}
