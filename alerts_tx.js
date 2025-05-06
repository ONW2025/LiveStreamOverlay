let activeAlertCache = new Map(); // id -> sent timestamp
let activeWarnings = [];
let lastTickerHTML = "";
const pageLoadTime = Date.now();
let seenAlertIds = new Set();  // <-- this is our simple ID cache
const CAP_NS = "urn:oasis:names:tc:emergency:cap:1.2";


const ugcToCounty = {
  "TX001": "Anderson", "TX003": "Andrews", "TX005": "Angelina", "TX007": "Aransas", "TX009": "Archer", "TX011": "Armstrong", "TX013": "Atascosa", "TX015": "Austin", "TX017": "Bailey", "TX019": "Bandera", "TX021": "Bastrop", "TX023": "Baylor", "TX025": "Bee", "TX027": "Bell", "TX029": "Bexar", "TX031": "Blanco", "TX033": "Borden", "TX035": "Bosque", "TX037": "Bowie", "TX039": "Brazoria", "TX041": "Brazos", "TX043": "Brewster", "TX045": "Briscoe", "TX047": "Brooks", "TX049": "Brown", "TX051": "Burleson", "TX053": "Burnet", "TX055": "Caldwell", "TX057": "Calhoun", "TX059": "Callahan", "TX061": "Cameron", "TX063": "Camp", "TX065": "Carson", "TX067": "Cass", "TX069": "Castro", "TX071": "Chambers", "TX073": "Cherokee", "TX075": "Childress", "TX077": "Clay", "TX079": "Cochran", "TX081": "Coke", "TX083": "Coleman", "TX085": "Collin", "TX087": "Collingsworth", "TX089": "Colorado", "TX091": "Comal", "TX093": "Comanche", "TX095": "Concho", "TX097": "Cooke", "TX099": "Coryell", "TX101": "Cottle", "TX103": "Crane", "TX105": "Crockett", "TX107": "Crosby", "TX109": "Culberson", "TX111": "Dallam", "TX113": "Dallas", "TX115": "Dawson", "TX117": "Deaf Smith", "TX119": "Delta", "TX121": "Denton", "TX123": "DeWitt", "TX125": "Dickens", "TX127": "Dimmit", "TX129": "Donley", "TX131": "Duval", "TX133": "Eastland", "TX135": "Ector", "TX137": "Edwards", "TX139": "Ellis", "TX141": "El Paso", "TX143": "Erath", "TX145": "Falls", "TX147": "Fannin", "TX149": "Fayette", "TX151": "Fisher", "TX153": "Floyd", "TX155": "Foard", "TX157": "Fort Bend", "TX159": "Franklin", "TX161": "Freestone", "TX163": "Frio", "TX165": "Gaines", "TX167": "Galveston", "TX169": "Garza", "TX171": "Gillespie", "TX173": "Glasscock", "TX175": "Goliad", "TX177": "Gonzales", "TX179": "Gray", "TX181": "Grayson", "TX183": "Gregg", "TX185": "Grimes", "TX187": "Guadalupe", "TX189": "Hale", "TX191": "Hall", "TX193": "Hamilton", "TX195": "Hansford", "TX197": "Hardeman", "TX199": "Hardin", "TX201": "Harris", "TX203": "Harrison", "TX205": "Hartley", "TX207": "Haskell", "TX209": "Hays", "TX211": "Hemphill", "TX213": "Henderson", "TX215": "Hidalgo", "TX217": "Hill", "TX219": "Hockley", "TX221": "Hood", "TX223": "Hopkins", "TX225": "Houston", "TX227": "Howard", "TX229": "Hudspeth", "TX231": "Hunt", "TX233": "Hutchinson", "TX235": "Irion", "TX237": "Jack", "TX239": "Jackson", "TX241": "Jasper", "TX243": "Jeff Davis", "TX245": "Jefferson", "TX247": "Jim Hogg", "TX249": "Jim Wells", "TX251": "Johnson", "TX253": "Jones", "TX255": "Karnes", "TX257": "Kaufman", "TX259": "Kendall", "TX261": "Kenedy", "TX263": "Kent", "TX265": "Kerr", "TX267": "Kimble", "TX269": "King", "TX271": "Kinney", "TX273": "Kleberg", "TX275": "Knox", "TX277": "Lamar", "TX279": "Lamb", "TX281": "Lampasas", "TX283": "La Salle", "TX285": "Lavaca", "TX287": "Lee", "TX289": "Leon", "TX291": "Liberty", "TX293": "Limestone", "TX295": "Lipscomb", "TX297": "Live Oak", "TX299": "Llano", "TX301": "Loving", "TX303": "Lubbock", "TX305": "Lynn", "TX307": "McCulloch", "TX309": "McLennan", "TX311": "McMullen", "TX313": "Madison", "TX315": "Marion", "TX317": "Martin", "TX319": "Mason", "TX321": "Matagorda", "TX323": "Maverick", "TX325": "Medina", "TX327": "Menard", "TX329": "Midland", "TX331": "Milam", "TX333": "Mills", "TX335": "Mitchell", "TX337": "Montague", "TX339": "Montgomery", "TX341": "Moore", "TX343": "Morris", "TX345": "Motley", "TX347": "Nacogdoches", "TX349": "Navarro", "TX351": "Newton", "TX353": "Nolan", "TX355": "Nueces", "TX357": "Ochiltree", "TX359": "Oldham", "TX361": "Orange", "TX363": "Palo Pinto", "TX365": "Panola", "TX367": "Parker", "TX369": "Parmer", "TX371": "Pecos", "TX373": "Polk", "TX375": "Potter", "TX377": "Presidio", "TX379": "Rains", "TX381": "Randall", "TX383": "Reagan", "TX385": "Real", "TX387": "Red River", "TX389": "Reeves", "TX391": "Refugio", "TX393": "Roberts", "TX395": "Robertson", "TX397": "Rockwall", "TX399": "Runnels", "TX401": "Rusk", "TX403": "Sabine", "TX405": "San Augustine", "TX407": "San Jacinto", "TX409": "San Patricio", "TX411": "San Saba", "TX413": "Schleicher", "TX415": "Scurry", "TX417": "Shackelford", "TX419": "Shelby", "TX421": "Sherman", "TX423": "Smith", "TX425": "Somervell", "TX427": "Starr", "TX429": "Stephens", "TX431": "Sterling", "TX433": "Stonewall", "TX435": "Sutton", "TX437": "Swisher", "TX439": "Tarrant", "TX441": "Taylor", "TX443": "Terrell", "TX445": "Terry", "TX447": "Throckmorton", "TX449": "Titus", "TX451": "Tom Green", "TX453": "Travis", "TX455": "Trinity", "TX457": "Tyler", "TX459": "Upshur", "TX461": "Upton", "TX463": "Uvalde", "TX465": "Val Verde", "TX467": "Van Zandt", "TX469": "Victoria", "TX471": "Walker", "TX473": "Waller", "TX475": "Ward", "TX477": "Washington", "TX479": "Webb", "TX481": "Wharton", "TX483": "Wheeler", "TX485": "Wichita", "TX487": "Wilbarger", "TX489": "Willacy", "TX491": "Williamson", "TX493": "Wilson", "TX495": "Winkler", "TX497": "Wise", "TX499": "Wood", "TX501": "Yoakum", "TX503": "Young", "TX505": "Zapata", "TX507": "Zavala"
};

