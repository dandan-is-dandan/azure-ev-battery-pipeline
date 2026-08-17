// ==========================================================================
// 1. 초기 로딩 및 API 연결 실패 시 작동하는 Fallback 정적 데이터 구조
// ==========================================================================
let regionData = {
  ALL: { label: "전국", center: [35.9, 127.8], zoom: 7, total: 0, normal: 0, warning: 0, danger: 0, avgBsi: "0.00", threshold: 90, vehicles: [] },
  SEOUL: { label: "서울특별시", center: [37.5665, 126.9780], zoom: 11, total: 0, normal: 0, warning: 0, danger: 0, avgBsi: "0.00", threshold: 90, vehicles: [] },
  BUSAN: { label: "부산광역시", center: [35.1796, 129.0756], zoom: 11, total: 0, normal: 0, warning: 0, danger: 0, avgBsi: "0.00", threshold: 90, vehicles: [] },
  DAEGU: { label: "대구광역시", center: [35.8711, 128.6014], zoom: 11, total: 0, normal: 0, warning: 0, danger: 0, avgBsi: "0.00", threshold: 90, vehicles: [] },
  INCHEON: { label: "인천광역시", center: [37.4563, 126.7052], zoom: 11, total: 0, normal: 0, warning: 0, danger: 0, avgBsi: "0.00", threshold: 90, vehicles: [] },
  GWANGJU: { label: "광주광역시", center: [35.1595, 126.8526], zoom: 11, total: 0, normal: 0, warning: 0, danger: 0, avgBsi: "0.00", threshold: 90, vehicles: [] },
  DAEJEON: { label: "대전광역시", center: [36.3504, 127.3848], zoom: 11, total: 0, normal: 0, warning: 0, danger: 0, avgBsi: "0.00", threshold: 90, vehicles: [] },
  ULSAN: { label: "울산광역시", center: [35.5389, 129.3114], zoom: 11, total: 0, normal: 0, warning: 0, danger: 0, avgBsi: "0.00", threshold: 90, vehicles: [] },
  SEJONG: { label: "세종특별자치시", center: [36.4801, 127.2890], zoom: 12, total: 0, normal: 0, warning: 0, danger: 0, avgBsi: "0.00", threshold: 90, vehicles: [] },
  GYEONGGI: { label: "경기도", center: [37.4138, 127.5183], zoom: 9, total: 0, normal: 0, warning: 0, danger: 0, avgBsi: "0.00", threshold: 90, vehicles: [] },
  GANGWON: { label: "강원특별자치도", center: [37.8228, 128.1555], zoom: 9, total: 0, normal: 0, warning: 0, danger: 0, avgBsi: "0.00", threshold: 90, vehicles: [] },
  CHUNGBUK: { label: "충청북도", center: [36.6356, 127.4913], zoom: 9, total: 0, normal: 0, warning: 0, danger: 0, avgBsi: "0.00", threshold: 90, vehicles: [] },
  CHUNGNAM: { label: "충청남도", center: [36.6588, 126.6728], zoom: 9, total: 0, normal: 0, warning: 0, danger: 0, avgBsi: "0.00", threshold: 90, vehicles: [] },
  JEONBUK: { label: "전북특별자치도", center: [35.7175, 127.1446], zoom: 9, total: 0, normal: 0, warning: 0, danger: 0, avgBsi: "0.00", threshold: 90, vehicles: [] },
  JEONNAM: { label: "전라남도", center: [34.8679, 126.9910], zoom: 9, total: 0, normal: 0, warning: 0, danger: 0, avgBsi: "0.00", threshold: 90, vehicles: [] },
  GYEONGBUK: { label: "경상북도", center: [36.4919, 128.8889], zoom: 9, total: 0, normal: 0, warning: 0, danger: 0, avgBsi: "0.00", threshold: 90, vehicles: [] },
  GYEONGNAM: { label: "경상남도", center: [35.4606, 128.2132], zoom: 9, total: 0, normal: 0, warning: 0, danger: 0, avgBsi: "0.00", threshold: 90, vehicles: [] },
  JEJU: { label: "제주특별자치도", center: [33.4996, 126.5312], zoom: 10, total: 0, normal: 0, warning: 0, danger: 0, avgBsi: "0.00", threshold: 90, vehicles: [] }
};

