$('.clickMe').click(function() {
  'use strict';
  $(this).hide();
  $('#' + $(this).attr('for'))
    .val($(this).text())
    .toggleClass('form-control')
    .show()
    .focus();
});

$('.blur').blur(function() {
  'use strict';
  $(this)
    .hide()
    .toggleClass('form-control');
  var myid = this.id;
  $('span[for=' + myid + ']')
    .text($(this).val())
    .show();
});

// Trackers
let tabCount = 1;
let activeTab = 1;
let idg = 1;

// Html code to render tamplate of specific tab
const inputText = id => {
  return `<div class="form-group mt-4">
  <label for="inputText"
    ><h1 class="display-5">Tab ${id} : Input Text(__example__ for labels)</h1></label
  >
  <button onclick="savedoc()" class="btn btn-primary mb-3 ml-auto ">Save as doc</button>
  <textarea
    class="form-control"
    id="input${id}"
    rows="10"
    column="1"
    name="editor${id}"
  ></textarea>
</div>
<div>
  <label for="temps"><h1 class="display-5">labels</h1></label>
  <div class="d-flex flex-column align-items-center" id="label${id}"></div>
</div>
<div>
  <label for="generatedOutput"
    ><h1 class="display-5">Output Text</h1></label
  >
  <div id="output${id}"></div>
</div>`;
};

// Calling download function from save as doc button
const savedoc = () => {
  let fileName = `file${activeTab}.doc`;
  let elid = `input${activeTab}`;
  downloadInnerHtml(fileName, elid);
};

// Function to save template as .doc file
const downloadInnerHtml = (filename, elId) => {
  var elHtml = document.getElementById(elId).innerText;
  var link = document.createElement('a');
  link.setAttribute('download', filename);
  link.setAttribute(
    'href',
    'data:' + 'text/doc' + ';charset=utf-8,' + encodeURIComponent(elHtml)
  );
  link.click();
};

// Html code to render label section
const renderLabel = (array, id) => {
  var labelhtml = '';
  for (let i = 0; i < array.length; i++) {
    labelhtml += `
      <div class="form-group row col-sm-10">
            <label for=${array[i]} class="col-sm-4 col-form-label">${
      array[i]
    }</label>
            <div class="col-sm-6">
              <input
                type="text"
                class="form-control"
                id=${array[i]}
              />
            </div>
          </div>
      `;
  }
  labelhtml += ` <button type="button" onclick="genButton()" id="gener${id}" class="my-4 btn btn-primary btn-lg">
    Generate
  </button>`;
  document.querySelector(`#label${id}`).innerHTML = labelhtml;
};

// Get called when Click on user button
const genButton = () => {
  let d = JSON.parse(localStorage.getItem(activeTab));
  let str = d.string;
  let labels = d.labels;

  if (str === undefined || labels === undefined) {
    str = ' ';
    labels = [];
  }
  // Generate output of input text
  outputText(str, labels, activeTab);
};

//Function to generate output
const outputText = (str, labels, id) => {
  let array = str.split('__');
  for (let i = 0; i < labels.length; i++) {
    for (let j = 0; j < array.length; j++) {
      if (`${labels[i]}` === array[j]) {
        array[j] = document.querySelector(`#${labels[i]}`).value;
      }
    }
  }
  let modString = array.join(' ');
  document.querySelector(`#output${id}`).innerHTML = modString;
};

// First tab open automatic after window loading complete
window.onload = () => {
  document.querySelector('.tab-content').innerHTML = inputText('1');
  var editor = CKEDITOR.replace('editor1');
  new renderer(editor, '1');
};

//Tabs generator
document.querySelector('#addNewTab').addEventListener('click', e => {
  tabCount = tabCount + 1;
  let newTabElement = document.createElement('li');
  newTabElement.setAttribute('class', 'nav-item');

  let a = document.createElement('a');
  a.setAttribute('class', 'nav-link');
  a.setAttribute('href', '#');
  let name = document.createTextNode(`Tab ${tabCount}`);
  a.appendChild(name);
  a.setAttribute('id', `${tabCount}`);

  newTabElement.appendChild(a);

  let tabs = document.querySelector('#tabs');

  tabs.insertBefore(newTabElement, tabs.lastElementChild);
});

// Get record of current active tab and fetch data from storage
document.querySelector('#tabs').addEventListener('click', e => {
  if (
    e.target.parentElement.id === 'addNewTab' ||
    e.target.parentElement.id === 'skip'
  ) {
    return;
  }

  e.target.classList.add('active');
  document.getElementById(activeTab).classList.remove('active');
  document.querySelector('.tab-content').innerHTML = inputText(e.target.id);
  activeTab = e.target.id;
  var editor = CKEDITOR.replace(`editor${e.target.id}`);
  new renderer(editor, e.target.id);
});

//contains method for storing input text and labels in realtime
class renderer {
  constructor(editor, id) {
    this.editor = editor;
    this.id = id;
    let data = {
      string: '',
      labels: []
    };

    //Keep Track of input text in input box
    this.editor.on('change', e => {
      let inputText = e.editor.getData();
      data.string = inputText;
      data.labels = this.extractLabels(data.string);
      localStorage.setItem(this.id, JSON.stringify(data));
      if (data.labels !== []) {
        renderLabel(data.labels, this.id);
      }
    });

    let string = ' ';
    let labels = [];
    //Fetch data from local storage
    let datafromstorage = JSON.parse(localStorage.getItem(this.id));
    if (datafromstorage !== null) {
      string = datafromstorage.string;
      labels = datafromstorage.labels;
    }
    let textareadata = document.createTextNode(string);

    //Render labels on screen with realtime data entry
    document.getElementById(`input${this.id}`).appendChild(textareadata);
    if (!(labels === [])) {
      renderLabel(labels, this.id);
    }
  }

  // Extract labels from input text
  extractLabels(string) {
    let labelsarray = new Array();

    for (let i = 0; i < string.length; i++) {
      let tmp = '';
      if (string.charAt(i) === '_') {
        if (string.charAt(i - 1) === '_') {
          if (string.charAt(i - 2) === ' ') {
            continue;
          } else {
            let j = i - 1;
            while (string.charAt(--j) !== '_' && j >= 0) {
              tmp += string.charAt(j);
            }

            if (string.charAt(j - 1) === '_') {
              tmp = tmp
                .split('')
                .reverse()
                .join('');

              if (!labelsarray.includes(tmp)) {
                labelsarray.push(tmp);
              }
            } else {
              continue;
            }
          }
        } else {
          continue;
        }
      }
    }
    return labelsarray;
  }
}
