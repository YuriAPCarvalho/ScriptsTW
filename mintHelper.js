/*
 * Script Name: Mint Helper
 * Version: v1.1.1
 * Last Updated: 2024-08-23
 * Author: RedAlert
 * Author URL: https://twscripts.dev/
 * Author Contact: redalert_tw (Discord)
 * Approved: N/A
 * Approved Date: 2022-10-03
 * Mod: JawJaw
 */

/*--------------------------------------------------------------------------------------
 * This script can NOT be cloned and modified without permission from the script author.
 --------------------------------------------------------------------------------------*/

// User Input
if (typeof DEBUG !== "boolean") DEBUG = false;
if (typeof SECONDS_ALARM === "undefined") SECONDS_ALARM = 10;

// Script Config
var scriptConfig = {
  scriptData: {
    prefix: "mintHelper",
    name: "Mint Helper",
    version: "v1.1.0",
    author: "RedAlert",
    authorUrl: "https://twscripts.dev/",
    helpLink:
      "https://forum.tribalwars.net/index.php?threads/mint-helper.289685/",
  },
  translations: {
    en_DK: {
      "Mint Helper": "Mint Helper",
      Help: "Help",
      "Redirecting...": "Redirecting...",
      "There was an error!": "There was an error!",
      "Incoming Resources": "Incoming Resources",
      "Last transport arrives at": "Last transport arrives at",
      "Max. coins that can be minted": "Max. coins that can be minted",
      "Warehouse will become full in": "Warehouse will become full in",
      "Full in: ": "Full in: ",
      "Center Village": "Center Village",
      "Average Distance": "Average Distance",
      "Warehouse is full!": "Warehouse is full!",
      "Total Wood": "Total Wood",
      "Total Stone": "Total Stone",
      "Total Iron": "Total Iron",
      "Avg. Wood": "Avg. Wood",
      "Avg. Stone": "Avg. Stone",
      "Avg. Iron": "Avg. Iron",
      "Available Merchants": "Available Merchants",
      "Total Merchants": "Total Merchants",
    },
  },
  allowedMarkets: [],
  allowedScreens: [],
  allowedModes: [],
  isDebug: DEBUG,
  enableCountApi: true,
};