let map = null;
let markerGroup = null;
let statusChart = null;
const regionSelect = document.getElementById("regionSelect");

function initMap() {
  map = L.map("mapArea", {
    zoomControl: true,
    attributionControl: false
  }).setView(regionData.ALL.center, regionData.ALL.zoom);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 18,
    minZoom: 5
  }).addTo(map);

  markerGroup = L.layerGroup().addTo(map);
}

// 🌟 [수정] 등급 매핑 함수 보완 (텍스트 매칭 뿐만 아니라 수치 판정 조건도 추가 결합)
function getBadgeClass(status, bsi = 0) {
  if (status === "위험" || status === "CRITICAL" || bsi >= 2.5242) return "danger";
  if (status === "경고" || status === "WARNING" || (bsi >= 1.8627 && bsi < 2.5242)) return "warning";
  return "normal";
}

// 🌟 [수정] 실제 연구 수치 기준값으로 인라인 텍스트 컬러 스케일 분기점 교체
function getBsiClass(bsi) {
  if (bsi >= 2.5242) return "bsi-danger";  // Critical 등급 시작점
  if (bsi >= 1.8627) return "bsi-warning"; // Warning 등급 시작점
  return "";
}

function renderMapMarkers(data) {
  markerGroup.clearLayers();

  if (!data.vehicles || data.vehicles.length === 0) return;

  data.vehicles.forEach(v => {
    let color = "#22c55e";

    if (v.status === "경고" || v.status === "WARNING") color = "#facc15";
    if (v.status === "위험" || v.status === "CRITICAL") color = "#ef4444";

    const customIcon = L.divIcon({
      className: "custom-marker",
      html: `<div class="marker-ping ${getBadgeClass(v.status, v.bsi)}" style="background-color: ${color}; border: 2px solid #fff;">🚗</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const popupContent = `
      <div class="map-popup">
        <h3>${v.vehicle_id} <span class="badge ${getBadgeClass(v.status, v.bsi)}">${v.status}</span></h3>
        <p><b>위치:</b> ${v.location}</p>
        <p><b>BSI:</b> <span class="${getBsiClass(v.bsi)}">${v.bsi.toFixed(2)}</span></p>
        <p><b>이벤트:</b> ${v.event}</p>
        <p class="popup-time">업데이트: ${v.time}</p>
      </div>
    `;

    const marker = L.marker([v.lat, v.lng], { icon: customIcon }).bindPopup(popupContent);
    markerGroup.addLayer(marker);
  });

  const criticalVehicle = data.vehicles.find(v => v.status === "위험" || v.status === "CRITICAL" || v.bsi >= 2.5242);

  if (criticalVehicle) {
    map.flyTo([criticalVehicle.lat, criticalVehicle.lng], 14, {
      animate: true,
      duration: 1.2
    });
  } else {
    map.flyTo(data.center, data.zoom, {
      animate: true,
      duration: 0.8
    });
  }
}

function renderChart(data) {
  const ctx = document.getElementById("statusChart").getContext("2d");

  if (statusChart) statusChart.destroy();

  document.getElementById("chartCenterNum").innerText = data.total;

  statusChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["정상", "경고", "위험"],
      datasets: [
        {
          data: [data.normal, data.warning, data.danger],
          backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      cutout: "74%"
    }
  });
}

function renderSummary(data) {
  document.getElementById("summaryTitle").innerText = `차량 상태 요약 (${data.label})`;
  document.getElementById("mapRegionText").innerText = data.label;

  // 🌟 [수정] 위험 임계값 라벨 텍스트를 실제 Critical 시작점인 2.52로 동기화 완료
  document.getElementById("summaryMetrics").innerHTML = `
    <div>전체 차량<br /><strong>${data.total}</strong> 대</div>
    <div>평균 BSI<br /><strong class="blue">${Number(data.avgBsi).toFixed(2)}</strong></div>
    <div>위험 임계값<br /><strong class="red">2.52</strong></div>
  `;

  const normalRate = data.total > 0 ? ((data.normal / data.total) * 100).toFixed(1) : "0.0";
  const warningRate = data.total > 0 ? ((data.warning / data.total) * 100).toFixed(1) : "0.0";
  const dangerRate = data.total > 0 ? ((data.danger / data.total) * 100).toFixed(1) : "0.0";

  document.getElementById("statusBars").innerHTML = `
    <div>
      <div class="status-row"><span><i class="dot normal-dot"></i>정상</span><b>${data.normal}대 (${normalRate}%)</b></div>
      <div class="bar"><em class="normal-bar" style="width:${normalRate}%"></em></div>
    </div>
    <div>
      <div class="status-row"><span><i class="dot warning-dot"></i>경고</span><b>${data.warning}대 (${warningRate}%)</b></div>
      <div class="bar"><em class="warning-bar" style="width:${warningRate}%"></em></div>
    </div>
    <div>
      <div class="status-row"><span><i class="dot danger-dot"></i>위험</span><b>${data.danger}대 (${dangerRate}%)</b></div>
      <div class="bar"><em class="danger-bar" style="width:${dangerRate}%"></em></div>
    </div>
  `;

  const maxBsi = data.vehicles && data.vehicles.length > 0
    ? Math.max(...data.vehicles.map(v => v.bsi)).toFixed(2)
    : "0.00";

  document.getElementById("alertCards").innerHTML = `
    <div class="mini-card danger-text">위험 알림<br /><strong>${data.danger}</strong> 건</div>
    <div class="mini-card warning-text">경고 알림<br /><strong>${data.warning}</strong> 건</div>
    <div class="mini-card">평균 BSI<br /><strong>${Number(data.avgBsi).toFixed(2)}</strong></div>
    <div class="mini-card danger-text">최고 BSI<br /><strong>${maxBsi}</strong></div>
  `;
}

function renderTables(vehicles) {
  if (!vehicles || vehicles.length === 0) {
    document.getElementById("topRiskTable").innerHTML = `<tr><td colspan="5" style="text-align:center; color:#64748b; padding:20px;">관제 차량 없음</td></tr>`;
    document.getElementById("alertTable").innerHTML = `<tr><td colspan="6" style="text-align:center; color:#64748b; padding:20px;">발생한 알림 없음</td></tr>`;
    return;
  }

  const topRiskTable = document.getElementById("topRiskTable");
  const sortedRisk = [...vehicles].sort((a, b) => b.bsi - a.bsi).slice(0, 5);

  topRiskTable.innerHTML = sortedRisk.map((v, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${v.vehicle_id}</td>
      <td>${v.location}</td>
      <td class="${getBsiClass(v.bsi)}">${v.bsi.toFixed(2)}</td>
      <td><span class="badge ${getBadgeClass(v.status, v.bsi)}">${v.status}</span></td>
    </tr>
  `).join("");

  const alertTable = document.getElementById("alertTable");
  const alerts = vehicles
    .filter(v => v.status !== "정상" && v.status !== "NORMAL")
    .sort((a, b) => b.bsi - a.bsi);

  if (alerts.length === 0) {
    alertTable.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#64748b; padding:20px;">발생한 알림 없음</td></tr>`;
    return;
  }

  alertTable.innerHTML = alerts.map(v => `
    <tr>
      <td>${v.time}</td>
      <td>${v.vehicle_id}</td>
      <td>${v.location}</td>
      <td class="${getBsiClass(v.bsi)}">${v.bsi.toFixed(2)}</td>
      <td><span class="badge ${getBadgeClass(v.status, v.bsi)}">${v.status}</span></td>
      <td>${v.event}</td>
    </tr>
  `).join("");
}

// ==========================================================================
// 2. Azure Functions SQL 실시간 API 수신 연동 엔진
// ==========================================================================
async function fetchRealTimeApiData() {
  try {
    console.log("Azure SQL API 수신 시작...");

    const response = await fetch("http://localhost:7071/api/GetVehicleDashboard", {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API 응답 오류: ${response.status} / ${errText}`);
    }

    const apiData = await response.json();
    console.log("실시간 API 수신 데이터 세트:", apiData);

    const vehiclesFromApi = apiData.vehicles || [];

    Object.keys(regionData).forEach(key => {
      regionData[key].total = 0;
      regionData[key].normal = 0;
      regionData[key].warning = 0;
      regionData[key].danger = 0;
      regionData[key].avgBsi = "0.00";
      regionData[key].vehicles = [];
    });

    if (vehiclesFromApi.length === 0) {
      updateDashboard();
      return;
    }

    const mappedVehicles = vehiclesFromApi.map(v => {
      const rawStatus = String(v.status || "").toUpperCase();

      let mappedStatus = "정상";
      if (rawStatus === "CRITICAL" || rawStatus === "위험") {
        mappedStatus = "위험";
      } else if (rawStatus === "WARNING" || rawStatus === "경고") {
        mappedStatus = "경고";
      }

      const currentBsi = Number(v.current_bsi) || 0;
      const deltaI = Number(v.delta_i) || 0;
      const deltaV = Number(v.delta_v) || 0;
      const currentTemp = Number(v.temperature) || 0;
      const batteryCurrent = Number(v.battery_current) || 0;
      const thermalStress = Number(v.joule_heating_stress) || 0;

      const rawRegionName = String(v.region_name || "지역 미확인").trim();
      const rawModelName = String(v.model_name || "BMW 모델").trim();

      let lookupRegion = "전국";
      if (rawRegionName) {
        if (rawRegionName.includes("서울")) lookupRegion = "서울특별시";
        else if (rawRegionName.includes("부산")) lookupRegion = "부산광역시";
        else if (rawRegionName.includes("대구")) lookupRegion = "대구광역시";
        else if (rawRegionName.includes("인천")) lookupRegion = "인천광역시";
        else if (rawRegionName.includes("광주")) lookupRegion = "광주광역시";
        else if (rawRegionName.includes("대전")) lookupRegion = "대전광역시";
        else if (rawRegionName.includes("울산")) lookupRegion = "울산광역시";
        else if (rawRegionName.includes("세종")) lookupRegion = "세종특별자치시";
        else if (rawRegionName.includes("경기")) lookupRegion = "경기도";
        else if (rawRegionName.includes("강원")) lookupRegion = "강원특별자치도";
        else if (rawRegionName.includes("충북") || rawRegionName.includes("충청북도")) lookupRegion = "충청북도";
        else if (rawRegionName.includes("충남") || rawRegionName.includes("충청남도")) lookupRegion = "충청남도";
        else if (rawRegionName.includes("전북") || rawRegionName.includes("전라북도")) lookupRegion = "전북특별자치도";
        else if (rawRegionName.includes("전남") || rawRegionName.includes("전라남도")) lookupRegion = "전라남도";
        else if (rawRegionName.includes("경북") || rawRegionName.includes("경상북도")) lookupRegion = "경상북도";
        else if (rawRegionName.includes("경남") || rawRegionName.includes("경상남도")) lookupRegion = "경상남도";
        else if (rawRegionName.includes("제주")) lookupRegion = "제주특별자치도";
      }

      return {
        vehicle_id: v.vehicle_id || "-",
        lat: Number(v.latitude) || 36.3504,
        lng: Number(v.longitude) || 127.3848,
        location: rawRegionName,
        region_search_key: lookupRegion,
        bsi: currentBsi,
        status: mappedStatus,
        event: v.alert_type || "-",
        time: v.received_at ? new Date(v.received_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) : "-",
        model: rawModelName,
        history: [
          Math.max(currentBsi * 0.75, 0),
          Math.max(currentBsi * 0.90, 0),
          Math.max(currentBsi * 0.82, 0),
          currentBsi
        ],
        currents: [deltaI * 0.5, deltaI * 0.8, deltaI],
        voltages: [deltaV * 0.3, deltaV * 0.6, deltaV],
        thermals: [Math.max(currentTemp - 4, 0), Math.max(currentTemp - 2, 0), currentTemp],
        battery_current: batteryCurrent,
        joule_heating_stress: thermalStress
      };
    });

    const regionKeyMap = {
      "서울특별시": "SEOUL", "부산광역시": "BUSAN", "대구광역시": "DAEGU", "인천광역시": "INCHEON",
      "광주광역시": "GWANGJU", "대전광역시": "DAEJEON", "울산광역시": "ULSAN", "세종특별자치시": "SEJONG",
      "경기도": "GYEONGGI", "강원특별자치도": "GANGWON", "충청북도": "CHUNGBUK", "충청남도": "CHUNGNAM",
      "전북특별자치도": "JEONBUK", "전라남도": "JEONNAM", "경상북도": "GYEONGBUK", "경상남도": "GYEONGNAM",
      "제주특별자치도": "JEJU"
    };

    regionData.ALL.vehicles = mappedVehicles;
    applySummaryToRegion("ALL");

    mappedVehicles.forEach(v => {
      const key = regionKeyMap[v.region_search_key];
      if (key && regionData[key]) {
        regionData[key].vehicles.push(v);
      }
    });

    Object.keys(regionData).forEach(key => {
      if (key !== "ALL") {
        applySummaryToRegion(key);
      }
    });

    updateDashboard();

    const monitorBlock = document.getElementById("carMonitoringContentBlock");
    if (monitorBlock && monitorBlock.style.display === "grid") {
      loadCarMonitoringDashboard();
    }

    console.log("SQL DB 기반 실시간 모니터링 동기화 성공");

  } catch (error) {
    console.error("SQL API 연동 실패:", error.message);
  }
}

function applySummaryToRegion(regionKey) {
  const data = regionData[regionKey];
  const vehicles = data.vehicles || [];
  const total = vehicles.length;

  data.total = total;
  data.normal = vehicles.filter(v => v.status === "정상").length;
  data.warning = vehicles.filter(v => v.status === "경고").length;
  data.danger = vehicles.filter(v => v.status === "위험").length;
  data.avgBsi = total > 0
    ? (vehicles.reduce((sum, v) => sum + Number(v.bsi || 0), 0) / total).toFixed(2)
    : "0.00";
  data.threshold = 90;
}

function openModal(type) {
  const modal = document.getElementById("listModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalTable = document.getElementById("modalTable");
  const currentKey = regionSelect.value;
  const vehicles = regionData[currentKey].vehicles || [];

  modal.style.display = "flex";

  if (type === "alert") {
    modalTitle.innerText = `${regionData[currentKey].label} - 실시간 위험 알림 전체 내역`;

    const filtered = vehicles
      .filter(v => v.status !== "정상")
      .sort((a, b) => b.bsi - a.bsi);

    modalTable.innerHTML = `
      <thead>
        <tr>
          <th>시간</th>
          <th>차량 ID</th>
          <th>위치구역</th>
          <th>BSI 지수</th>
          <th>위험 등급</th>
          <th>이상 징후 사유</th>
        </tr>
      </thead>
      <tbody>
        ${
          filtered.length === 0
            ? `<tr><td colspan="6" style="padding:40px; color:#94a3b8; text-align:center;">이상 차량 없음</td></tr>`
            : filtered.map(v => `
              <tr>
                <td>${v.time}</td>
                <td>${v.vehicle_id}</td>
                <td>${v.location}</td>
                <td class="${getBsiClass(v.bsi)}">${v.bsi.toFixed(2)}</td>
                <td><span class="badge ${getBadgeClass(v.status, v.bsi)}">${v.status}</span></td>
                <td>${v.event}</td>
              </tr>
            `).join("")
        }
      </tbody>
    `;
  } else if (type === "top") {
    modalTitle.innerText = `${regionData[currentKey].label} - 위험도 평가 차량 전체 순위`;

    const sorted = [...vehicles].sort((a, b) => b.bsi - a.bsi);

    modalTable.innerHTML = `
      <thead>
        <tr>
          <th>순위</th>
          <th>차량 ID</th>
          <th>위치구역</th>
          <th>BSI 지수</th>
          <th>현재 등급</th>
          <th>발생 이벤트</th>
        </tr>
      </thead>
      <tbody>
        ${
          sorted.length === 0
            ? `<tr><td colspan="6" style="padding:40px; color:#94a3b8; text-align:center;">데이터 없음</td></tr>`
            : sorted.map((v, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${v.vehicle_id}</td>
                <td>${v.location}</td>
                <td class="${getBsiClass(v.bsi)}">${v.bsi.toFixed(2)}</td>
                <td><span class="badge ${getBadgeClass(v.status, v.bsi)}">${v.status}</span></td>
                <td>${v.event || "-"}</td>
              </tr>
            `).join("")
        }
      </tbody>
    `;
  }
}

function closeModal() {
  document.getElementById("listModal").style.display = "none";
}

function updateDashboard() {
  const key = regionSelect.value;
  const data = regionData[key];

  renderMapMarkers(data);
  renderChart(data);
  renderSummary(data);
  renderTables(data.vehicles);
}

document.getElementById("btnZoomFit").addEventListener("click", () => {
  const key = regionSelect.value;
  map.flyTo(regionData[key].center, regionData[key].zoom);
});

regionSelect.addEventListener("change", updateDashboard);

initMap();
updateDashboard();
fetchRealTimeApiData();
setInterval(fetchRealTimeApiData, 60000);

// ==========================================================================
// 3. 멀티 탭 컨트롤러 및 차량 상세 서브 엔진
// ==========================================================================
let detailBsiChart = null;
let subChartI = null;
let subChartV = null;
let subChartT = null;
let selectedVehicleId = "VIN-027";

function changeDashboardTab(targetTab) {
  const mainDash = document.getElementById("mainDashboardContentBlock");
  const carMonitor = document.getElementById("carMonitoringContentBlock");
  const reportDownload = document.getElementById("reportDownloadContentBlock");
  const filterSec = document.getElementById("topRegionFilterSection");
  const btns = document.querySelectorAll(".menu-tab-btn");

  btns.forEach(b => b.classList.remove("active"));

  if (targetTab === "main-dash") {
    btns[0].classList.add("active");
    mainDash.style.display = "grid";
    carMonitor.style.display = "none";
    reportDownload.style.display = "none";
    filterSec.style.visibility = "visible";

    if (map) {
      setTimeout(() => map.invalidateSize(), 50);
    }
  } else if (targetTab === "car-monitor") {
    btns[1].classList.add("active");
    mainDash.style.display = "none";
    carMonitor.style.display = "grid";
    reportDownload.style.display = "none";
    filterSec.style.visibility = "hidden";
    loadCarMonitoringDashboard();
  } else if (targetTab === "report-download") {
    btns[2].classList.add("active");
    mainDash.style.display = "none";
    carMonitor.style.display = "none";
    reportDownload.style.display = "block";
    filterSec.style.visibility = "hidden";
    fetchContainerReportsList();
  }
}

function loadCarMonitoringDashboard() {
  const container = document.getElementById("sidebarVehicleListGroup");
  const list = regionData.ALL.vehicles || [];

  if (list.length === 0) {
    container.innerHTML = `<div style="padding:20px; color:#64748b; text-align:center;">관제 차량 없음</div>`;
    return;
  }

  container.innerHTML = list.map(v => `
    <div class="monitor-v-item ${v.vehicle_id === selectedVehicleId ? "active" : ""}" onclick="selectMonitorVehicle('${v.vehicle_id}')">
      <div>
        <span class="v-id-text">${v.vehicle_id}</span>
        <p class="v-model-text">${v.model}</p>
      </div>
      <div style="text-align:right;">
        <span class="v-bsi-text ${v.status === "위험" || v.status === "CRITICAL" || v.bsi >= 2.5242 ? "red" : "orange"}">${v.bsi.toFixed(2)}</span>
        <p class="badge ${getBadgeClass(v.status, v.bsi)}">${v.status}</p>
      </div>
    </div>
  `).join("");

  const fallbackId = list.length > 0 ? list[0].vehicle_id : selectedVehicleId;
  selectMonitorVehicle(list.some(v => v.vehicle_id === selectedVehicleId) ? selectedVehicleId : fallbackId);
}

function selectMonitorVehicle(id) {
  selectedVehicleId = id;

  document.querySelectorAll(".monitor-v-item").forEach(el => el.classList.remove("active"));

  const items = document.querySelectorAll(".monitor-v-item");
  const list = regionData.ALL.vehicles || [];
  const car = list.find(v => v.vehicle_id === id);

  if (!car) return;

  list.forEach((v, idx) => {
    if (v.vehicle_id === id && items[idx]) {
      items[idx].classList.add("active");
    }
  });

  document.getElementById("detailMetaHeaderCard").innerHTML = `
    <div class="m-stat-box"><span>차량 ID</span><strong>${car.vehicle_id}</strong><p>${car.model}</p></div>
    <div class="m-stat-box"><span>상태</span><strong class="${car.status === "위험" || car.status === "CRITICAL" || car.bsi >= 2.5242 ? "red" : "orange"}">${car.status}</strong></div>
    <div class="m-stat-box"><span>현재 BSI</span><strong>${car.bsi.toFixed(2)}</strong><p class="red">실시간 계측 중</p></div>
    <div class="m-stat-box"><span>위험 원인</span><div style="display:flex; gap:4px; margin-top:4px;"><span class="badge danger">${car.event}</span></div></div>
    <div class="m-stat-box"><span>위치</span><strong>${car.location}</strong></div>
  `;

  document.getElementById("detailCarBottomSpecs").innerHTML = `
    <strong>차량 기본 정보</strong> &nbsp;|&nbsp; 모델: ${car.model} &nbsp;|&nbsp; 구역 권역: ${car.location}
  `;

  document.getElementById("detailLiveEventLogs").innerHTML = `
    <tr>
      <td style="color:#64748b;">${car.time}</td>
      <td><i class="dot ${getBadgeClass(car.status, car.bsi)}-dot" style="width:6px; height:6px; margin-right:4px;"></i> ${car.event}</td>
      <td><span class="badge ${getBadgeClass(car.status, car.bsi)}">${car.status}</span></td>
    </tr>
  `;

  const getTrendHTML = (curr, prev) => {
    if (curr > prev) return `<span style="color:#ef4444; font-weight:bold;">▲ 상승</span>`;
    if (curr < prev) return `<span style="color:#22c55e; font-weight:bold;">▼ 하락</span>`;
    return `<span style="color:#94a3b8;">- 보합</span>`;
  };

  const trendI = getTrendHTML(car.currents[2], car.currents[1]);
  const trendV = getTrendHTML(car.voltages[2], car.voltages[1]);
  const trendT = getTrendHTML(car.thermals[2], car.thermals[1]);

  document.getElementById("detailAnalysisTableBody").innerHTML = `
    <tr>
      <td>전류 변화량 (ΔI)</td>
      <td class="cbd5e1">${Number(car.currents[2]).toFixed(4)} A</td>
      <td><span class="badge normal">정보</span></td>
      <td class="cbd5e1">${trendI}</td>
    </tr>
    <tr>
      <td>전압 변화량 (ΔV)</td>
      <td class="cbd5e1">${Number(car.voltages[2]).toFixed(4)} V</td>
      <td><span class="badge normal">정보</span></td>
      <td class="cbd5e1">${trendV}</td>
    </tr>
    <tr>
      <td>배터리 현재 온도</td>
      <td class="cbd5e1">${Number(car.thermals[2]).toFixed(2)} °C</td>
      <td><span class="badge normal">정보</span></td>
      <td class="cbd5e1">${trendT}</td>
    </tr>
  `;

  renderMonitorCharts(car);
}

function renderMonitorCharts(car) {
  const ctx = document.getElementById("detailBsiLineChart").getContext("2d");

  if (detailBsiChart) detailBsiChart.destroy();

  detailBsiChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["T-3", "T-2", "T-1", "현재수신시각"],
      datasets: [
        {
          data: car.history,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.05)",
          fill: true,
          tension: 0.2,
          borderWidth: 2,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          min: 0,
          max: 2,
          grid: { color: "#1f2937" },
          ticks: { 
            color: "#94a3b8",
            stepSize: 0.5
          }
        },
        x: {
          grid: { color: "#1f2937" },
          ticks: { color: "#94a3b8" }
        }
      }
    }
  });

  document.getElementById("labelValueCurrent").innerText = `${Number(car.currents[2]).toFixed(4)} A`;
  document.getElementById("labelValueVoltage").innerText = `${Number(car.voltages[2]).toFixed(4)} V`;
  document.getElementById("labelValueThermal").innerText = `${Number(car.thermals[2]).toFixed(2)} °C`;

  subChartI = drawSubChartNode("subChartCurrentNode", car.currents, "#a855f7", subChartI);
  subChartV = drawSubChartNode("subChartVoltageNode", car.voltages, "#3b82f6", subChartV);
  subChartT = drawSubChartNode("subChartThermalNode", car.thermals, "#22c55e", subChartT);
}

function drawSubChartNode(canvasId, dataList, strokeColor, chartInstance) {
  const ctx = document.getElementById(canvasId).getContext("2d");

  if (chartInstance) chartInstance.destroy();

  return new Chart(ctx, {
    type: "line",
    data: {
      labels: dataList.map((_, i) => i),
      datasets: [
        {
          data: dataList,
          borderColor: strokeColor,
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
          tension: 0.2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { grid: { display: false }, ticks: { display: false } },
        x: { grid: { display: false }, ticks: { display: false } }
      }
    }
  });
}

function searchMonitorVehicleList() {
  const query = document.getElementById("monitorSearchField").value.toUpperCase();

  document.querySelectorAll(".monitor-v-item").forEach(el => {
    const id = el.querySelector(".v-id-text").innerText.toUpperCase();
    el.style.display = id.includes(query) ? "flex" : "none";
  });
}

async function fetchContainerReportsList() {
  const tbody = document.getElementById("containerReportListTbody");

  try {
    const response = await fetch("http://localhost:7071/api/GetReportList", {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`보고서 목록 API 오류: ${response.status} / ${errText}`);
    }

    const files = await response.json();

    if (!files || files.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 30px; color: #64748b;">
            현재 Word 리포트가 없습니다.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = files.map(f => {
      const formattedDate = new Date(f.createdOn).toLocaleString("ko-KR");
      const isAlert = f.type.includes("이상");

      return `
        <tr style="border-bottom: 1px solid #1f2937;">
          <td style="padding: 12px 16px;">
            <span style="padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: ${isAlert ? "#7f1d1d" : "#064e3b"}; color: ${isAlert ? "#fca5a5" : "#a7f3d0"};">${f.type}</span>
          </td>
          <td style="padding: 12px 16px; font-family: monospace; color: #cbd5e1; font-weight: 500;">${f.fileName}</td>
          <td style="padding: 12px 16px; color: #94a3b8;">${formattedDate}</td>
          <td style="padding: 12px 16px; text-align: center;">
            <a href="${f.downloadUrl}" download style="display: inline-block; padding: 6px 14px; background: #2563eb; color: #fff; border-radius: 4px; font-size: 12px; font-weight: bold;">다운로드 (.DOCX)</a>
          </td>
        </tr>
      `;
    }).join("");

  } catch (error) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 30px; color: #ef4444;">
          동기화 에러: ${error.message}
        </td>
      </tr>
    `;
  }
}

function startRealTimeClock() {
  setInterval(() => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    if (document.getElementById("currentTime")) {
      document.getElementById("currentTime").innerText = `${hours}:${minutes}:${seconds}`;
    }

    if (document.getElementById("currentDate")) {
      document.getElementById("currentDate").innerText = `${year}-${month}-${day}`;
    }
  }, 1000);
}

startRealTimeClock();