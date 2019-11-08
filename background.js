function onCreated(e) {
}

function copy(outputPattern, replaceSpacesWith) {
  const title = document.title;
  const match = title.match(/^\[#?([^\]]+)\]\s*(.*)( -[^-]+)$/);
  if (!match) {
    return;
  }
  
  let textToCopy = outputPattern.replace('{id}', match[1]).replace('{title}', match[2]);
  if (!!replaceSpacesWith) {
    textToCopy = textToCopy.replace(/\s/g, replaceSpacesWith);
  }
  
  copyToClipboard(textToCopy);
}

function copyToClipboard(text) {
  //navigator.clipboard.writeText(text).catch(() => {});
    function oncopy(event) {
        document.removeEventListener("copy", oncopy, true);
        // Hide the event from the page to prevent tampering.
        event.stopImmediatePropagation();

        // Overwrite the clipboard content.
        event.preventDefault();
        event.clipboardData.setData("text/plain", text);
    }
    document.addEventListener("copy", oncopy, true);

    // Requires the clipboardWrite permission, or a user gesture:
    document.execCommand("copy");
}

browser.contextMenus.create({
  id: "jiracopy-id",
  title: "Copy id",
  contexts: ["all"]
}, onCreated);
browser.contextMenus.create({
  id: "jiracopy-branch-name",
  title: "Copy as branch name",
  contexts: ["all"]
}, onCreated);
browser.contextMenus.create({
  id: "jiracopy-id-title",
  title: "Copy for reporting",
  contexts: ["all"]
}, onCreated);

browser.contextMenus.onClicked.addListener(function(info, tab) {
console.dir(info);
  switch (info.menuItemId) {
    case "jiracopy-id":
      copy('{id}');
      break;
    case "jiracopy-branch-name":
      copy('{id}-{title}', '-');
      break;
    case "jiracopy-id-title":
      copy('{id} {title}');
      break;
  }
});

