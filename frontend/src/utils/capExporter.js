// Common Alerting Protocol (CAP v1.2) XML Official Exporter

export const exportCAPXmlFile = (capPayload = {}) => {
  const identifier = capPayload.identifier || `CAP-DISASTER-${new Date().toISOString().slice(0,10).replace(/-/g,'')}`;
  const sender = capPayload.sender || "NDRF_COMMAND_CENTER@gov.in";
  const sent = capPayload.sent || new Date().toISOString();
  const info = capPayload.info || {};

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>${identifier}</identifier>
  <sender>${sender}</sender>
  <sent>${sent}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>${info.category || "Met"}</category>
    <event>${info.event || "Flash Flood & Inundation Hazard"}</event>
    <urgency>${info.urgency || "Immediate"}</urgency>
    <severity>${info.severity || "Critical"}</severity>
    <certainty>Observed</certainty>
    <headline>${info.headline || "Flash Flood Hazard Warning"}</headline>
    <description>${info.description || "Severe flash flooding active."}</description>
    <instruction>${info.instruction || "Evacuate immediately to designated relief camp."}</instruction>
    <area>
      <areaDesc>${info.area?.areaDesc || "Disaster Sector 4"}</areaDesc>
    </area>
  </info>
</alert>`;

  const dataStr = "data:text/xml;charset=utf-8," + encodeURIComponent(xmlContent);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `${identifier}.xml`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};
