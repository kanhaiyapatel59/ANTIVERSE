// Official NDMA Government Debriefing PDF Exporter for District Collectors & Government Authorities

export const exportNDMADebriefPDF = (incidentState = {}, masterPlanText = '') => {
  const incId = incidentState?.incident_id || `INC-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-NDMA`;
  const location = incidentState?.location || 'Mumbai Sector 4 Coastal Zone';
  const timestamp = new Date().toLocaleString();

  const humans = incidentState?.detection?.people_detected || 14;
  const animals = incidentState?.detection?.animals_detected || 2;
  const floodPct = incidentState?.detection?.flood_percentage || 82.5;
  const rescueTeam = incidentState?.route?.best_rescue_team || 'NDRF Battalion 8 - Alpha Rapid Force';
  const shelter = incidentState?.resource?.nearest_shelter || 'St. Xavier Emergency Relief Camp';

  const propertyLoss = (floodPct * 0.03).toFixed(2);
  const reliefBudget = (humans * 1.35).toFixed(2);
  const totalEconomicLoss = (parseFloat(propertyLoss) + parseFloat(reliefBudget) / 100).toFixed(2);

  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) {
    alert('Please allow popups to export the official NDMA Government PDF report.');
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>NDMA OFFICIAL DEBRIEF REPORT - ${incId}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 40px; background: #fff; line-height: 1.5; }
    .header-bar { background: #0f172a; color: #fff; padding: 20px 25px; border-radius: 10px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 25px; }
    .gov-title { font-size: 16px; font-weight: 800; tracking-wide; text-transform: uppercase; }
    .gov-sub { font-size: 11px; opacity: 0.8; margin-top: 4px; }
    .badge-ndma { background: #d97706; color: #fff; padding: 6px 12px; font-weight: 800; border-radius: 6px; font-size: 12px; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
    .meta-table td { padding: 8px 12px; border: 1px solid #e2e8f0; }
    .meta-label { font-weight: 700; color: #64748b; background: #f8fafc; width: 30%; }
    .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #b45309; border-bottom: 2px solid #fde68a; padding-bottom: 4px; margin-top: 25px; margin-bottom: 12px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px; }
    .stat-card { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px; text-center; }
    .stat-val { font-size: 18px; font-weight: 800; color: #92400e; margin-top: 4px; }
    .stat-lbl { font-size: 10px; color: #b45309; text-transform: uppercase; font-weight: 700; }
    .directive-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #d97706; border-radius: 8px; padding: 15px; font-family: monospace; font-size: 12px; white-space: pre-wrap; }
    .signature-area { margin-top: 50px; display: flex; justify-content: space-between; border-top: 2px dashed #cbd5e1; padding-top: 25px; }
    .sig-block { text-align: center; width: 40%; font-size: 11px; font-weight: 700; color: #475569; }
    .sig-line { border-bottom: 1px solid #94a3b8; margin-bottom: 8px; height: 30px; }
  </style>
</head>
<body>
  <div class="header-bar">
    <div>
      <div class="gov-title">NATIONAL DISASTER MANAGEMENT AUTHORITY (NDMA)</div>
      <div class="gov-sub">GOVERNMENT OF INDIA • OFFICIAL DISASTER DEBRIEFING REPORT</div>
    </div>
    <div class="badge-ndma">CONFIDENTIAL</div>
  </div>

  <table class="meta-table">
    <tr>
      <td class="meta-label">INCIDENT RECORD ID</td>
      <td><strong>${incId}</strong></td>
    </tr>
    <tr>
      <td class="meta-label">TARGET DISASTER SECTOR</td>
      <td>${location}</td>
    </tr>
    <tr>
      <td class="meta-label">TIMESTAMP OF DEBRIEF</td>
      <td>${timestamp}</td>
    </tr>
    <tr>
      <td class="meta-label">SEVERITY PRIORITY</td>
      <td><span style="color: #dc2626; font-weight: 800;">P1 CRITICAL EMERGENCY</span></td>
    </tr>
  </table>

  <div class="section-title">📊 FINANCIAL DAMAGE & RELIEF FUND ALLOCATION</div>
  <div class="grid-3">
    <div class="stat-card">
      <div class="stat-lbl">Property Damage</div>
      <div class="stat-val">₹${propertyLoss} Cr</div>
    </div>
    <div class="stat-card">
      <div class="stat-lbl">Relief Camp Budget</div>
      <div class="stat-val">₹${reliefBudget} L</div>
    </div>
    <div class="stat-card">
      <div class="stat-lbl">Total Economic Impact</div>
      <div class="stat-val">₹${totalEconomicLoss} Cr</div>
    </div>
  </div>

  <div class="section-title">🪖 DEPLOYED FORCES & CASUALTY METRICS</div>
  <table class="meta-table">
    <tr>
      <td class="meta-label">Stranded Humans Rescued</td>
      <td><strong>${humans} Individuals</strong></td>
    </tr>
    <tr>
      <td class="meta-label">Livestock Rescued</td>
      <td>${animals} Animals</td>
    </tr>
    <tr>
      <td class="meta-label">Assigned NDRF Battalion</td>
      <td>${rescueTeam}</td>
    </tr>
    <tr>
      <td class="meta-label">Primary Relief Shelter</td>
      <td>${shelter}</td>
    </tr>
  </table>

  <div class="section-title">📜 MASTER DISASTER RESPONSE DIRECTIVE STATEMENT</div>
  <div class="directive-box">${masterPlanText || '1. Deploy NDRF Battalion 8 via High-Ground Bypass.\n2. Allocate water & food rations to St. Xavier Relief Camp.\n3. Broadcast regional loudspeaker alerts & sync CAP v1.2 XML payload.'}</div>

  <div class="signature-area">
    <div class="sig-block">
      <div class="sig-line"></div>
      DISTRICT MAGISTRATE / COLLECTOR<br>CHAIRMAN, SDMA
    </div>
    <div class="sig-block">
      <div class="sig-line"></div>
      DIRECTOR GENERAL<br>NATIONAL DISASTER MANAGEMENT AUTHORITY
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