function formatCountyList(areaDesc) {
  const counties = areaDesc
    .split(";")
    .map(c => c.replace(", TX", "").trim())
    .filter(c => c.length > 0);

  if (counties.length === 1) return `${counties[0]} County`;
  return `${counties.slice(0, -1).join(", ")}, and ${counties.slice(-1)} Counties`;
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
      let wind = "", hail = "", tornadoDetection = "", hailThreat = "", windThreat = "";

      Array.from(entry.children).forEach(child => {
        const tag = child.localName;
        if (tag === "event") event = child.textContent.trim();
        if (tag === "areaDesc") areaDesc = child.textContent.trim();
        if (tag === "expires") expiresISO = child.textContent.trim();
        if (tag === "sent") sentISO = child.textContent.trim();
        if (tag === "msgType") msgType = child.textContent.trim();
      });

      // Use namespace-correct query with wildcard fallback if needed
      const paramBlocks = entry.getElementsByTagNameNS("*", "parameter");
      for (let p of paramBlocks) {
        const name = p.getElementsByTagName("valueName")[0]?.textContent;
        const val = p.getElementsByTagName("value")[0]?.textContent;
        if (!name || !val) continue;
        if (name === "maxWindGust") wind = val;
        if (name === "maxHailSize") hail = val;
        if (name === "tornadoDetection") tornadoDetection = val;
        if (name === "hailThreat") hailThreat = val;
        if (name === "windThreat") windThreat = val;
      }

      const hazardParts = [];
      if (tornadoDetection) hazardParts.push(` Tornado ${tornadoDetection}`);
      if (wind) hazardParts.push(`${wind} Winds`);
      if (hail) hazardParts.push(`${hail}\" Hail`);

      const hazardsText = hazardParts.length ? ` Hazards: ${hazardParts.join(" and ")}` : "";

      const sent = new Date(sentISO).getTime();
      const expires = new Date(expiresISO).toLocaleTimeString("en-US", { timeZone: "America/Chicago" });

      if (
        !["Tornado Warning", "Severe Thunderstorm Warning"].includes(event) ||
        msgType === "Cancel"
      ) {
        return;
      }

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

    console.log("✅ Found", newActiveWarnings.length, "active warnings:", newActiveWarnings);

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

let activeWarningTimers = [];
let lastSidebarSnapshot = "";

function updateSidebar(warnings) {
  const sidebar = document.getElementById("sidebar");
  const list = document.getElementById("activeWarningsList");

  // Show or hide sidebar
  if (warnings.length === 0) {
    sidebar.style.display = "none"; // hide it
  } else {
    sidebar.style.display = "block"; // show it
  }

  // Create a snapshot of current data
  const snapshot = warnings.map(w => w.id).join("|||");
  if (snapshot === lastSidebarSnapshot) return;
  lastSidebarSnapshot = snapshot;

  // Clear timers and list
  activeWarningTimers.forEach(clearInterval);
  activeWarningTimers = [];
  list.innerHTML = "";

  // ✅ No active warnings case
  if (warnings.length === 0) {
    const li = document.createElement("li");
    li.textContent = "✅ No active warnings in Ohio";
    li.classList.add("no-warning", "new-warning-flash");
    setTimeout(() => li.classList.remove("new-warning-flash"), 2000);
    list.appendChild(li);

    // Set ticker messages and trigger update
    tickerMessages = ["✅ No active warnings in Ohio"];
    lastTickerSnapshot = ""; // force update
    updateTickerText();
    return;
  }

  // Populate active warnings
  warnings.forEach(warn => {
    const li = document.createElement("li");
    li.dataset.id = warn.id;
    li.dataset.text = warn.text;
    li.style.borderLeftColor = warn.type;
    li.classList.add("slide-in", "new-warning-flash");
    setTimeout(() => li.classList.remove("new-warning-flash"), 2000);

    const expires = new Date(warn.expires);
    const updateText = () => {
      const remaining = Math.max(0, expires - Date.now());
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      li.textContent = `${warn.text} (expires in ${mins}m ${secs}s)`;
    };

    updateText();

    const timer = setInterval(() => {
      if (Date.now() >= expires) {
        li.remove();
        updateTickerText();
        clearInterval(timer);
      } else {
        updateText();
      }
    }, 1000);

    activeWarningTimers.push(timer);
    list.appendChild(li);
  });

  updateTickerText();
}

function eventColor(event) {
  switch (event) {
    case "Tornado Warning": return "#ff3333";
    case "Severe Thunderstorm Warning": return "#ffcc00";
    case "Flash Flood Warning": return "#990000";
    default: return "#ccc";
  }
}
let lsrCache = new Set();

async function fetchStormReports() {
    try {
      const res = await fetch("https://mesonet.agron.iastate.edu/geojson/lsr.geojson?states=TX&hours=2");
      const data = await res.json();
      const reports = data.features;
  
      reports.forEach(report => {
        const props = report.properties;
        const id = `${props.valid}-${props.magnitude}-${props.city}`;
        const reportTime = new Date(props.valid).getTime();
      
        if (lsrCache.has(id)) return;
        if (reportTime <= pageLoadTime) {
          lsrCache.add(id); // avoid showing later
          return;
        }
      
        const time = new Date(props.valid).toLocaleTimeString("en-US", { timeZone: "America/New_York" });
        const event = props.typetext || props.type || "Storm Report";
        const location = `${props.city}, ${props.county} Co`;
        const magnitude = props.magnitude || props.magf || "";
        const unit = props.unit || (event.toLowerCase().includes("hail") ? "in" : event.toLowerCase().includes("wind") ? "mph" : "");
      
        const magText = magnitude ? ` – ${magnitude}${unit}` : "";
        const text = `🟢 ${event}${magText} – ${location} (${time})`;
      
        addStormReport(text);
        lsrCache.add(id);
      });
  
      // Trim the cache
      if (lsrCache.size > 100) {
        lsrCache = new Set(Array.from(lsrCache).slice(-50));
      }
  
    } catch (err) {
      console.error("⚠️ LSR Fetch Error:", err);
    }
  }

  function triggerPopup(text, type = "default") {
    const popup = document.getElementById("alertPopup");
    popup.textContent = text;
  
    // Remove any old color class
    popup.classList.remove("popup-red", "popup-yellow", "popup-darkred");
  
    // Add new based on type
    if (type === "Tornado Warning") popup.classList.add("popup-red");
    else if (type === "Severe Thunderstorm Warning") popup.classList.add("popup-yellow");
    else if (type === "Flash Flood Warning") popup.classList.add("popup-darkred");
  
    popup.classList.add("show");
  
    setTimeout(() => {
      popup.classList.remove("show");
    }, 15000);
  }

  function addStormReport(text) {
    const container = document.getElementById("stormReportsContainer");
    const div = document.createElement("div");
    div.className = "report-card";
    div.innerText = text;
    container.appendChild(div);
  
    // ✅ Play chime
    const chime = document.getElementById("lsrChime");
    if (chime) {
      chime.currentTime = 0;
      chime.play().catch(err => {
        console.warn("🔇 Could not play LSR chime (possibly blocked by browser autoplay policy):", err);
      });
    }
  
    // ✅ Log to console
    console.log("📢 New Storm Report:", text);
  
    setTimeout(() => container.removeChild(div), 15000);
  }

// Manual test
function triggerTest(type) {
    const time = new Date();
    const timeStr = time.toLocaleTimeString("en-US", { timeZone: "America/New_York" });
    const expires = new Date(time.getTime() + 10 * 60 * 1000); // expires in 10 minutes
    const text = `🚨 ${type} for Travis County until ${timeStr}`;
  
    triggerPopup(text, type);
  
    const fakeWarn = {
      id: "test-" + type + "-" + time.getTime(),
      text: `${type} – Travis County until ${timeStr}`,
      type: eventColor(type),
      expires: expires.toISOString()
    };
  
    addActiveWarning(fakeWarn);
  }

function triggerStormReport() {
    const time = new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York" });
    const text = `🟢 Hail Report – Golf Ball Size near Dayton, TX (${time})`;
    addStormReport(text);
  }

function addActiveWarning(text, color) {
  const li = document.createElement("li");
  li.textContent = text;
  li.style.borderLeftColor = color;
  document.getElementById("activeWarningsList").appendChild(li);
}

let tickerMessages = [];
let tickerIndex = 0;
let tickerInterval;
let lastTickerSnapshot = "";

function updateTickerText() {
    const listItems = Array.from(document.querySelectorAll('#activeWarningsList li'));
    const newMessages = listItems.map(li => li.dataset.text || li.textContent);
  
    if (newMessages.length === 0) {
      newMessages.push("✅ No active warnings in Texas");
    }
  
    const snapshot = newMessages.join("|||"); // compact representation
  
    // 🔄 Only update and restart if the list changed
    if (snapshot !== lastTickerSnapshot) {
      tickerMessages = newMessages;
      tickerIndex = 0;
      lastTickerSnapshot = snapshot;
      startTickerRotation();
    }
  }

  function startTickerRotation() {
    const rotator = document.getElementById("alertRotator");
    if (!rotator || tickerMessages.length === 0) return;
  
    clearInterval(tickerInterval);
    tickerIndex = 0;
  
    const applyTickerText = (message) => {
      rotator.textContent = message;
      rotator.classList.remove("ticker-red", "ticker-yellow", "ticker-darkred", "ticker-default");

if (message.includes("Tornado Warning")) {
  rotator.classList.add("ticker-red");
} else if (message.includes("Severe Thunderstorm Warning")) {
  rotator.classList.add("ticker-yellow");
} else if (message.includes("Flash Flood Warning")) {
  rotator.classList.add("ticker-darkred");
} else {
  rotator.classList.add("ticker-default");
}

  
      // Fade out preparation
      rotator.style.transition = "none";
      rotator.style.opacity = 1;
      void rotator.offsetWidth; // trigger reflow
  
      // Measure overflow
      setTimeout(() => {
        const containerWidth = rotator.offsetWidth;
        const textWidth = rotator.scrollWidth;
      
        rotator.classList.remove("scroll");
        if (textWidth > containerWidth) {
          // Delay the scroll by 2 seconds
          setTimeout(() => {
            rotator.classList.add("scroll");
          }, 2000);
        }
      
        rotator.style.transition = "opacity 0.5s ease-in-out";
      }, 100);
    };
  
    applyTickerText(tickerMessages[0]);
  
    if (tickerMessages.length > 1) {
      tickerInterval = setInterval(() => {
        rotator.style.opacity = 0;
        setTimeout(() => {
          tickerIndex = (tickerIndex + 1) % tickerMessages.length;
          applyTickerText(tickerMessages[tickerIndex]);
          rotator.style.opacity = 1;
        }, 500);
      }, 12000);
    }
  }
  
  // Also call in test
  function addActiveWarning(warn) {
    const list = document.getElementById("activeWarningsList");
    const li = document.createElement("li");
    li.dataset.id = warn.id;
    li.style.borderLeftColor = warn.type;
    li.classList.add("slide-in");
  
    const expires = new Date(warn.expires);
  
    const updateText = () => {
      const remaining = Math.max(0, expires - Date.now());
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      li.dataset.text = warn.text; // clean version for ticker
      li.textContent = `${warn.text} (expires in ${mins}m ${secs}s)`;
    };
  
    updateText();
  
    const timer = setInterval(() => {
      if (Date.now() >= expires) {
        li.remove();
        updateTickerText();
        clearInterval(timer);
      } else {
        updateText();
      }
    }, 1000);
  
    activeWarningTimers.push(timer);
    list.insertBefore(li, list.firstChild);
    updateTickerText();
  }

  // Make the test panel draggable
function makeTestPanelDraggable() {
    const panel = document.getElementById("testPanel");
    const header = document.getElementById("testPanelHeader");
    let offsetX = 0, offsetY = 0, isDragging = false;
  
    header.addEventListener("mousedown", e => {
      isDragging = true;
      offsetX = e.clientX - panel.offsetLeft;
      offsetY = e.clientY - panel.offsetTop;
      document.body.style.userSelect = "none";
    });
  
    document.addEventListener("mouseup", () => {
      isDragging = false;
      document.body.style.userSelect = "auto";
    });
  
    document.addEventListener("mousemove", e => {
      if (isDragging) {
        panel.style.left = `${e.clientX - offsetX}px`;
        panel.style.top = `${e.clientY - offsetY}px`;
      }
    });
  }
  
  makeTestPanelDraggable();

// Start fetch
fetchAndDisplayAlerts();
setInterval(fetchAndDisplayAlerts, 6000); // every 7 Seconds

fetchStormReports();
setInterval(fetchStormReports, 60000); // every 60 seconds
