import { NextResponse } from 'next/server';
import { networkInterfaces } from 'os';

export async function GET() {
  const nets = networkInterfaces();
  let ipLocal = '';
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal && net.address.startsWith('192.168.')) {
        ipLocal = net.address;
        break;
      }
    }
    if (ipLocal) break;
  }
  
  return NextResponse.json({ ip: ipLocal || 'localhost' });
}