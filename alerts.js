let activeAlertCache = new Map(); // id -> sent timestamp
let activeWarnings = [];
let lastTickerHTML = "";
const pageLoadTime = Date.now();
let seenAlertIds = new Set();  // <-- this is our simple ID cache
const CAP_NS = "urn:oasis:names:tc:emergency:cap:1.1";


const ugcToCounty = {
    "OHC001": "Adams", "OHC003": "Allen", "OHC005": "Ashland", "OHC007": "Ashtabula",
    "OHC009": "Athens", "OHC011": "Auglaize", "OHC013": "Belmont", "OHC015": "Brown",
    "OHC017": "Butler", "OHC019": "Carroll", "OHC021": "Champaign", "OHC023": "Clark",
    "OHC025": "Clermont", "OHC027": "Clinton", "OHC029": "Columbiana", "OHC031": "Coshocton",
    "OHC033": "Crawford", "OHC035": "Cuyahoga", "OHC037": "Darke", "OHC039": "Defiance",
    "OHC041": "Delaware", "OHC043": "Erie", "OHC045": "Fairfield", "OHC047": "Fayette",
    "OHC049": "Franklin", "OHC051": "Fulton", "OHC053": "Gallia", "OHC055": "Geauga",
    "OHC057": "Greene", "OHC059": "Guernsey", "OHC061": "Hamilton", "OHC063": "Hancock",
    "OHC065": "Hardin", "OHC067": "Harrison", "OHC069": "Henry", "OHC071": "Highland",
    "OHC073": "Hocking", "OHC075": "Holmes", "OHC077": "Huron", "OHC079": "Jackson",
    "OHC081": "Jefferson", "OHC083": "Knox", "OHC085": "Lake", "OHC087": "Lawrence",
    "OHC089": "Licking", "OHC091": "Logan", "OHC093": "Lorain", "OHC095": "Lucas",
    "OHC097": "Madison", "OHC099": "Mahoning", "OHC101": "Marion", "OHC103": "Medina",
    "OHC105": "Meigs", "OHC107": "Mercer", "OHC109": "Miami", "OHC111": "Monroe",
    "OHC113": "Montgomery", "OHC115": "Morgan", "OHC117": "Morrow", "OHC119": "Muskingum",
    "OHC121": "Noble", "OHC123": "Ottawa", "OHC125": "Paulding", "OHC127": "Perry",
    "OHC129": "Pickaway", "OHC131": "Pike", "OHC133": "Portage", "OHC135": "Preble",
    "OHC137": "Putnam", "OHC139": "Richland", "OHC141": "Ross", "OHC143": "Sandusky",
    "OHC145": "Scioto", "OHC147": "Seneca", "OHC149": "Shelby", "OHC151": "Stark",
    "OHC153": "Summit", "OHC155": "Trumbull", "OHC157": "Tuscarawas", "OHC159": "Union",
    "OHC161": "Van Wert", "OHC163": "Vinton", "OHC165": "Warren", "OHC167": "Washington",
    "OHC169": "Wayne", "OHC171": "Williams", "OHC173": "Wood", "OHC175": "Wyandot"
  };

function formatCountyList(areaDesc) {
    const counties = areaDesc
      .split(";")
      .map(c => c.replace(", OH", "").trim())
      .filter(c => c.length > 0);
  
    if (counties.length === 1) return `${counties[0]} County`;
    return `${counties.slice(0, -1).join(", ")}, and ${counties.slice(-1)} Counties`;
  }

  async function fetchAndDisplayAlerts() {
    try {
      const res = await fetch("https://api.weather.gov/alerts/active.atom?area=OH");
      const xmlText = await res.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, "application/xml");
      const entries = xml.querySelectorAll("entry");
  
      const newActiveWarnings = [];
  
      entries.forEach(entry => {
        const id = entry.querySelector("id")?.textContent;
        let event = "";
        let areaDesc = "";
        let expiresISO = "";
        let sentISO = "";
      
        // Loop through children and get CAP fields by tag name (ignore namespaces)
        Array.from(entry.children).forEach(child => {
          const tag = child.localName;
      
          if (tag === "event") event = child.textContent.trim();
          if (tag === "areaDesc") areaDesc = child.textContent.trim();
          if (tag === "expires") expiresISO = child.textContent.trim();
          if (tag === "sent") sentISO = child.textContent.trim();
          if (tag === "msgType") msgType = child.textContent.trim();
        });
        const sent = new Date(sentISO).getTime();
        const expires = new Date(expiresISO).toLocaleTimeString("en-US", { timeZone: "America/New_York" });
      
        if (!["Tornado Warning", "Severe Thunderstorm Warning", "Flash Flood Warning"].includes(event)) return;
      
        const formattedText = `🚨 ${event} for ${areaDesc} until ${expires}`;
        const formattedCounties = formatCountyList(areaDesc);
      
        const alertObj = {
            id,
            text: `${event} – ${formatCountyList(areaDesc)} until ${expires}`,
            type: eventColor(event),
            expires: expiresISO
          };
          
          // Always include in sidebar/ticker
          newActiveWarnings.push(alertObj);
          
          // Only trigger popup if new
          if (!seenAlertIds.has(id)) {
            // Only trigger popup for *new* alerts, not updates
            if (sent > pageLoadTime && msgType === "Alert") {
              triggerPopup(`🚨 ${event} for ${areaDesc} until ${expires}`, event);
            }
            seenAlertIds.add(id);
          }
      });

      console.log("✅ Found", newActiveWarnings.length, "active warnings:", newActiveWarnings);

      newActiveWarnings.sort((a, b) => {
        // 1. Tornado Warnings first
        const isTornadoA = a.text.includes("Tornado Warning");
        const isTornadoB = b.text.includes("Tornado Warning");
        if (isTornadoA && !isTornadoB) return -1;
        if (!isTornadoA && isTornadoB) return 1;
      
        // 2. Otherwise, sort by newest (latest `expires`)
        return new Date(b.expires) - new Date(a.expires);
      });
  
      updateSidebar(newActiveWarnings);
    } catch (err) {
      console.error("⚠️ Fetch failed:", err);
    }
  }

