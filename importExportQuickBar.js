//author fmthemaster
//discord: fmthemaster#7485

/******PROGRAM VARS**********/
var scriptName = "Import Export Quickbar";
// var scriptTag = "fmTag";
var forumLink =
  "https://forum.tribalwars.net/index.php?threads/import-export-quickbar.286825/";
var countapikey = "quickbarExportImport";
/******PROGRAM VARS**********/

/*globals csrf_token*/

function main() {
  hitCountApi();
  if (window.location.href.indexOf("mode=quickbar") == -1) {
    window.location.href =
      window.location.pathname + "?screen=settings&mode=quickbar";
    return;
  }
  htmlGenerate();
}

function hitCountApi() {
  $.getJSON(
    `https://api.countapi.xyz/hit/fmthemasterScripts/${countapikey}`,
    function (response) {
      console.log(`This script has been run ${response.value} times`);
    }
  );
}

function startLoader(length) {
  let width = $("#contentContainer")[0].clientWidth;
  $("#contentContainer").eq(0).prepend(`
    <div id="progressbar" class="progress-bar progress-bar-alive">
        <span class="count label">0/${length}</span>
        <div id="progress"><span class="count label" style="width: ${width}px;">0/${length}</span></div>
    </div>`);
}

function loaded(num, length, action) {
  $("#progress").css("width", `${((num + 1) / length) * 100}%`);
  $(".count").text(`${action} ${num + 1} / ${length}`);
  if (num + 1 == length) endLoader();
}

function endLoader() {
  if ($("#progressbar").length > 0) $("#progressbar").remove();
}

function htmlGenerate() {
  let html = `<div style="float: left">
        <input type="checkbox" id="overwrite_checkbox" name="overwrite" class = 'checkbox'>
        <label for="overwrite"><b>Overwrite selected</b></label>
        <br>
        <br>
        <button id="startImportDataButton" class="btn">Import Quick Bar</button>
        <button id="exportDataButton" class="btn">Export Quick Bar</button>
        <button id="exportDataToFileButton" class="btn">Export Quick Bar To File</button>
        <textarea id="importExportInput" type="text" style="display: none"></textarea>
        <button id="importDataButton" class="btn" style="display: none">Import</button>
        <button id="cancelImportDataButton" class="btn" style="display: none">Cancel</button>
        <button id="deleteSelected" class="btn">Delete Selected</button>
        <br>
        <br>
        <b>Script:</b> <a href="${forumLink}" target="_blank"> ${scriptName}</a>
        <br>
        <b>Author:</b> <a href="https://forum.tribalwars.net/index.php?members/the-quacks.124200/" target="_blank">fmthemaster aka The Quacks</a>
    </div>`;

  $("#content_value > table > tbody > tr > td:nth-child(2)").append(html);

  let tHead = $(
    "#content_value > table > tbody > tr > td:nth-child(2) > table > thead > tr"
  )[0];
  tHead.insertCell(-1).outerHTML =
    "<th><input type='checkbox' id='quickbar_box_all' class='checkbox'></th>";
  $("#quickbar > tr").each(
    (key, obj) =>
      (obj.insertCell(
        -1
      ).innerHTML = `<input type="checkbox" class="checkbox quickbar_box">`)
  );

  $("#startImportDataButton").off("click");
  $("#importDataButton").off("click");
  $("#cancelImportDataButton").off("click");
  $("#exportDataButton").off("click");
  $("#exportDataToFileButton").off("click");
  $("#quickbar_box_all").off("change");
  $("#deleteSelected").off("click");

  $("#startImportDataButton").on("click", startImportQuickBar);
  $("#importDataButton").on("click", importQuickBar);
  $("#cancelImportDataButton").on("click", cancelImportQuickBar);
  $("#exportDataButton").on("click", exportQuickBar);
  $("#exportDataToFileButton").on("click", exportQuickBarToFile);
  $("#quickbar_box_all").on("change", function () {
    $(".quickbar_box").prop("checked", this.checked);
  });
  $("#deleteSelected").on("click", deleteSelected);

  $(".checkbox").prop("checked", true);
}
function startImportQuickBar() {
  $("#importExportInput")[0].style.display = "initial";
  $("#importDataButton")[0].style.display = "initial";
  $("#cancelImportDataButton")[0].style.display = "initial";
  $("#startImportDataButton")[0].style.display = "none";
  $("#importExportInput")[0].value = "";
  $("#exportDataButton")[0].style.display = "none";
  $("#exportDataToFileButton")[0].style.display = "none";
}