$.getScript(
  `https://twscripts.dev/scripts/twSDK.js?url=${document.currentScript.src}`,
  async function () {
    // Initialize Library
    await twSDK.init(scriptConfig);
    const scriptInfo = twSDK.scriptInfo();
    const screen = twSDK.getParameterByName("screen");
    const mode = twSDK.getParameterByName("mode");

    try {
      if (screen === "snob" && !mode) {
        initNobleScreenMint();
      } else if (screen === "overview_villages" && mode === "prod") {
        initOverviewProduction();
      } else {
        UI.InfoMessage(twSDK.tt("Redirecting..."));
        twSDK.redirectTo("snob");
      }
    } catch (error) {
      UI.ErrorMessage(twSDK.tt("There was an error!"));
      console.error(`${scriptInfo} Error:`, error);
    }

    // Initialize Production overview screen logic
    function initOverviewProduction() {
      initFindCenterVillage();
      initOverviewStats();
    }

    // Initialize script logic when the player is on the Academy screen
    async function initNobleScreenMint() {
      const coinCost = BuildingSnob.Modes.train.storage_item;
      const maxStorage = parseInt(jQuery("#storage").text());
      const { arrivingWood, arrivingClay, arrivingIron, lastArrive } =
        await fetchIncomingTransports();

      const { wood, stone, iron } = coinCost;

      const coinWood = Math.floor(arrivingWood / wood);
      const coinClay = Math.floor(arrivingClay / stone);
      const coinIron = Math.floor(arrivingIron / iron);

      const maxCoins = Math.min(coinWood, coinClay, coinIron);

      ResourcesForecaster.fetchSchedules(
        window.game_data.village.id,
        (schedule) => {
          const data = [
            ResourcesForecaster.getForecast(
              new Resources(maxStorage, 0, 0),
              game_data.village,
              schedule.rates,
              schedule.amounts
            ),
            ResourcesForecaster.getForecast(
              new Resources(0, maxStorage, 0),
              game_data.village,
              schedule.rates,
              schedule.amounts
            ),
            ResourcesForecaster.getForecast(
              new Resources(0, 0, maxStorage),
              game_data.village,
              schedule.rates,
              schedule.amounts
            ),
          ];

          const whFullTime = data.sort((a, b) => (a.when < b.when ? -1 : 1))[0]
            .when;

          const content = `
                        <div class="ra-mb15">
                            <table class="ra-table" width="100%">
                                <thead>
                                    <tr>
                                        <th>
                                            ${twSDK.tt(
                                              "Warehouse will become full in"
                                            )}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <span id="whFull" class="timer" data-endtime="${whFullTime}"></span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="ra-mb15">
                            <table class="ra-table" width="100%">
                                <thead>
                                    <tr>
                                        <th colspan="3">
                                            ${twSDK.tt("Incoming Resources")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <span class="icon header wood"></span> ${twSDK.formatAsNumber(
                                              arrivingWood
                                            )}
                                        </td>
                                        <td>
                                            <span class="icon header stone"></span> ${twSDK.formatAsNumber(
                                              arrivingClay
                                            )}
                                        </td>
                                        <td>
                                            <span class="icon header iron"></span> ${twSDK.formatAsNumber(
                                              arrivingIron
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="ra-mb15" style="display:${
                          lastArrive.length ? "block" : "none"
                        };">
                            <table class="ra-table" width="100%">
                                <thead>
                                    <tr>
                                        <th>
                                            ${twSDK.tt(
                                              "Last transport arrives at"
                                            )}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            ${lastArrive}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="ra-mb15">
                            <table class="ra-table" width="100%">
                                <thead>
                                    <tr>
                                        <th>
                                            ${twSDK.tt(
                                              "Max. coins that can be minted"
                                            )}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            ${maxCoins}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    `;

          const customStyle = `
                        #whFull { color: darkblue; font-weight: 600; font-size: 20px; }
                        .ra-wh-full { color: #ff0000; }
                    `;

          twSDK.renderFixedWidget(
            content,
            "raMintHelper",
            "ra-mint-helper",
            customStyle
          );
        }
      );

      jQuery(window.TribalWars).on("global_tick", function () {
        const secondsTillTime =
          (parseInt(jQuery("#whFull").data("endtime")) * 1000 -
            new Date().getTime()) /
          1000;

        if (secondsTillTime < 0) {
          jQuery("#whFull").html(`
                    <span class="ra-wh-full">
                        ${twSDK.tt("Warehouse is full!")}
                    </span>
                `);
        }

        let coins = jQuery("#coin_mint_fill_max").text();
        coins = coins.substring(1, coins.length - 1);

        jQuery("#coin_mint_count").val(coins);
        jQuery('input[type="submit"].btn-default').focus();

        if (parseInt(secondsTillTime) === SECONDS_ALARM) {
          TribalWars.playSound("chat");
        }

        document.title = twSDK.tt("Full in: ") + jQuery("#whFull").text();
      });
    }

    // Find the center village
    function initFindCenterVillage() {
      var tempLength = jQuery("#production_table tr:not(:first)").length;
      var coords = [];
      var bestCoord = "500|500";

      for (var i = 0; i < tempLength; i++) {
        coords.push(
          jQuery("#production_table tr:not(:first)")
            .eq(i)
            .children()[1]
            .innerText.match(/(\d*)\|(\d*)/g)
            .pop()
        );
      }

      var bestDistance = 999999999999;

      counter = 0;
      coords.forEach((village) => {
        thisDistance = 0;
        counter++;
        for (var i = 0; i < coords.length; i++) {
          thisDistance += twSDK.calculateDistance(village, coords[i]);
        }
        if (thisDistance < bestDistance) {
          bestDistance = thisDistance;
          bestCoord = village;
        }
        if (counter === coords.length) {
          const {
            totalWood,
            totalStone,
            totalIron,
            avgWood,
            avgStone,
            avgIron,
            availableMerchants,
            totalVillageMerchants,
          } = calculateResourcesData();
          const content = `
                        <div class="ra-mb15">
                            <table class="ra-table ra-table-v3" width="100%">
                                <tbody>
                                    <tr>
                                        <td width="60%">
                                            <label for="ra_center_village">
                                                ${twSDK.tt("Center Village")}
                                            </label>
                                        </td>
                                        <td width="40%">
                                            <input id="ra_center_village" class="ra-input" type="text" readonly value="${bestCoord}">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td width="60%">
                                            <label for="ra_average_distance">
                                                ${twSDK.tt("Average Distance")}
                                            </label>
                                        </td>
                                        <td width="40%">
                                            <input id="ra_average_distance" class="ra-input" type="text" readonly value="${Math.round(
                                              bestDistance / tempLength
                                            )}">
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="ra-mb15">
                            <table class="ra-table ra-table-v3" width="100%">
                                <tbody>
                                    <tr>
                                        <td width="60%">
                                            <b>${twSDK.tt("Total Wood")}</b>
                                        </td>
                                        <td width="40%">
                                            ${twSDK.formatAsNumber(totalWood)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td width="60%">
                                            <b>${twSDK.tt("Total Stone")}</b>
                                        </td>
                                        <td width="40%">
                                            ${twSDK.formatAsNumber(totalStone)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td width="60%">
                                            <b>${twSDK.tt("Total Iron")}</b>
                                        </td>
                                        <td width="40%">
                                            ${twSDK.formatAsNumber(totalIron)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td width="60%">
                                            <b>${twSDK.tt("Avg. Wood")}</b>
                                        </td>
                                        <td width="40%">
                                            ${twSDK.formatAsNumber(avgWood)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td width="60%">
                                            <b>${twSDK.tt("Avg. Stone")}</b>
                                        </td>
                                        <td width="40%">
                                            ${twSDK.formatAsNumber(avgStone)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td width="60%">
                                            <b>${twSDK.tt("Avg. Iron")}</b>
                                        </td>
                                        <td width="40%">
                                            ${twSDK.formatAsNumber(avgIron)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="ra-mb15">
                            <table class="ra-table ra-table-v3" width="100%">
                                <tbody>
                                    <tr>
                                        <td width="60%">
                                            <b>${twSDK.tt(
                                              "Available Merchants"
                                            )}</b>
                                        </td>
                                        <td width="40%">
                                            ${twSDK.formatAsNumber(
                                              availableMerchants
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td width="60%">
                                            <b>${twSDK.tt(
                                              "Total Merchants"
                                            )}</b>
                                        </td>
                                        <td width="40%">
                                            ${twSDK.formatAsNumber(
                                              totalVillageMerchants
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    `;
          const customStyle = `
                        .ra-table label { font-weight: 600; }
                        .ra-input { width: 100%; padding: 4px; text-align: center; font-size: 14px; }
                        .ra-center-village-row td { background-color: #f78f88 !important; }
                    `;

          twSDK.renderFixedWidget(
            content,
            "raMintHelper",
            "ra-mint-helper",
            customStyle
          );

          // highlight center village
          jQuery("#production_table tbody tr").each(function () {
            const coordinate = jQuery(this)
              .find("td:eq(1)")
              .text()
              .trim()
              .match(twSDK.coordsRegex)[0];
            if (coordinate === bestCoord) {
              jQuery(this).addClass("ra-center-village-row");
            }
          });
        }
      });
    }

    // Add stats on overview screen
    function initOverviewStats() {
      // collect the overview data
      const overviewData = collectOverviewData();
      updateOverviewTable(overviewData);

      // register action handlers
      sortOverview();
    }

    // Action Handler: Sort overview tables
    function sortOverview() {
      jQuery(".btn-sort-overview").click(function (e) {
        e.preventDefault();

        const sortType = jQuery(this).attr("data-sort-type");
        switch (sortType) {
          case "warehousePercentage":
            sortTable(10, "production_table");
            break;
          case "farmPercentage":
            sortTable(11, "production_table");
            break;
          default:
            return;
        }
      });
    }

    // Helper: Collect and calculate resources data
    function calculateResourcesData() {
      let villageResources = [];
      let totalWood = 0;
      let totalStone = 0;
      let totalIron = 0;
      let avgWood = 0;
      let avgStone = 0;
      let avgIron = 0;
      let availableMerchants = 0;
      let totalVillageMerchants = 0;

      jQuery("#production_table tbody tr").each(function () {
        const wood = jQuery(this)
          .find("td:eq(3) .wood")
          .text()
          .trim()
          .replace(/.(?=\d{3})/g, "");
        const stone = jQuery(this)
          .find("td:eq(3) .stone")
          .text()
          .trim()
          .replace(/.(?=\d{3})/g, "");
        const iron = jQuery(this)
          .find("td:eq(3) .iron")
          .text()
          .trim()
          .replace(/.(?=\d{3})/g, "");
        const merchantsInfo = jQuery(this).find("td:eq(5) a").text().trim();
        const [merchantsAvailable, totalMerchants] = merchantsInfo.split("/");

        villageResources.push({
          wood,
          stone,
          iron,
          merchantsAvailable,
          totalMerchants,
        });
      });

      villageResources.forEach((village) => {
        const { wood, stone, iron, merchantsAvailable, totalMerchants } =
          village;
        totalWood += +wood;
        totalStone += +stone;
        totalIron += +iron;
        availableMerchants += +merchantsAvailable;
        totalVillageMerchants += +totalMerchants;
      });

      avgWood = parseInt(
        totalWood / jQuery("#production_table tbody tr").length
      );
      avgStone = parseInt(
        totalStone / jQuery("#production_table tbody tr").length
      );
      avgIron = parseInt(
        totalIron / jQuery("#production_table tbody tr").length
      );

      return {
        totalWood,
        totalStone,
        totalIron,
        avgWood,
        avgStone,
        avgIron,
        availableMerchants,
        totalVillageMerchants,
      };
    }

    // Helper: Update overview table with extra details
    function updateOverviewTable(overviewData) {
      const tHead = `
                <th class="ra-tac">
                    <a href="javascript:void(0);" class="btn-sort-overview" data-sort-type="warehousePercentage">
                        <img src="/graphic/buildings/storage.png">
                    </a>
                </th>
                <th class="ra-tac">
                    <a href="javascript:void(0);" class="btn-sort-overview" data-sort-type="farmPercentage">
                        <img src="/graphic/buildings/farm.png">
                    </a>
                </th>
            `;

      jQuery(`#production_table thead tr`).append(tHead);

      overviewData.forEach((villageData) => {
        const {
          villageId,
          villageCoordinate,
          points,
          wood,
          stone,
          iron,
          maxResource,
          warehouseCapacity,
          warehousePercentage,
          farmSpaceUsed,
          farmCapacity,
          farmPercentage,
          merchantsAvailable,
          totalMerchants,
        } = villageData;

        const whColor = getColorTagsFromPercentage(
          parseFloat(warehousePercentage)
        );
        const farmColor = getColorTagsFromPercentage(
          parseFloat(farmPercentage)
        );

        const isWhBold =
          parseFloat(warehousePercentage) >= 95 ? "font-weight:600;" : "";
        const isFarmBold =
          parseFloat(farmPercentage) >= 95 ? "font-weight:600;" : "";

        if (isWhBold || isFarmBold) {
          jQuery(
            `#production_table tr td .quickedit-vn[data-id="${villageId}"]`
          )
            .parent()
            .parent()
            .addClass("ra-full-village");
        }

        const tdData = `
                    <td style="color:${whColor};${isWhBold}">${warehousePercentage}</td>
                    <td style="color:${farmColor};${isFarmBold}">${farmPercentage}</td>
                `;

        jQuery(`#production_table tr td .quickedit-vn[data-id="${villageId}"]`)
          .parent()
          .parent()
          .append(tdData);
      });
    }

    // Helper: Collect overview data
    function collectOverviewData() {
      const overviewData = [];

      jQuery("#production_table tbody tr.nowrap").each(function () {
        const villageId = jQuery(this)
          .find("td:eq(1) .quickedit-vn")
          .attr("data-id");
        const villageCoordinate = jQuery(this)
          .find("td:eq(1) .quickedit-label")
          .text()
          .match(twSDK.coordsRegex)[0];
        const points = jQuery(this)
          .find("td:eq(2)")
          .text()
          .replace(/.(?=\d{3})/g, "");

        const wood = jQuery(this)
          .find("td:eq(3) span.wood")
          .text()
          .replace(/.(?=\d{3})/g, "");
        const stone = jQuery(this)
          .find("td:eq(3) span.stone")
          .text()
          .replace(/.(?=\d{3})/g, "");
        const iron = jQuery(this)
          .find("td:eq(3) span.iron")
          .text()
          .replace(/.(?=\d{3})/g, "");
        const warehouseCapacity = jQuery(this).find("td:eq(4)").html();

        const maxResource = Math.max(wood, stone, iron);

        const farmInfo = jQuery(this).find("td:eq(6)").text().trim();
        const merchantsInfo = jQuery(this).find("td:eq(5) a").text().trim();
        const [farmSpaceUsed, farmCapacity] = farmInfo.split("/");
        const [merchantsAvailable, totalMerchants] = merchantsInfo.split("/");

        overviewData.push({
          villageId: parseInt(villageId),
          villageCoordinate: villageCoordinate,
          points: parseInt(points),
          wood: parseInt(wood),
          stone: parseInt(stone),
          iron: parseInt(iron),
          maxResource: maxResource,
          warehouseCapacity: parseInt(warehouseCapacity),
          warehousePercentage: parseFloat(
            (maxResource / warehouseCapacity) * 100
          ).toFixed(2),
          farmSpaceUsed: parseInt(farmSpaceUsed),
          farmCapacity: parseInt(farmCapacity),
          farmPercentage: parseFloat(
            (farmSpaceUsed / farmCapacity) * 100
          ).toFixed(2),
          merchantsAvailable: parseInt(merchantsAvailable),
          totalMerchants: parseInt(totalMerchants),
        });
      });

      return overviewData;
    }

    // Helper: Sort a table
    // Original Link: https://stackoverflow.com/questions/57340110/sorting-number-in-html-table
    function sortTable(n, tableId) {
      var table,
        rows,
        switching,
        i,
        x,
        y,
        shouldSwitch,
        dir,
        switchcount = 0;
      table = document.getElementById(tableId);
      switching = true;
      // Set the sorting direction to ascending:
      dir = "desc";
      /* Make a loop that will continue until
        no switching has been done: */
      while (switching) {
        // Start by saying: no switching is done:
        switching = false;
        rows = table.rows;
        /* Loop through all table rows (except the
            first, which contains table headers): */
        for (i = 1; i < rows.length - 1; i++) {
          // Start by saying there should be no switching:
          shouldSwitch = false;
          /* Get the two elements you want to compare,
                one from current row and one from the next: */
          x = rows[i].getElementsByTagName("td")[n];
          y = rows[i + 1].getElementsByTagName("td")[n];
          /* Check if the two rows should switch place,
                based on the direction, asc or desc: */
          if (dir == "asc") {
            if (
              Number(x.innerHTML.replace(/\,/g, "")) >
              Number(y.innerHTML.replace(/\,/g, ""))
            ) {
              // If so, mark as a switch and break the loop:
              shouldSwitch = true;
              break;
            }
          } else if (dir == "desc") {
            if (
              Number(x.innerHTML.replace(/\,/g, "")) <
              Number(y.innerHTML.replace(/\,/g, ""))
            ) {
              // If so, mark as a switch and break the loop:
              shouldSwitch = true;
              break;
            }
          }
        }
        if (shouldSwitch) {
          /* If a switch has been marked, make the switch
                and mark that a switch has been done: */
          rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
          switching = true;
          // Each time a switch is done, increase this count by 1:
          switchcount++;
        } else {
          /* If no switching has been done AND the direction is "asc",
                set the direction to "desc" and run the while loop again. */
          if (switchcount == 0 && dir == "desc") {
            dir = "asc";
            switching = true;
          }
        }
      }
    }

    // Helper: Get color hex code from percentage
    function getColorTagsFromPercentage(percentage) {
      let color = "#333";

      if (percentage === 100) color = "#ff0000";
      if (percentage >= 95 && percentage < 100) color = "#d92a06";
      if (percentage >= 70 && percentage < 95) color = "#b33e2e";

      return color;
    }

    // Helper: Fetch incoming transports for the current village
    async function fetchIncomingTransports() {
      const response = await jQuery.get(
        `${game_data.link_base_pure}market&mode=call`
      );
      const htmlDoc = jQuery.parseHTML(response);
      const arrivingWood = parseInt(
        jQuery(htmlDoc)
          .find("#total_wood .wood")
          .text()
          .replace(/.(?=\d{3})/g, "")
      );
      const arrivingClay = parseInt(
        jQuery(htmlDoc)
          .find("#total_stone .stone")
          .text()
          .replace(/.(?=\d{3})/g, "")
      );
      const arrivingIron = parseInt(
        jQuery(htmlDoc)
          .find("#total_iron .iron")
          .text()
          .replace(/.(?=\d{3})/g, "")
      );
      const lastArrive = jQuery(htmlDoc).find("#arrive").text();

      return { arrivingWood, arrivingClay, arrivingIron, lastArrive };
    }
  }
);