let activeWarningTimers = [];

function updateSidebar(warnings) {
  const list = document.getElementById("activeWarningsList");
  const existingItems = new Map();

  // Cache existing items by ID
  list.querySelectorAll("li").forEach(li => {
    existingItems.set(li.dataset.id, li);
  });

  const idsToKeep = new Set();

  warnings.forEach(warn => {
    idsToKeep.add(warn.id);

    // If already exists, do nothing
    if (existingItems.has(warn.id)) return;

    // New warning – create and insert
    const li = document.createElement("li");
    li.dataset.id = warn.id;
    li.dataset.text = warn.text; // ✅ store clean text for ticker
    li.style.borderLeftColor = warn.type;
    li.classList.add("slide-in");
    const expires = new Date(warn.expires);

    const updateText = () => {
        const remaining = Math.max(0, expires - Date.now());
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        li.textContent = `${warn.text} (expires in ${mins}m ${secs}s)`; // shown in sidebar only
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
  });

  // Remove expired items no longer in data
  list.querySelectorAll("li").forEach(li => {
    if (!idsToKeep.has(li.dataset.id)) {
      li.remove();
    }
  });

  updateTickerText();
  updatePromoVisibility();
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
      const res = await fetch("https://mesonet.agron.iastate.edu/geojson/lsr.geojson?states=OH&hours=2");
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
    const text = `🚨 ${type} for Hamilton County until ${timeStr}`;
  
    triggerPopup(text, type);
  
    const fakeWarn = {
      id: "test-" + type + "-" + time.getTime(),
      text: `${type} – Hamilton County until ${timeStr}`,
      type: eventColor(type),
      expires: expires.toISOString()
    };
  
    addActiveWarning(fakeWarn);
  }

function triggerStormReport() {
    const time = new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York" });
    const text = `🟢 Hail Report – Golf Ball Size near Dayton, OH (${time})`;
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
      newMessages.push("✅ No active warnings in Ohio");
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
  
    clearInterval(tickerInterval); // stop previous loop
  
    tickerIndex = 0; // reset index
  
    // Always show the first message
    rotator.textContent = tickerMessages[0];
    rotator.style.opacity = 1;
  
    // Only rotate if more than one message
    if (tickerMessages.length > 1) {
      const rotate = () => {
        rotator.style.opacity = 0;
  
        setTimeout(() => {
          tickerIndex = (tickerIndex + 1) % tickerMessages.length;
          const message = tickerMessages[tickerIndex];
rotator.textContent = message;
rotator.className = ""; // Clear previous class

if (message.includes("Tornado Warning")) {
  rotator.classList.add("ticker-red");
} else if (message.includes("Severe Thunderstorm Warning")) {
  rotator.classList.add("ticker-yellow");
} else if (message.includes("Flash Flood Warning")) {
  rotator.classList.add("ticker-darkred");
} else {
  rotator.classList.add("ticker-default");
}

rotator.style.opacity = 1;
        }, 500);
      };
  
      tickerInterval = setInterval(rotate, 6000);
      updatePromoVisibility();
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
updatePromoVisibility(); // 👈 Ensures image visibility is correct after test warning
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

  function rotatePromoImages() {
    const rotator = document.getElementById("promoRotator");
    const images = rotator.querySelectorAll(".promo-img");
  
    let currentIndex = 0;
    if (images.length === 0) return;
  
    rotator.style.display = "block";
    images[0].style.display = "block";
  
    setInterval(() => {
      images[currentIndex].style.display = "none";
      currentIndex = (currentIndex + 1) % images.length;
      images[currentIndex].style.display = "block";
    }, 5000);
  }
  
  // Only show promos if 0 or 1 warnings
  function updatePromoVisibility() {
    const list = document.getElementById("activeWarningsList");
    const rotator = document.getElementById("promoRotator");
  
    if (list.children.length <= 1) {
      rotator.style.display = "block";
    } else {
      rotator.style.display = "none";
    }
  }
  
  makeTestPanelDraggable();
  rotatePromoImages();

// Start fetch
fetchAndDisplayAlerts();
setInterval(fetchAndDisplayAlerts, 6000); // every 7 Seconds

fetchStormReports();
setInterval(fetchStormReports, 60000); // every 60 seconds
