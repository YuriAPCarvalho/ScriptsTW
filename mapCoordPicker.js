/*
 * Script Name: Map Coord Picker
 * Version: v2.2.0
 * Last Updated: 2024-11-27
 * Author: RedAlert
 * Author URL: https://twscripts.dev/
 * Author Contact: redalert_tw (Discord)
 * Approved: t14065247
 * Approved Date: 2020-07-04
 * Mod: JawJaw
 */

/*--------------------------------------------------------------------------------------
 * This script can NOT be cloned and modified without permission from the script author.
 --------------------------------------------------------------------------------------*/

// User Input
if (typeof DEBUG !== "boolean") DEBUG = false;

// Script Config
var scriptConfig = {
  scriptData: {
    prefix: "mapCoordPicker",
    name: "Map Coord Picker",
    version: "v2.2.0",
    author: "RedAlert",
    authorUrl: "https://twscripts.dev/",
    helpLink:
      "https://forum.tribalwars.net/index.php?threads/map-coords-picker.285565/",
  },
  translations: {
    en_DK: {
      "Map Coord Picker": "Map Coord Picker",
      Help: "Help",
      "Redirecting...": "Redirecting...",
      Reset: "Reset",
      Copy: "Copy",
      "Copy with ID": "Copy with ID",
      "Copied!": "Copied!",
      "Nothing to be copied!": "Nothing to be copied!",
      "Selection cleared!": "Selection cleared!",
      "Selected villages:": "Selected villages:",
      Highlight: "Highlight",
      "Fill the coordinates field!": "Fill the coordinates field!",
      "Coordinates have been highlighted!":
        "Coordinates have been highlighted!",
    },
    ro_RO: {
      "Map Coord Picker": "Map Coord Picker",
      Help: "Ajutor",
      "Redirecting...": "Redirecting...",
      Reset: "Reset",
      Copy: "Copiaza",
      "Copy with ID": "Copy with ID",
      "Copied!": "Copiat!",
      "Nothing to be copied!": "Nimic de copiat!",
      "Selection cleared!": "Selectare golita!",
      "Selected villages:": "Alege satele:",
      Highlight: "Highlight",
      "Fill the coordinates field!": "Fill the coordinates field!",
      "Coordinates have been highlighted!":
        "Coordinates have been highlighted!",
    },
    sk_SK: {
      "Map Coord Picker": "KoordinÃ¡ty z mapy",
      Help: "Pomoc",
      "Redirecting...": "Redirecting...",
      Reset: "Reset",
      Copy: "KopÃ­rovaÅ¥",
      "Copy with ID": "Copy with ID",
      "Copied!": "SkopÃ­rovanÃ©!",
      "Nothing to be copied!": "NiÄ na kopÃ­rovanie!",
      "Selection cleared!": "OznaÄenia zmazanÃ©!",
      "Selected villages:": "OznaÄenÃ© dediny:",
      Highlight: "Highlight",
      "Fill the coordinates field!": "Fill the coordinates field!",
      "Coordinates have been highlighted!":
        "Coordinates have been highlighted!",
    },
    pt_BR: {
      "Map Coord Picker": "Extrator de coordenadas do mapa",
      Help: "Ajuda",
      "Redirecting...": "Redirecting...",
      Reset: "Resetar",
      Copy: "Copiar",
      "Copy with ID": "Copy with ID",
      "Copied!": "Copiado!",
      "Nothing to be copied!": "Nada para copiar!",
      "Selection cleared!": "SeleÃ§Ã£o desmarcada!",
      "Selected villages:": "Aldeias selecionadas:",
      Highlight: "Highlight",
      "Fill the coordinates field!": "Fill the coordinates field!",
      "Coordinates have been highlighted!":
        "Coordinates have been highlighted!",
    },
    pt_PT: {
      "Map Coord Picker": "Extrator de coordenadas do mapa",
      Help: "Ajuda",
      "Redirecting...": "Redirecting...",
      Reset: "Resetar",
      Copy: "Copiar",
      "Copy with ID": "Copy with ID",
      "Copied!": "Copiado!",
      "Nothing to be copied!": "Nada para copiar!",
      "Selection cleared!": "SeleÃ§Ã£o desmarcada!",
      "Selected villages:": "Aldeias selecionadas:",
      Highlight: "Highlight",
      "Fill the coordinates field!": "Fill the coordinates field!",
      "Coordinates have been highlighted!":
        "Coordinates have been highlighted!",
    },
    it_IT: {
      "Map Coord Picker": "Estrattore Coordinate dalla Mappa",
      Help: "Aiuto",
      "Redirecting...": "Redirecting...",
      Reset: "Reset",
      Copy: "Copia",
      "Copy with ID": "Copy with ID",
      "Copied!": "Copiato!",
      "Nothing to be copied!": "Non Ã¨ stato copiato nulla!",
      "Selection cleared!": "Pulisci selezione!",
      "Selected villages:": "Villaggi selezionati:",
      Highlight: "Highlight",
      "Fill the coordinates field!": "Fill the coordinates field!",
      "Coordinates have been highlighted!":
        "Coordinates have been highlighted!",
    },
    nl_NL: {
      "Map Coord Picker": "Map Coord Grabber ",
      Help: "Help",
      "Redirecting...": "Redirecting...",
      Reset: "Resetten",
      Copy: "kopiÃ«ren",
      "Copy with ID": "Copy with ID",
      "Copied!": "Gekopieerd!",
      "Nothing to be copied!": "Niets is er om te worden gekopieerd!",
      "Selection cleared!": "Selectie gewist!",
      "Selected villages:": "Geselecteerde dorpen:",
      Highlight: "Highlight",
      "Fill the coordinates field!": "Fill the coordinates field!",
      "Coordinates have been highlighted!":
        "Coordinates have been highlighted!",
    },
    fr_FR: {
      "Map Coord Picker": "SÃ©lectionner CoordonnÃ©es sur la carte",
      Help: "Aide",
      "Redirecting...": "Redirecting...",
      Reset: "RÃ©initialiser",
      Copy: "Copier",
      "Copy with ID": "Copy with ID",
      "Copied!": "CopiÃ©!",
      "Nothing to be copied!": "Rien Ã  copier!",
      "Selection cleared!": "SÃ©lection effacÃ©e!",
      "Selected villages:": "Villages sÃ©lectionnÃ©s:",
      Highlight: "Highlight",
      "Fill the coordinates field!": "Fill the coordinates field!",
      "Coordinates have been highlighted!":
        "Coordinates have been highlighted!",
    },
  },
  allowedMarkets: [],
  allowedScreens: ["map"],
  allowedModes: [],
  isDebug: DEBUG,
  enableCountApi: true,
};

