
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.8f71eccdb9b344ca976911f6c6565cad',
  appName: 'silent-assassin-tracker',
  webDir: 'dist',
  server: {
    url: 'https://8f71eccd-b9b3-44ca-9769-11f6c6565cad.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: false
    }
  }
};

export default config;
