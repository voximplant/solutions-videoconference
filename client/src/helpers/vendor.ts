import * as Bowser from 'bowser';
import { useIsMobilePlatform } from '@/hooks/useIsMobile';

let userAgent: Vendor;

function detectVendor(): Vendor {
  const browser = Bowser.getParser(window.navigator.userAgent);

  if (browser.getPlatformType() === 'mobile') userAgent = Vendor.mobile;
  else if (browser.getPlatformType() === 'tablet') userAgent = Vendor.tablet;
  else if (browser.getPlatformType() === 'desktop' && browser.getBrowserName() === 'Safari')
    userAgent = Vendor.safari;
  else if (browser.getPlatformType() === 'desktop' && browser.getBrowserName() === 'Chrome')
    userAgent = Vendor.chrome;
  else userAgent = Vendor.browser;
  return userAgent;
}

export enum Vendor {
  'browser',
  'safari',
  'chrome',
  'mobile',
  'tablet',
}

const canScreen = () => {
  const { isMobilePlatform } = useIsMobilePlatform();
  return !isMobilePlatform;
};

export { canScreen, detectVendor, userAgent };
