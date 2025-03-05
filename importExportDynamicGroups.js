/*
 * Script Name: Import/Export Dynamic Groups
 * Version: v1.0.2
 * Last Updated: 2022-10-01
 * Author: RedAlert
 * Author URL: https://twscripts.dev/
 * Author Contact: redalert_tw (Discord)
 * Approved: N/A
 * Approved Date: 2022-06-19
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
    prefix: "importExportGroups",
    name: "Import/Export Dynamic Groups",
    version: "v1.0.2",
    author: "RedAlert",
    authorUrl: "https://twscripts.dev/",
    helpLink:
      "https://forum.tribalwars.net/index.php?threads/import-export-dynamic-groups.288897/",
  },
  translations: {
    en_DK: {
      "Import/Export Dynamic Groups": "Import/Export Dynamic Groups",
      Help: "Help",
      "Redirecting...": "Redirecting...",
      "There was an error!": "There was an error!",
      "This script requires Premium Account to be active!":
        "This script requires Premium Account to be active!",
      "Import Dynamic Group Configuration":
        "Import Dynamic Group Configuration",
      "Export Dynamic Group Configuration":
        "Export Dynamic Group Configuration",
      "Import Group": "Import Group",
      "Export Group": "Export Group",
      "Import a group configuration then try again!":
        "Import a group configuration then try again!",
      "Invalid input!": "Invalid input!",
      "Update Preview": "Update Preview",
      "Preview has been updated!": "Preview has been updated!",
      "Filters have been applied!": "Filters have been applied!",
      "Filters have already been applied!":
        "Filters have already been applied!",
    },
    fr_FR: {
      "Import/Export Dynamic Groups": "Import/Export Groupes dynamiques",
      Help: "Aide",
      "Redirecting...": "Redirection...",
      "There was an error!": "Il y a eu une erreur!",
      "This script requires Premium Account to be active!":
        "Ce script nÃ©cessite un compte premium d'activÃ©!",
      "Import Dynamic Group Configuration":
        "Import Configuration groupe dynamique",
      "Export Dynamic Group Configuration":
        "Export Configuration groupe dynamique",
      "Import Group": "Import Groupe",
      "Export Group": "Export Groupe",
      "Import a group configuration then try again!":
        "Importez une configuration de groupe, puis rÃ©essayez!",
      "Invalid input!": "EntrÃ©e invalide!",
      "Update Preview": "AperÃ§u de la mise Ã  jour",
      "Preview has been updated!": "L'aperÃ§u a Ã©tÃ© mis Ã  jour!",
      "Filters have been applied!": "Les filtres ont Ã©tÃ© appliquÃ©s!",
      "Filters have already been applied!":
        "Les filtres ont dÃ©jÃ  Ã©tÃ© appliquÃ©s!",
    },
  },
  allowedMarkets: [],
  allowedScreens: ["overview_villages"],
  allowedModes: ["groups"],
  isDebug: DEBUG,
  enableCountApi: true,
};

$.getScript(
  `https://yuriapcarvalho.github.io/ScriptsTW/twSDK.js?url=${document.currentScript.src}`,
  async function () {
    // Initialize Library
    await twSDK.init(scriptConfig);
    const scriptInfo = twSDK.scriptInfo();
    const isValidScreen = twSDK.checkValidLocation("screen");
    const isValidMode = twSDK.checkValidLocation("mode");
    const groupsType = twSDK.getParameterByName("type");
    const { isPA } = twSDK.getGameFeatures();

    // Entry Point
    (function () {
      if (!isPA) {
        UI.ErrorMessage(
          twSDK.tt("This script requires Premium Account to be active!")
        );
      } else {
        if (isValidScreen && isValidMode && groupsType === "dynamic") {
          try {
            // build user interface
            buildUI();

            // handle user actions
            handleImportGroup();
            handleExportGroup();
            handleUpdatePreview();
          } catch (error) {
            UI.ErrorMessage(twSDK.tt("There was an error!"));
            console.error(`${scriptInfo} Error:`, error);
          }
        } else {
          UI.InfoMessage(twSDK.tt("Redirecting..."));
          twSDK.redirectTo("overview_villages&&mode=groups&type=dynamic");
        }
      }
    })();

    // Render: Build the user interface
    function buildUI() {
      const content = `
                <div class="ra-mb15">
                    <label class="ra-label" for="raImportGroupConfig">${twSDK.tt(
                      "Import Dynamic Group Configuration"
                    )}</label>
                    <textarea class="ra-textarea" id="raImportGroupConfig"></textarea>
                    <a href="javascript:void(0);" id="raImportGroupBtn" class="btn">
                        ${twSDK.tt("Import Group")}
                    </a>
                    <a href="javascript:void(0);" id="raUpdatePreviewBtn" class="btn btn-disabled">
                        ${twSDK.tt("Update Preview")}
                    </a>
                </div>
                <div class="ra-mb15">
                    <label class="ra-label" for="raExportGroupConfig">${twSDK.tt(
                      "Export Dynamic Group Configuration"
                    )}</label>
                    <textarea class="ra-textarea" id="raExportGroupConfig"></textarea>
                    <a href="javascript:void(0);" id="raExportGroupBtn" class="btn">
                        ${twSDK.tt("Export Group")}
                    </a>
                </div>
            `;

      const customStyle = `
                .ra-label { font-weight: 600; display: block; margin-bottom: 6px; }
            `;

      twSDK.renderFixedWidget(
        content,
        "raDynamicGroupTemplates",
        "ra-dynamic-group-templates",
        customStyle
      );
    }

    // Action Handler: Import dynamic group settings
    function handleImportGroup() {
      jQuery("#raImportGroupBtn").on("click", function (e) {
        e.preventDefault();

        const importedString = jQuery("#raImportGroupConfig").val();
        const currentFormDataString = jQuery("#filter_config").serialize();

        if (importedString.length === 0) {
          UI.ErrorMessage(
            twSDK.tt("Import a group configuration then try again!")
          );
        } else {
          const importedFormData = deparam(importedString);
          const currentFormData = deparam(currentFormDataString);

          const filteredImportedData =
            filterNonNeededFormData(importedFormData);
          const filteredCurrentFormData =
            filterNonNeededFormData(currentFormData);

          const jsonStringImportedData = JSON.stringify(filteredImportedData);
          const jsonStringCurrentData = JSON.stringify(filteredCurrentFormData);

          if (DEBUG) {
            console.debug(`${scriptInfo} importedString`, importedString);
            console.debug(`${scriptInfo} importedFormData`, importedFormData);
            console.debug(
              `${scriptInfo} filteredImportedData`,
              filteredImportedData
            );
            console.debug(
              `${scriptInfo} jsonStringImportedData`,
              jsonStringImportedData
            );

            console.debug(
              `${scriptInfo} currentFormDataString`,
              currentFormDataString
            );
            console.debug(`${scriptInfo} currentFormData`, currentFormData);
            console.debug(
              `${scriptInfo} filteredCurrentFormData`,
              filteredCurrentFormData
            );
            console.debug(
              `${scriptInfo} jsonStringCurrentData`,
              jsonStringCurrentData
            );
          }

          if (Object.entries(filteredImportedData).length > 1) {
            if (jsonStringImportedData !== jsonStringCurrentData) {
              jQuery("#raUpdatePreviewBtn").removeClass("btn-disabled");
              jQuery("html,body").animate(
                {
                  scrollTop: jQuery("#filter_config").offset().top - 100,
                },
                "slow"
              );
              UI.SuccessMessage("Filters have been applied!");

              let index = 1;

              for (let [key, value] of Object.entries(filteredImportedData)) {
                // disabling preview results that the game automatically
                // does so no extra - calls will be automatically made
                VillageFilters.previewResults = () => {};

                if (value === "on") {
                  jQuery(`[name="${key}"]`).trigger("click");
                } else {
                  setTimeout(function () {
                    jQuery(`[name="${key}"]`).val(value);
                    if (jQuery(`select[name="${key}"]`).length) {
                      jQuery(`select[name="${key}"]`).trigger("change");
                      index++;
                    }
                  }, 200 * index);
                }
              }
            } else {
              UI.ErrorMessage(twSDK.tt("Filters have already been applied!"));
            }
          } else {
            UI.ErrorMessage(twSDK.tt("Invalid input!"));
          }
        }
      });
    }

    // Action Handler: Export dynamic group settings
    function handleExportGroup() {
      jQuery("#raExportGroupBtn").on("click", function (e) {
        e.preventDefault();

        const serializedFormData = jQuery("#filter_config").serialize();
        jQuery("#raExportGroupConfig").val(serializedFormData.trim());
      });
    }

    // Action Handler: Update preview after filters have been applied
    function handleUpdatePreview() {
      jQuery("#raUpdatePreviewBtn").on("click", function (e) {
        e.preventDefault();

        updatePreview();
        UI.SuccessMessage(twSDK.tt("Preview has been updated!"));
      });
    }

    // Helper: Deserialize exported group settings
    // Credits to: https://stackoverflow.com/a/16215183
    function deparam(query) {
      var pairs,
        i,
        keyValuePair,
        key,
        value,
        map = {};
      if (query.slice(0, 1) === "?") {
        query = query.slice(1);
      }
      if (query !== "") {
        pairs = query.split("&");
        for (i = 0; i < pairs.length; i += 1) {
          keyValuePair = pairs[i].split("=");
          key = decodeURIComponent(keyValuePair[0]);
          value =
            keyValuePair.length > 1
              ? decodeURIComponent(keyValuePair[1])
              : undefined;
          map[key] = value;
        }
      }
      return map;
    }

    // Helper: Remove from the object un-needed values
    function filterNonNeededFormData(formData) {
      const DISALLOWED_FORM_DATA = [
        "group_id",
        "h",
        "custom_logic",
        "use_custom_logic",
      ];
      let filteredFormData = {};

      for (let [key, value] of Object.entries(formData)) {
        if (!DISALLOWED_FORM_DATA.includes(key)) {
          console.log("inside");
          filteredFormData = {
            ...filteredFormData,
            [key]: value,
          };
        }
      }

      return filteredFormData;
    }

    // Helper: Update preview of villages filtered
    // Cloned from: VillageFilters.previewResults()
    function updatePreview() {
      if (mobile) {
        return;
      }

      TribalWars.post(
        "overview_villages",
        {
          mode: "groups",
          ajax: "preview_filters",
        },
        $("#filter_config").serializeArray(),
        function (response) {
          $("#results_preview").html(response.preview_contents);
          VillageFilters.warnConflict(response.conflict);
        }
      );
    }
  }
);
