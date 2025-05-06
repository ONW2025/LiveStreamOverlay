let activeAlertCache = new Map();
let activeWarnings = [];
let lastTickerHTML = "";
const pageLoadTime = Date.now();
let seenAlertIds = new Set();
const CAP_NS = "urn:oasis:names:tc:emergency:cap:1.1";

// Replace this with the full Texas UGC mapping when ready
const ugcToCounty = {
    "TX001": "Anderson", "TX003": "Andrews", "TX005": "Angelina", "TX007": "Aransas", "TX009": "Archer", "TX011": "Armstrong", "TX013": "Atascosa", "TX015": "Austin", "TX017": "Bailey", "TX019": "Bandera", "TX021": "Bastrop", "TX023": "Baylor", "TX025": "Bee", "TX027": "Bell", "TX029": "Bexar", "TX031": "Blanco", "TX033": "Borden", "TX035": "Bosque", "TX037": "Bowie", "TX039": "Brazoria", "TX041": "Brazos", "TX043": "Brewster", "TX045": "Briscoe", "TX047": "Brooks", "TX049": "Brown", "TX051": "Burleson", "TX053": "Burnet", "TX055": "Caldwell", "TX057": "Calhoun", "TX059": "Callahan", "TX061": "Cameron", "TX063": "Camp", "TX065": "Carson", "TX067": "Cass", "TX069": "Castro", "TX071": "Chambers", "TX073": "Cherokee", "TX075": "Childress", "TX077": "Clay", "TX079": "Cochran", "TX081": "Coke", "TX083": "Coleman", "TX085": "Collin", "TX087": "Collingsworth", "TX089": "Colorado", "TX091": "Comal", "TX093": "Comanche", "TX095": "Concho", "TX097": "Cooke", "TX099": "Coryell", "TX101": "Cottle", "TX103": "Crane", "TX105": "Crockett", "TX107": "Crosby", "TX109": "Culberson", "TX111": "Dallam", "TX113": "Dallas", "TX115": "Dawson", "TX117": "Deaf Smith", "TX119": "Delta", "TX121": "Denton", "TX123": "DeWitt", "TX125": "Dickens", "TX127": "Dimmit", "TX129": "Donley", "TX131": "Duval", "TX133": "Eastland", "TX135": "Ector", "TX137": "Edwards", "TX139": "Ellis", "TX141": "El Paso", "TX143": "Erath", "TX145": "Falls", "TX147": "Fannin", "TX149": "Fayette", "TX151": "Fisher", "TX153": "Floyd", "TX155": "Foard", "TX157": "Fort Bend", "TX159": "Franklin", "TX161": "Freestone", "TX163": "Frio", "TX165": "Gaines", "TX167": "Galveston", "TX169": "Garza", "TX171": "Gillespie", "TX173": "Glasscock", "TX175": "Goliad", "TX177": "Gonzales", "TX179": "Gray", "TX181": "Grayson", "TX183": "Gregg", "TX185": "Grimes", "TX187": "Guadalupe", "TX189": "Hale", "TX191": "Hall", "TX193": "Hamilton", "TX195": "Hansford", "TX197": "Hardeman", "TX199": "Hardin", "TX201": "Harris", "TX203": "Harrison", "TX205": "Hartley", "TX207": "Haskell", "TX209": "Hays", "TX211": "Hemphill", "TX213": "Henderson", "TX215": "Hidalgo", "TX217": "Hill", "TX219": "Hockley", "TX221": "Hood", "TX223": "Hopkins", "TX225": "Houston", "TX227": "Howard", "TX229": "Hudspeth", "TX231": "Hunt", "TX233": "Hutchinson", "TX235": "Irion", "TX237": "Jack", "TX239": "Jackson", "TX241": "Jasper", "TX243": "Jeff Davis", "TX245": "Jefferson", "TX247": "Jim Hogg", "TX249": "Jim Wells", "TX251": "Johnson", "TX253": "Jones", "TX255": "Karnes", "TX257": "Kaufman", "TX259": "Kendall", "TX261": "Kenedy", "TX263": "Kent", "TX265": "Kerr", "TX267": "Kimble", "TX269": "King", "TX271": "Kinney", "TX273": "Kleberg", "TX275": "Knox", "TX277": "Lamar", "TX279": "Lamb", "TX281": "Lampasas", "TX283": "La Salle", "TX285": "Lavaca", "TX287": "Lee", "TX289": "Leon", "TX291": "Liberty", "TX293": "Limestone", "TX295": "Lipscomb", "TX297": "Live Oak", "TX299": "Llano", "TX301": "Loving", "TX303": "Lubbock", "TX305": "Lynn", "TX307": "McCulloch", "TX309": "McLennan", "TX311": "McMullen", "TX313": "Madison", "TX315": "Marion", "TX317": "Martin", "TX319": "Mason", "TX321": "Matagorda", "TX323": "Maverick", "TX325": "Medina", "TX327": "Menard", "TX329": "Midland", "TX331": "Milam", "TX333": "Mills", "TX335": "Mitchell", "TX337": "Montague", "TX339": "Montgomery", "TX341": "Moore", "TX343": "Morris", "TX345": "Motley", "TX347": "Nacogdoches", "TX349": "Navarro", "TX351": "Newton", "TX353": "Nolan", "TX355": "Nueces", "TX357": "Ochiltree", "TX359": "Oldham", "TX361": "Orange", "TX363": "Palo Pinto", "TX365": "Panola", "TX367": "Parker", "TX369": "Parmer", "TX371": "Pecos", "TX373": "Polk", "TX375": "Potter", "TX377": "Presidio", "TX379": "Rains", "TX381": "Randall", "TX383": "Reagan", "TX385": "Real", "TX387": "Red River", "TX389": "Reeves", "TX391": "Refugio", "TX393": "Roberts", "TX395": "Robertson", "TX397": "Rockwall", "TX399": "Runnels", "TX401": "Rusk", "TX403": "Sabine", "TX405": "San Augustine", "TX407": "San Jacinto", "TX409": "San Patricio", "TX411": "San Saba", "TX413": "Schleicher", "TX415": "Scurry", "TX417": "Shackelford", "TX419": "Shelby", "TX421": "Sherman", "TX423": "Smith", "TX425": "Somervell", "TX427": "Starr", "TX429": "Stephens", "TX431": "Sterling", "TX433": "Stonewall", "TX435": "Sutton", "TX437": "Swisher", "TX439": "Tarrant", "TX441": "Taylor", "TX443": "Terrell", "TX445": "Terry", "TX447": "Throckmorton", "TX449": "Titus", "TX451": "Tom Green", "TX453": "Travis", "TX455": "Trinity", "TX457": "Tyler", "TX459": "Upshur", "TX461": "Upton", "TX463": "Uvalde", "TX465": "Val Verde", "TX467": "Van Zandt", "TX469": "Victoria", "TX471": "Walker", "TX473": "Waller", "TX475": "Ward", "TX477": "Washington", "TX479": "Webb", "TX481": "Wharton", "TX483": "Wheeler", "TX485": "Wichita", "TX487": "Wilbarger", "TX489": "Willacy", "TX491": "Williamson", "TX493": "Wilson", "TX495": "Winkler", "TX497": "Wise", "TX499": "Wood", "TX501": "Yoakum", "TX503": "Young", "TX505": "Zapata", "TX507": "Zavala"
  };

