// Emergency Scannable QR Code Payload Generator for Civilians & Field NDRF Rescue Teams

export const generateCivilianSOSQRCode = (location = "Mumbai Sector 4", shelter = "St. Xavier Relief Camp", coords = "19.0760, 72.8777") => {
  const sosPayload = `🚨 NDRF OFFICIAL CIVILIAN EVACUATION SOS TICKET
------------------------------------------------
SECTOR: ${location.toUpperCase()}
GPS COORDS: ${coords}
PRIMARY RELIEF CAMP: ${shelter}
RESCUE HELPLINE: 112 / +91-11-24363260 (NDRF HQ)
BOAT SIGNAL PROTOCOL: Wave bright red/yellow cloth for overhead drone & boat rescue units.
------------------------------------------------
AUTHENTICATED BY NDRF SATELLITE DISPATCH`;

  const encodedData = encodeURIComponent(sosPayload);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}&color=0284c7&bgcolor=ffffff`;
};
