function parseDocumentTitle(title) {
    const match = title.match(/^\[#?([^\]]+)]\s*(.*)( -[^-]+)$/);
    if (!match) {
        return null;
    }

    return {
        id: match[1],
        title: match[2]
    };
}

function getOutputText(tokens, outputPattern, postProcess) {
    const output = outputPattern.replace("{id}", tokens.id).replace("{title}", tokens.title);
    return (typeof postProcess === "function") ? postProcess(output) : output;
}

function copyToClipboard(text) {
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
});
browser.contextMenus.create({
    id: "jiracopy-branch-name",
    title: "Copy as branch name",
    contexts: ["all"]
});
browser.contextMenus.create({
    id: "jiracopy-id-title",
    title: "Copy for reporting",
    contexts: ["all"]
});

browser.contextMenus.onClicked.addListener(function(info, tab) {
    console.dir(info);
    let outputPattern;
    let postProcess = null;
    switch (info.menuItemId) {
        case "jiracopy-id":
            outputPattern = "{id}";
            break;
        case "jiracopy-branch-name":
            outputPattern = "{id}-{title}";
            postProcess = x => x.replace(/\W/g, "-").toLowerCase();
            break;
        case "jiracopy-id-title":
            outputPattern = "{id} {title}";
            break;
        default:
            return;
    }

    browser.tabs.executeScript(tab.id, {code: "document.title"}).then(function(results) {
        const documentTitle = results[0];
        const parsed = parseDocumentTitle(documentTitle);
        if (!parsed) {
            return;
        }
        const textToCopy = getOutputText(parsed, outputPattern, postProcess);
        copyToClipboard(textToCopy);
    });
});