$.getScript(
  `https://twscripts.dev/scripts/twSDK.js?url=${document.currentScript.src}`,
  async function () {
    // Initialize Library
    await twSDK.init(scriptConfig);
    const isValidScreen = twSDK.checkValidLocation("screen");

    // Globals
    var mapOverlay;
    var selectedVillages = [];
    if ("TWMap" in window) mapOverlay = TWMap;

    // Entry point
    (function () {
      if (isValidScreen) {
        // build user interface
        buildUI();

        mapOverlay.mapHandler._spawnSector = mapOverlay.mapHandler.spawnSector;
        TWMap.mapHandler.spawnSector = spawnSectorReplacer;
        mapOverlay.map._DShandleClick = mapOverlay.map._handleClick;

        // register action handlers
        handleReset();
        handleCopy();
        handleCopyWithId();
        handleMapClick();
        handleHighlight();
      } else {
        UI.InfoMessage(twSDK.tt("Redirecting..."));
        twSDK.redirectTo("map");
      }
    })();

    // Build UI
    function buildUI() {
      const content = `
                <div class="ra-mb15">
                    <label for="villageList" class="ra-label">
                        ${twSDK.tt(
                          "Selected villages:"
                        )} <span id="countSelectedVillages">0</span>
                    </label>
                    <textarea id="villageList" class="ra-textarea"></textarea>
                </div>
                <div class="ra-mb15">
                    <a href="javascript:void(0);" class="btn" id="raResetBtn">
                        ${twSDK.tt("Reset")}
                    </a>
                    <a href="javascript:void(0);" class="btn" id="raCopyBtn">
                        ${twSDK.tt("Copy")}
                    </a>
                    <a href="javascript:void(0);" class="btn" id="raCopyWithIdBtn">
                        ${twSDK.tt("Copy with ID")}
                    </a>
                    <a href="javascript:void(0);" class="btn" id="raHighlightBtn">
                        ${twSDK.tt("Highlight")}
                    </a>
                </div>
            `;

      const customStyle = `
                .ra-label { display: block; margin-bottom: 5px; font-weight: 600; }
            `;

      twSDK.renderFixedWidget(
        content,
        scriptConfig.scriptData.prefix,
        "ra-map-coord-picker",
        customStyle
      );
    }

    // Action Handler: Reset
    function handleReset() {
      jQuery("#raResetBtn").on("click", function (e) {
        e.preventDefault();

        selectedVillages = [];
        jQuery("#villageList").val(selectedVillages.join(" "));
        jQuery("#countSelectedVillages").text(selectedVillages.length);
        TWMap.reload();
        UI.SuccessMessage(twSDK.tt("Selection cleared!"));
      });
    }

    // Action Handler: Copy selected coords
    function handleCopy() {
      jQuery("#raCopyBtn").on("click", function (e) {
        e.preventDefault();

        const coords = jQuery("#villageList").val().trim();
        if (coords.length !== 0) {
          jQuery("#villageList").select();
          document.execCommand("copy");
          UI.SuccessMessage(twSDK.tt("Copied!"), 4000);
        } else {
          UI.ErrorMessage(twSDK.tt("Nothing to be copied!"), 4000);
        }
      });
    }

    // Action Handler: Copy selected coords
    function handleCopyWithId() {
      jQuery("#raCopyWithIdBtn").on("click", async function (e) {
        e.preventDefault();

        const coords = jQuery("#villageList").val().trim();
        if (coords.length !== 0) {
          const { villages } = await fetchWorldConfigData();

          const filteredVillages = villages.filter((village) => {
            const villageCoord = village[2] + "|" + village[3];
            return coords.includes(villageCoord);
          });

          const coordsWithId = filteredVillages
            .map((village) => `${village[2]}|${village[3]}:${village[0]}`)
            .join(" ");
          if (coordsWithId.trim().length !== 0) {
            twSDK.copyToClipboard(coordsWithId);
            UI.SuccessMessage(twSDK.tt("Copied!"), 4000);
          } else {
            UI.ErrorMessage(twSDK.tt("Nothing to be copied!"), 4000);
          }
        } else {
          UI.ErrorMessage(twSDK.tt("Nothing to be copied!"), 4000);
        }
      });
    }

    // Action Handler: Handle map click
    function handleMapClick() {
      TWMap.map._handleClick = function (e) {
        let currentCoords = jQuery("#villageList").val();
        let pos = this.coordByEvent(e);
        let coord = pos.join("|");
        let village = TWMap.villages[pos[0] * 1000 + pos[1]];
        if (village && village.id) {
          if (!currentCoords.includes(coord)) {
            jQuery(`[id="map_village_${village.id}"]`).css({
              filter: "brightness(200%) grayscale(100%)",
            });
            selectedVillages.push(coord);
            jQuery("#villageList").val(selectedVillages.join(" "));
            jQuery("#countSelectedVillages").text(selectedVillages.length);
          } else {
            selectedVillages = selectedVillages.filter(
              (village) => village !== coord
            );
            jQuery("#villageList").val(selectedVillages.join(" "));
            jQuery(`[id="map_village_${village.id}"]`).css({
              filter: "none",
            });
            jQuery("#countSelectedVillages").text(selectedVillages.length);
          }
        }
        return false;
      };
    }

    // Action Handler: Handle highlight coords on map
    function handleHighlight() {
      jQuery("#raHighlightBtn").on("click", function (e) {
        e.preventDefault();

        const chosenCoords = jQuery("#villageList").val().trim();

        if (chosenCoords.length !== 0) {
          const coordsArray = chosenCoords.split(" ");
          updateMap(coordsArray);
          UI.SuccessMessage(twSDK.tt("Coordinates have been highlighted!"));
        } else {
          UI.ErrorMessage(twSDK.tt("Fill the coordinates field!"));
        }
      });
    }

    // Helper: Update the map UI
    function updateMap(villageCoords) {
      // Show wall level of barbarian villages on the Map
      if (mapOverlay.mapHandler._spawnSector) {
        //exists already, don't recreate
      } else {
        //doesn't exist yet
        mapOverlay.mapHandler._spawnSector = mapOverlay.mapHandler.spawnSector;
      }

      TWMap.mapHandler.spawnSector = function (data, sector) {
        // Override Map Sector Spawn
        mapOverlay.mapHandler._spawnSector(data, sector);
        var beginX = sector.x - data.x;
        var endX = beginX + mapOverlay.mapSubSectorSize;
        var beginY = sector.y - data.y;
        var endY = beginY + mapOverlay.mapSubSectorSize;

        for (var x in data.tiles) {
          var x = parseInt(x, 10);
          if (x < beginX || x >= endX) {
            continue;
          }
          for (var y in data.tiles[x]) {
            var y = parseInt(y, 10);

            if (y < beginY || y >= endY) {
              continue;
            }
            var xCoord = data.x + x;
            var yCoord = data.y + y;
            var v = mapOverlay.villages[xCoord * 1000 + yCoord];
            if (v) {
              var vXY = "" + v.xy;
              var vCoords = vXY.slice(0, 3) + "|" + vXY.slice(3, 6);
              if (villageCoords.includes(vCoords)) {
                const eleDIV = $("<div></div>")
                  .css({
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "2px",
                    padding: "1px",
                    backgroundColor: "rgba(187, 255, 0, 0.7)",
                    color: "#fff",
                    width: "50px",
                    height: "35px",
                    zIndex: "10",
                    fontSize: "10px",
                  })
                  .attr("id", "dsm" + v.id);

                sector.appendElement(
                  eleDIV[0],
                  data.x + x - sector.x,
                  data.y + y - sector.y
                );
              }
            }
          }
        }
      };

      mapOverlay.reload();
    }

    // Override Map Sector Spawn
    function spawnSectorReplacer(data, sector) {
      mapOverlay.mapHandler._spawnSector(data, sector);
      var beginX = sector.x - data.x;
      var endX = beginX + mapOverlay.mapSubSectorSize;
      var beginY = sector.y - data.y;
      var endY = beginY + mapOverlay.mapSubSectorSize;
      for (var x in data.tiles) {
        var x = parseInt(x, 10);
        if (x < beginX || x >= endX) {
          continue;
        }
        for (var y in data.tiles[x]) {
          var y = parseInt(y, 10);

          if (y < beginY || y >= endY) {
            continue;
          }
          var xCoord = data.x + x;
          var yCoord = data.y + y;
          var v = mapOverlay.villages[xCoord * 1000 + yCoord];
          if (v) {
            if (selectedVillages.length > 0) {
              var vXY = "" + v.xy;
              var vCoords = vXY.slice(0, 3) + "|" + vXY.slice(3, 6);
              if (selectedVillages.includes(vCoords)) {
                jQuery(`[id="map_village_${v.id}"]`).css({
                  filter: "brightness(200%) grayscale(100%)",
                });
              }
            }
          }
        }
      }
    }

    // Service: Fetch world config and needed data
    async function fetchWorldConfigData() {
      try {
        const villages = await twSDK.worldDataAPI("village");
        return { villages };
      } catch (error) {
        UI.ErrorMessage(
          twSDK.tt("There was an error while fetching the data!")
        );
        console.error(`${scriptInfo} Error:`, error);
      }
    }
  }
);
