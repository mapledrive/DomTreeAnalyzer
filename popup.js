let button = document.getElementById('getNode');
let el = document.getElementById('tree');
let extensionContainer = document.getElementById('extensionContainer');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.greeting) {
    sendResponse({ farewell: 'goodbye' });
    console.log(request.greeting);
    el.innerHTML = createTree(request.greeting);
  }
});

// When the button is clicked, inject startScript into current page
button.addEventListener('click', async () => {
  // получаем доступ к активной вкладке
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: startScript,
  });
});

// The body of this function will be executed as a content script inside the current page
function startScript() {
  // https://stackoverflow.com/questions/35042798/get-dom-tree-with-javascript
  // recursive DOM reader
  function readNodeTree(node) {
   if (node.hasChildNodes()) {
      let children = {};
      for (let i = 0; i < node.childNodes.length; i++) {
        let names = node.childNodes[i].nodeName;
        children[names] = readNodeTree(node.childNodes[i]);
      }
      return children;
    }
    return false;
  }
  
  let nodeTree = readNodeTree(document);
  chrome.runtime.sendMessage({ greeting: nodeTree }, response => console.log(response.farewell));
}

// recursive visualization tree builder
function createTree(data) {
  let str = '';
  for (const [text, ref] of Object.entries(data)) {
    str =
      str +
      '<div class="block">' +
      '<div class="vertical"></div>' +
      '<div class="internal">' +
      text +
      '</div >' +
      createTree(ref) +
      '</div>';
  }
  if (str) str = '<div class="inner">' + str + '</div>';
  return str;
}