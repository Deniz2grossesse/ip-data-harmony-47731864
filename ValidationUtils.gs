// Cache des validations pour éviter les calculs répétitifs
const validationCache = new Map();

function validateIpFormat(ip) {
  if (validationCache.has(`ip_${ip}`)) {
    return validationCache.get(`ip_${ip}`);
  }
  
  const regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  if (!regex.test(ip)) {
    validationCache.set(`ip_${ip}`, false);
    return false;
  }
  
  const parts = ip.split('.');
  const result = parts.every(part => {
    const num = parseInt(part);
    return num >= 0 && num <= 255;
  });
  
  validationCache.set(`ip_${ip}`, result);
  return result;
}

function validateProtocol(protocol) {
  const protocols = ['tcp', 'udp', 'icmp'];
  return protocols.includes(protocol.toLowerCase());
}

function validatePort(port) {
  const portNum = parseInt(port);
  return portNum >= 1 && portNum <= 65000;
}

function validateFourCharField(value) {
  return value.length === 4;
}