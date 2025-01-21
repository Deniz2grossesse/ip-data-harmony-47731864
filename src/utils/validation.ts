export const validateIpFormat = (ip: string): boolean => {
  const regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  if (!regex.test(ip)) return false;
  
  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part);
    return num >= 0 && num <= 255;
  });
}

export const validateProtocol = (protocol: string): boolean => {
  return ['ssh', 'https', 'ping', 'smtp'].includes(protocol);
}

export const validatePort = (port: number): boolean => {
  return port >= 1 && port <= 65000;
}