function cancelImportQuickBar() {
  $("#importExportInput")[0].style.display = "none";
  $("#importDataButton")[0].style.display = "none";
  $("#cancelImportDataButton")[0].style.display = "none";
  $("#startImportDataButton")[0].style.display = "initial";
  $("#exportDataButton")[0].style.display = "initial";
  $("#exportDataToFileButton")[0].style.display = "initial";
}

function importQuickBar() {
  let val = decrypt($("#importExportInput")[0].value);
  let quickbar;
  try {
    quickbar = JSON.parse(val);
  } catch (e) {
    UI.ErrorMessage("invalid quickbar");
    throw "invalid quickbar";
  }
  createQuickBar(quickbar);
}

async function exportQuickBar() {
  $("#importExportInput")[0].style.display = "initial";
  $("#importExportInput")[0].value = encrypt(
    JSON.stringify(await getScripts())
  );
}

async function exportQuickBarToFile() {
  createFile(
    encrypt(JSON.stringify(await getScripts())),
    "quickBar.txt",
    "text/plain"
  );
}

function createFile(data, filename, type) {
  const file = new Blob([data], { type: type });
  if (window.navigator.msSaveOrOpenBlob)
    // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else {
    // Others
    const a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}

function encrypt(data) {
  let finalData;
  if (typeof data == "object") finalData = JSON.stringify(data);
  else if (typeof data == "string") finalData = data;
  else return "";
  return encodeURI(finalData);
}

function decrypt(str) {
  return decodeURI(str);
}

async function getScripts() {
  let toExport = $(".quickbar_edit_link");
  toExport = $.grep(
    toExport,
    (obj) => $(".quickbar_box", obj.parentNode.parentNode)[0].checked
  );
  let toExportLength = toExport.length;
  startLoader(toExportLength);
  let scriptList = await Object.assign(
    {},
    ...(await Promise.all(
      $(toExport)
        .map(async (key, obj) => {
          return {
            [key]: await new Promise((resolve) => {
              setTimeout(async () => {
                $.ajax(obj.href, {
                  success: (data) => {
                    let formval = $("form", data)
                      .serialize()
                      .replace(/hash=([^&]*)\&/, "")
                      .replace(/\&h=([^&]*)/, "");
                    resolve({ formval: formval });
                  },
                });
                loaded(key, toExportLength, "Exporting");
              }, 250 * key);
            }),
          };
        })
        .toArray()
    ))
  );
  let structure = $("tr[id^=quickbar] > td:nth-child(1)")
    .map((key, obj) => !$("hr", obj).length)
    .toArray();
  return { structure: structure, scriptList: scriptList };
}

function setScript(formval) {
  console.log(formval + `&h=${csrf_token}`);
  let action =
    "/game.php?screen=settings&mode=quickbar_edit&action=quickbar_edit&";
  $.ajax({ url: action, type: "POST", data: formval + `&h=${csrf_token}` });
}

async function deleteSelected() {
  let toDelete = $(".quickbar_delete_link");
  toDelete = $.grep(
    toDelete,
    (obj) => $(".quickbar_box", obj.parentNode.parentNode)[0].checked
  );
  let toDeleteLength = toDelete.length;
  startLoader(toDeleteLength);
  await Promise.all(
    $.map(toDelete, async (obj, key) => {
      console.log(key, obj);
      return new Promise((resolve) =>
        setTimeout(
          () =>
            $.ajax({
              url: obj.href,
              type: "GET",
              success: () => {
                loaded(key, toDeleteLength, "Deleting");
                return resolve();
              },
              error: () => resolve(),
            }),
          250 * key
        )
      );
    })
  );
}

async function createQuickBar(quickbar) {
  if ($("#overwrite_checkbox")[0].checked) await deleteSelected();
  endLoader();

  let quickBarLength = quickbar.structure.length;
  startLoader(quickBarLength);
  let linebreak = $("a[href*='linebreak']")[0].href;
  let i = 0;
  $.map(quickbar.structure, (obj, key) =>
    setTimeout(() => {
      loaded(key, quickBarLength, "Importing");
      if (obj) setScript(quickbar.scriptList[i++].formval);
      else $.ajax({ url: linebreak, type: "GET" });
    }, 250 * key)
  );
}

main();
