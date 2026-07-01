import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.academicguide.yemen',
  appName: 'الدليل الأكاديمي',
  webDir: 'public', // Capacitor requires this folder to exist, even if unused in live mode
  bundledWebRuntime: false,
  server: {
    url: 'https://academic-gauide-m2vz49a0p-rassam.vercel.app/',
    cleartext: true
  }
};

export default config;
