import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.len.len',
  appName: 'app',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    cleartext: true, 
    androidScheme: 'http', 
    
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: [
        "google.com"
      ]
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