function formatCountyList(areaDesc) {
  const allCounties = areaDesc
    .split(";")
    .map(c => c.trim().replace(", TX", ""))
    .filter(Boolean);

  const texasCounties = allCounties.filter(c => Object.values(ugcToCounty).includes(c));
  if (texasCounties.length === 0) return "";
  if (texasCounties.length === 1) return `${texasCounties[0]} County`;
  return `${texasCounties.slice(0, -1).join(", ")}, and ${texasCounties.slice(-1)} Counties`;
}

async function fetchAndDisplayAlerts() {
    try {
      const res = await fetch("https://api.weather.gov/alerts/active.atom?area=TX");
      const xmlText = await res.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, "application/xml");
      const entries = xml.querySelectorAll("entry");

    const newActiveWarnings = [];

    entries.forEach(entry => {
      const id = entry.querySelector("id")?.textContent;
      let event = "", areaDesc = "", expiresISO = "", sentISO = "", msgType = "Alert";
      let wind = "", hail = "", tornadoDetection = "", hailThreat = "";

// Enhanced CAP parameter parsing
for (let p of params) {
  const name = p.getElementsByTagNameNS(CAP_NS, "valueName")[0]?.textContent;
  const val = p.getElementsByTagNameNS(CAP_NS, "value")[0]?.textContent;

  if (name === "maxWindGust" && val) wind = val;
  if (name === "maxHailSize" && val) hail = val;
  if (name === "tornadoDetection" && val) tornadoDetection = val;
  if (name === "hailThreat" && val) hailThreat = val;
}

      const ugcValues = Array.from(entry.getElementsByTagNameNS("*", "geocode"))
        .flatMap(geo => {
          const nameEl = geo.getElementsByTagNameNS("*", "valueName")[0];
          const valEl = geo.getElementsByTagNameNS("*", "value")[0];
          return nameEl?.textContent === "UGC" ? [valEl?.textContent] : [];
        });

      const hasTexasUGC = ugcValues.some(code => code && code.startsWith("TXC"));
      if (!hasTexasUGC) return;

      Array.from(entry.children).forEach(child => {
        const tag = child.localName;
        if (tag === "event") event = child.textContent.trim();
        if (tag === "areaDesc") areaDesc = child.textContent.trim();
        if (tag === "expires") expiresISO = child.textContent.trim();
        if (tag === "sent") sentISO = child.textContent.trim();
        if (tag === "msgType") msgType = child.textContent.trim();
      });

      const params = entry.getElementsByTagNameNS(CAP_NS, "parameter");
      for (let p of params) {
        const name = p.getElementsByTagNameNS(CAP_NS, "valueName")[0]?.textContent;
        const val = p.getElementsByTagNameNS(CAP_NS, "value")[0]?.textContent;
        if (name === "maxWindGust" && val) wind = val;
        if (name === "maxHailSize" && val) hail = val;
        if (name === "tornadoTag" && val === "POSSIBLE") tornadoPossible = true;
      }

      const hazardParts = [];

if (tornadoDetection) hazardParts.push(`${tornadoDetection} Tornado`);
if (wind) hazardParts.push(`${wind} Winds`);
if (hail) hazardParts.push(`${hail}" Hail`);
if (!tornadoDetection && hailThreat) hazardParts.push(`${hailThreat} Hail`);

const hazardsText = hazardParts.length ? ` Hazards: ${hazardParts.join(" and ")}` : "";


      const sent = new Date(sentISO).getTime();
      const expires = new Date(expiresISO).toLocaleTimeString("en-US", { timeZone: "America/Chicago" });

      if (!["Tornado Warning", "Severe Thunderstorm Warning", "Flash Flood Warning"].includes(event)) return;

      const baseText = `${event} – ${formatCountyList(areaDesc)} until ${expires}`;

      const alertObj = {
        id,
        text: baseText + hazardsText,
        type: eventColor(event),
        expires: expiresISO
      };

      newActiveWarnings.push(alertObj);

      if (!seenAlertIds.has(id)) {
        if (sent > pageLoadTime && msgType === "Alert") {
          triggerPopup(`🚨 ${event} for ${areaDesc} until ${expires}`, event);
        }
        seenAlertIds.add(id);
      }
    });

    console.log("✅ Found", newActiveWarnings.length, "Texas warnings:", newActiveWarnings);

    newActiveWarnings.sort((a, b) => {
      const isTornadoA = a.text.includes("Tornado Warning");
      const isTornadoB = b.text.includes("Tornado Warning");
      if (isTornadoA && !isTornadoB) return -1;
      if (!isTornadoA && isTornadoB) return 1;
      return new Date(b.expires) - new Date(a.expires);
    });

    updateSidebar(newActiveWarnings);
  } catch (err) {
    console.error("⚠️ Fetch failed:", err);
  }
}

// Startup
fetchAndDisplayAlerts();
setInterval(fetchAndDisplayAlerts, 6000);
fetchStormReports();
setInterval(fetchStormReports, 10000);
